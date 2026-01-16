import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_MONITORING_METRICS } from '@/lib/feature-flags';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function requireAuth(request: NextRequest): Promise<boolean> {
  // Dynamic imports to prevent build-time analysis issues
  const { verifyToken, verifyTokenWithSession } = await import('@/lib/auth-wrapper');
  
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return false;
  
  const useDatabase = process.env.USE_DATABASE === 'true';
  const user = useDatabase 
    ? await verifyTokenWithSession(token)
    : verifyToken(token);
  return user !== null;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Check authentication
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: Export routes should export existing data, not seed new data
  // Seeding should be done via /api/analytics/seed or the main analytics route

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'overview';
  const startDate = searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined;
  const endDate = searchParams.get('endDate') ? parseInt(searchParams.get('endDate')!) : undefined;

  const filters = { startDate, endDate };
  const dateRange = startDate && endDate 
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : startDate 
    ? `From ${formatDate(startDate)}`
    : 'All Time';

  try {
    // Dynamic imports to prevent build-time analysis issues
    const {
      getPageViews,
      getPageViewsByPath,
      getTrafficSources,
      getSessions,
      getSystemMetrics,
      getSystemStats,
      getTimeSeriesData,
    } = await import('@/lib/analytics-wrapper');
    
    // Fetch all data first before creating PDF
    let data: any = {};
    
    console.log('PDF Export - Type:', type, 'Filters:', filters);
    
    switch (type) {
      case 'overview': {
        const pageViews = await getPageViews(filters);
        const uniqueVisitors = new Set(pageViews.map(pv => pv.sessionId)).size;
        const sessions = await getSessions(filters);
        const systemStats = await getSystemStats(filters);
        
        console.log('PDF Export - Overview data:', {
          pageViewsCount: pageViews.length,
          uniqueVisitors,
          sessionsCount: sessions.length,
          systemStats,
        });
        
        data = { pageViews, uniqueVisitors, sessions, systemStats };
        break;
      }

      case 'pages': {
        const pages = await getPageViewsByPath(filters);
        console.log('PDF Export - Pages data:', { pagesCount: pages.length, pages: pages.slice(0, 5) });
        data = { pages };
        break;
      }

      case 'sources': {
        const sources = await getTrafficSources(filters);
        console.log('PDF Export - Sources data:', { sourcesCount: sources.length, sources: sources.slice(0, 5) });
        data = { sources };
        break;
      }

      case 'pageviews': {
        const pageViews = await getPageViews(filters);
        data = { pageViews: pageViews.slice(0, 100) };
        break;
      }

      case 'sessions': {
        const sessions = await getSessions(filters);
        data = { sessions: sessions.slice(0, 100) };
        break;
      }

      case 'system': {
        const metrics = await getSystemMetrics(filters);
        data = { metrics: metrics.slice(0, 100) };
        break;
      }

      case 'timeseries': {
        const interval = searchParams.get('interval') as 'hour' | 'day' | 'week' | undefined;
        const timeseries = await getTimeSeriesData({ ...filters, interval: interval || 'day' });
        data = { timeseries };
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    // Now create PDF with the fetched data
    // Use dynamic import to avoid font loading during module initialization
    const PDFDocument = (await import('pdfkit')).default;
    const pathModule = (await import('path')).default;
    const fsModule = (await import('fs')).default;
    
    // CRITICAL: Copy PDFKit fonts to expected location BEFORE creating document
    // PDFKit needs its font metric files (.afm) to be accessible
    // The error shows it's looking in .next\server\vendor-chunks\data\
    const targetFontDir = pathModule.join(process.cwd(), '.next', 'server', 'vendor-chunks', 'data');
    
    try {
      // require.resolve('pdfkit') resolves to a JS file, not the package root
      // We need to find the package root directory
      const pdfkitPath = require.resolve('pdfkit');
      let pdfkitDir = pathModule.dirname(pdfkitPath);
      
      // If we're in the js/ directory, go up to the package root
      if (pathModule.basename(pdfkitDir) === 'js') {
        pdfkitDir = pathModule.dirname(pdfkitDir);
      }
      
      const fontSourceDir = pathModule.join(pdfkitDir, 'js', 'data');
      console.log('PDFKit package dir:', pdfkitDir);
      console.log('Font source dir:', fontSourceDir);
      
      if (fsModule.existsSync(fontSourceDir)) {
        // Ensure target directory exists
        fsModule.mkdirSync(targetFontDir, { recursive: true });
        
        // Copy ALL font files (including Helvetica.afm)
        const fontFiles = fsModule.readdirSync(fontSourceDir).filter((f: string) => f.endsWith('.afm'));
        console.log(`Found ${fontFiles.length} font files to copy`);
        
        for (const file of fontFiles) {
          const source = pathModule.join(fontSourceDir, file);
          const target = pathModule.join(targetFontDir, file);
          try {
            fsModule.copyFileSync(source, target);
            console.log(`Copied font: ${file}`);
          } catch (copyError: any) {
            console.error(`Failed to copy ${file}:`, copyError.message);
          }
        }
        
        // Verify critical font file exists
        const helveticaPath = pathModule.join(targetFontDir, 'Helvetica.afm');
        if (fsModule.existsSync(helveticaPath)) {
          console.log('✓ Helvetica.afm verified at target location');
        } else {
          console.warn('⚠ Helvetica.afm NOT found at target location - PDFKit may fail');
        }
        
        console.log(`Fonts copied to: ${targetFontDir}`);
      } else {
        console.warn('PDFKit font source directory not found:', fontSourceDir);
      }
    } catch (fontSetupError: any) {
      console.error('Font setup error:', fontSetupError.message);
    }
    
    // Try to use a system TTF font FIRST to avoid PDFKit's AFM font loading issues
    // TTF fonts don't require metric files, so they're more reliable
    let systemFontPath: string | null = null;
    const systemFontPaths = [
      'C:\\Windows\\Fonts\\arial.ttf',
      'C:\\Windows\\Fonts\\Arial.ttf',
      'C:\\Windows\\Fonts\\calibri.ttf',
      'C:\\Windows\\Fonts\\Calibri.ttf',
    ];
    
    // Find an available system font
    for (const fontPath of systemFontPaths) {
      if (fsModule.existsSync(fontPath)) {
        systemFontPath = fontPath;
        console.log('Found system font:', fontPath);
        break;
      }
    }
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
    });
    
    // Register and use system font if available
    if (systemFontPath) {
      try {
        doc.registerFont('SystemFont', systemFontPath);
        doc.font('SystemFont'); // Set it immediately
        console.log('Using system TTF font:', systemFontPath);
      } catch (fontError: any) {
        console.error('Failed to register system font:', fontError.message);
        // Continue without system font - PDFKit will use defaults (fonts should be copied now)
      }
    } else {
      console.log('No system font found, PDFKit will use default fonts (should be copied above)');
    }
    
    const chunks: Buffer[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    // Handle errors during PDF generation
    doc.on('error', (error: Error) => {
      console.error('PDF generation error:', error);
      throw error; // Re-throw to be caught by outer try-catch
    });
    
    // Generate PDF content - wrap in try-catch to handle any font errors
    try {
      // Ensure system font is set before any text operations
      // This prevents PDFKit from trying to load default fonts
      if (systemFontPath) {
        doc.font('SystemFont');
      }
      
      // Header
      doc.fontSize(20).text('Analytics Report', { align: 'center' });
      doc.fontSize(12).text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, { align: 'center' });
      doc.fontSize(10).text(`Date Range: ${dateRange}`, { align: 'center' });
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

        // Generate PDF content based on type
      switch (type) {
        case 'overview': {
          const { pageViews, uniqueVisitors, sessions, systemStats } = data;
          doc.fontSize(16).text('Overview Metrics', { underline: true });
          doc.moveDown();
          doc.fontSize(12);
          doc.text(`Total Page Views: ${pageViews.length}`, { indent: 20 });
          doc.text(`Unique Visitors: ${uniqueVisitors}`, { indent: 20 });
          doc.text(`Total Sessions: ${sessions.length}`, { indent: 20 });
          doc.text(`Avg Page Views per Session: ${sessions.length > 0 ? (pageViews.length / sessions.length).toFixed(2) : 0}`, { indent: 20 });
          doc.moveDown();
          
          doc.fontSize(16).text('System Metrics', { underline: true });
          doc.moveDown();
          doc.fontSize(12);
          doc.text(`Total API Requests: ${systemStats.totalRequests}`, { indent: 20 });
          doc.text(`Average Response Time: ${systemStats.averageResponseTime}ms`, { indent: 20 });
          doc.text(`Error Rate: ${systemStats.errorRate}%`, { indent: 20 });
          doc.moveDown();
          
          if (Object.keys(systemStats.statusCodes).length > 0) {
            doc.fontSize(14).text('Status Code Distribution', { underline: true });
            doc.moveDown();
            doc.fontSize(10);
            Object.entries(systemStats.statusCodes).forEach(([code, count]) => {
              doc.text(`${code}: ${count} requests`, { indent: 20 });
            });
          }
          break;
        }

        case 'pages': {
          const { pages } = data;
          doc.fontSize(16).text('Page Views by Path', { underline: true });
          doc.moveDown();
          doc.fontSize(10);
          pages.forEach((page: any, index: number) => {
            doc.text(`${index + 1}. ${page.path}: ${page.count} views`, { indent: 20 });
            if ((index + 1) % 30 === 0) doc.addPage();
          });
          break;
        }

        case 'sources': {
          const { sources } = data;
          doc.fontSize(16).text('Traffic Sources', { underline: true });
          doc.moveDown();
          doc.fontSize(10);
          sources.forEach((source: any, index: number) => {
            doc.text(`${index + 1}. ${source.source}: ${source.count} visits`, { indent: 20 });
            if ((index + 1) % 30 === 0) doc.addPage();
          });
          break;
        }

        case 'pageviews': {
          const { pageViews } = data;
          doc.fontSize(16).text('Page Views (Recent 100)', { underline: true });
          doc.moveDown();
          doc.fontSize(9);
          pageViews.forEach((pv: any, index: number) => {
            doc.text(`${index + 1}. ${formatDate(pv.timestamp)} - ${pv.path}`, { indent: 20 });
            doc.text(`   Session: ${pv.sessionId.substring(0, 20)}... | IP: ${pv.ip}`, { indent: 30 });
            if ((index + 1) % 25 === 0) doc.addPage();
          });
          break;
        }

        case 'sessions': {
          const { sessions } = data;
          doc.fontSize(16).text('Sessions (Recent 100)', { underline: true });
          doc.moveDown();
          doc.fontSize(9);
          sessions.forEach((s: any, index: number) => {
            doc.text(`${index + 1}. Started: ${formatDate(s.startTime)}`, { indent: 20 });
            doc.text(`   Last Activity: ${formatDate(s.lastActivity)} | Views: ${s.pageViews}`, { indent: 30 });
            if ((index + 1) % 25 === 0) doc.addPage();
          });
          break;
        }

        case 'system': {
          const { metrics } = data;
          doc.fontSize(16).text('System Metrics (Recent 100)', { underline: true });
          doc.moveDown();
          doc.fontSize(9);
          metrics.forEach((m: any, index: number) => {
            doc.text(`${index + 1}. ${formatDate(m.timestamp)} - ${m.method} ${m.path}`, { indent: 20 });
            doc.text(`   Status: ${m.statusCode} | Response Time: ${m.responseTime}ms`, { indent: 30 });
            if (m.error) doc.text(`   Error: ${m.error}`, { indent: 30 });
            if ((index + 1) % 25 === 0) doc.addPage();
          });
          break;
        }

        case 'timeseries': {
          const { timeseries } = data;
          doc.fontSize(16).text('Page Views Over Time', { underline: true });
          doc.moveDown();
          doc.fontSize(10);
          timeseries.forEach((t: any) => {
            doc.text(`${t.date}: ${t.count} views`, { indent: 20 });
          });
          break;
        }
      }

      doc.end();
    } catch (pdfError: any) {
      // If PDF generation fails due to font errors, provide helpful error message
      console.error('PDF generation error:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError.message}. This may be due to font configuration issues.`);
    }

    // Wait for PDF to finish generating
    await new Promise<void>((resolve) => {
      doc.on('end', resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics-${type}-${timestamp}.pdf`;

    const duration = Date.now() - startTime;
    // Performance tracking (optional, non-blocking)
    if (FEATURE_MONITORING_METRICS) {
      try {
        const { trackPerformanceMetric } = await import('@/lib/monitoring');
        trackPerformanceMetric('export_pdf_duration', duration, 'ms', {
          type,
          success: true,
          contentLength: pdfBuffer.length,
        });
      } catch (error) {
        // Silently fail - monitoring should not break exports
        console.warn('Failed to track performance metric:', error);
      }
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    // Performance tracking (optional, non-blocking)
    if (FEATURE_MONITORING_METRICS) {
      try {
        const { trackPerformanceMetric } = await import('@/lib/monitoring');
        trackPerformanceMetric('export_pdf_duration', duration, 'ms', {
          type,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      } catch (trackError) {
        // Silently fail - monitoring should not break error handling
        console.warn('Failed to track performance metric:', trackError);
      }
    }
    
    console.error('PDF export error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      path: (error as any)?.path,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating PDF';
    
    // Provide helpful error message for font-related errors
    let userMessage = errorMessage;
    if (errorMessage.includes('ENOENT') || errorMessage.includes('.afm') || errorMessage.includes('font')) {
      userMessage = 'PDF generation failed due to font configuration. Please check server logs for details.';
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: errorMessage,
          code: (error as any)?.code,
          path: (error as any)?.path,
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

