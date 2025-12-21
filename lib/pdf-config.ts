// PDFKit configuration helper for Next.js
// This ensures PDFKit works properly in Next.js serverless environment

/**
 * Creates a PDFDocument instance configured for Next.js
 * Uses dynamic import to avoid font loading issues during module initialization
 */
export async function createPDFDocument(options?: any) {
  // Use dynamic import to load PDFKit only when needed
  // This prevents font file loading errors during module initialization
  const PDFDocument = (await import('pdfkit')).default;
  
  // Create PDF with default settings
  // PDFKit uses embedded fonts by default, so we don't need to set fonts explicitly
  const doc = new PDFDocument({
    margin: 50,
    autoFirstPage: true,
    ...options,
  });

  // Don't explicitly set font - PDFKit will use its default embedded font
  // This prevents the ENOENT error for missing font files
  
  return doc;
}

