'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import MetricCard from '@/components/dashboard/MetricCard';
import LineChart from '@/components/dashboard/LineChart';
import BarChart from '@/components/dashboard/BarChart';
import DataTable from '@/components/dashboard/DataTable';

interface OverviewData {
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  averagePageViewsPerSession: number;
  systemStats: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    statusCodes: Record<number, number>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pageViewsData, setPageViewsData] = useState<Array<{ date: string; count: number }>>([]);
  const [pagesData, setPagesData] = useState<Array<{ path: string; count: number }>>([]);
  const [sourcesData, setSourcesData] = useState<Array<{ source: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'sources' | 'system'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const getDateRange = () => {
    const now = Date.now();
    const ranges = {
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
      '90d': now - 90 * 24 * 60 * 60 * 1000,
    };
    return ranges[dateRange];
  };

  const fetchData = async () => {
    try {
      const startDate = getDateRange();
      
      // Fetch overview
      const overviewRes = await fetch(`/api/analytics?type=overview&startDate=${startDate}`);
      if (!overviewRes.ok) {
        const errorData = await overviewRes.json().catch(() => ({ error: 'Failed to fetch overview' }));
        throw new Error(errorData.error || `HTTP ${overviewRes.status}`);
      }
      const overviewData = await overviewRes.json();
      setOverview(overviewData);

      // Fetch time series
      const timeseriesRes = await fetch(`/api/analytics?type=timeseries&startDate=${startDate}&interval=day`);
      if (!timeseriesRes.ok) {
        console.error('Failed to fetch timeseries:', timeseriesRes.status);
      } else {
        const timeseriesData = await timeseriesRes.json();
        setPageViewsData(timeseriesData.data || []);
      }

      // Fetch pages
      const pagesRes = await fetch(`/api/analytics?type=pages&startDate=${startDate}`);
      if (!pagesRes.ok) {
        console.error('Failed to fetch pages:', pagesRes.status);
      } else {
        const pagesDataRes = await pagesRes.json();
        setPagesData(pagesDataRes.data || []);
      }

      // Fetch sources
      const sourcesRes = await fetch(`/api/analytics?type=sources&startDate=${startDate}`);
      if (!sourcesRes.ok) {
        console.error('Failed to fetch sources:', sourcesRes.status);
      } else {
        const sourcesDataRes = await sourcesRes.json();
        setSourcesData(sourcesDataRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error to prevent UI crashes
      setOverview(null);
      setPageViewsData([]);
      setPagesData([]);
      setSourcesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleDownload = async (format: 'csv' | 'pdf') => {
    try {
      const startDate = getDateRange();
      const type = activeTab === 'overview' ? 'overview' : activeTab;
      const url = `/api/analytics/export/${format}?type=${type}&startDate=${startDate}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Download failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Check content type to ensure we got the right format
      const contentType = response.headers.get('Content-Type');
      if (format === 'pdf' && !contentType?.includes('application/pdf')) {
        // Might be an error response
        const errorData = await response.json().catch(() => null);
        if (errorData?.error) {
          throw new Error(errorData.error);
        }
      }

      const blob = await response.blob();
      
      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `analytics-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download report. Please try again.';
      alert(`Download failed: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-700 font-semibold text-lg">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
                  Operations & Analytics Dashboard
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1">
                  Real-time website metrics and system performance
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                  className="px-3 sm:px-4 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:border-blue-400 transition-colors w-full sm:w-auto"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload('csv')}
                    className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-green-600 transition-colors shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-1"
                    title="Download CSV Report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md whitespace-nowrap flex items-center gap-1"
                    title="Download PDF Report"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-red-600 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Tabs */}
          <div className="mb-4 sm:mb-6 border-b-2 border-slate-200 bg-white rounded-t-lg">
            <nav className="flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto">
              {(['overview', 'pages', 'sources', 'system'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 sm:py-4 px-4 sm:px-6 md:px-8 border-b-2 font-bold text-sm sm:text-base transition-colors whitespace-nowrap flex-shrink-0 min-w-fit ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-4 sm:space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard
                  title="Total Page Views"
                  value={overview.pageViews}
                  subtitle={`${dateRange} period`}
                  icon={<span>👁️</span>}
                />
                <MetricCard
                  title="Unique Visitors"
                  value={overview.uniqueVisitors}
                  subtitle="Distinct sessions"
                  icon={<span>👥</span>}
                />
                <MetricCard
                  title="Total Sessions"
                  value={overview.sessions}
                  subtitle={`Avg ${overview.averagePageViewsPerSession.toFixed(1)} pages/session`}
                  icon={<span>📊</span>}
                />
                <MetricCard
                  title="Avg Response Time"
                  value={`${overview.systemStats.averageResponseTime}ms`}
                  subtitle={`${overview.systemStats.errorRate.toFixed(2)}% error rate`}
                  icon={<span>⚡</span>}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <LineChart
                  data={pageViewsData}
                  title="Page Views Over Time"
                  color="#3b82f6"
                />
                <BarChart
                  data={pagesData.slice(0, 10)}
                  title="Top 10 Pages"
                  dataKey="path"
                  color="#8b5cf6"
                />
              </div>

              {/* System Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <MetricCard
                  title="Total API Requests"
                  value={overview.systemStats.totalRequests}
                  subtitle="System requests"
                />
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">Status Codes</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {Object.entries(overview.systemStats.statusCodes).map(([code, count]) => (
                      <div key={code} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors">
                        <span className="text-slate-700 font-semibold">{code}</span>
                        <span className="text-blue-600 font-bold text-lg">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-4 sm:space-y-6">
              <BarChart
                data={pagesData}
                title="Page Views by Path"
                dataKey="path"
                color="#3b82f6"
              />
              <DataTable
                title="Page Views Details"
                headers={['Path', 'Views']}
                data={pagesData.map(p => ({ path: p.path, Views: p.count }))}
                keyField="path"
              />
            </div>
          )}

          {/* Sources Tab */}
          {activeTab === 'sources' && (
            <div className="space-y-4 sm:space-y-6">
              <BarChart
                data={sourcesData}
                title="Traffic Sources"
                dataKey="source"
                color="#8b5cf6"
              />
              <DataTable
                title="Traffic Sources Details"
                headers={['Source', 'Visits']}
                data={sourcesData.map(s => ({ source: s.source, Visits: s.count }))}
                keyField="source"
              />
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && overview && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <MetricCard
                  title="Total Requests"
                  value={overview.systemStats.totalRequests}
                />
                <MetricCard
                  title="Avg Response Time"
                  value={`${overview.systemStats.averageResponseTime}ms`}
                />
                <MetricCard
                  title="Error Rate"
                  value={`${overview.systemStats.errorRate}%`}
                  trend={{
                    value: overview.systemStats.errorRate,
                    isPositive: overview.systemStats.errorRate < 5,
                  }}
                />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200 hover:shadow-xl transition-shadow">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-3 sm:mb-4">Status Code Distribution</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(overview.systemStats.statusCodes).map(([code, count]) => (
                    <div key={code} className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                      <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{code}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">{count as number} requests</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

