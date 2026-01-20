import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { BarChart3, RefreshCw, AlertCircle, CheckCircle, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import companyService from "../services/companyService";

const fallbackSeries = [
  { month: "Aug", views: 120, inquiries: 6 },
  { month: "Sep", views: 180, inquiries: 9 },
  { month: "Oct", views: 260, inquiries: 14 },
  { month: "Nov", views: 310, inquiries: 18 },
  { month: "Dec", views: 420, inquiries: 24 },
  { month: "Jan", views: 510, inquiries: 31 },
];

// Format large numbers with commas
const formatNumber = (num) => {
  if (num === undefined || num === null || num === "—") return num;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format percentage values
const formatPercentage = (value) => {
  if (value === undefined || value === null || value === "—") return value;
  if (typeof value === "number") return `${value}%`;
  return value;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await companyService.getAnalytics();
      setApiMessage(res?.message || "");
      setAnalytics(res?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load analytics");
      console.error("Analytics load error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const metrics = useMemo(() => {
    const m = analytics?.metrics || {};
    return [
      { 
        label: "Profile Completion", 
        value: formatPercentage(m.profile_completion), 
        hint: "Keep your profile updated",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        color: "text-green-600"
      },
      { 
        label: "Company Views", 
        value: formatNumber(m.company_views), 
        hint: "Total views over selected period",
        icon: <Users className="w-5 h-5 text-blue-600" />,
        color: "text-blue-600"
      },
      { 
        label: "Inquiries", 
        value: formatNumber(m.inquiries_received), 
        hint: "Total inquiries received",
        icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
        color: "text-purple-600"
      },
      { 
        label: "Response Rate", 
        value: formatPercentage(m.response_rate), 
        hint: "Based on responded inquiries",
        icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
        color: "text-amber-600"
      },
    ];
  }, [analytics]);

  const series = useMemo(() => {
    const s = analytics?.series;
    return Array.isArray(s) && s.length ? s : fallbackSeries;
  }, [analytics]);

  // Calculate trends
  const trends = useMemo(() => {
    if (!series || series.length < 2) return null;
    
    const last = series[series.length - 1];
    const secondLast = series[series.length - 2];
    
    const viewsTrend = last.views - secondLast.views;
    const inquiriesTrend = last.inquiries - secondLast.inquiries;
    
    return {
      views: {
        value: viewsTrend,
        direction: viewsTrend >= 0 ? 'up' : 'down',
        percentage: secondLast.views > 0 
          ? Math.round((viewsTrend / secondLast.views) * 100) 
          : 0
      },
      inquiries: {
        value: inquiriesTrend,
        direction: inquiriesTrend >= 0 ? 'up' : 'down',
        percentage: secondLast.inquiries > 0 
          ? Math.round((inquiriesTrend / secondLast.inquiries) * 100) 
          : 0
      }
    };
  }, [series]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Views: <span className="font-bold">{formatNumber(payload[0].value)}</span>
            </p>
            <p className="text-sm text-cyan-600">
              Inquiries: <span className="font-bold">{formatNumber(payload[1].value)}</span>
            </p>
            {trends && (
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
                Compared to previous month
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend for chart
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-2">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout id="Analytics">
      {/* Header with refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your company profile performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium min-w-[120px]"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Status banner */}
      {apiMessage && (
        <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-blue-50 border-blue-500 text-blue-800">
          <BarChart3 className="mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1 text-sm">{apiMessage}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3 bg-red-50 border-red-500 text-red-800">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Error loading analytics</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="rounded-xl p-5 border shadow-sm bg-white border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`text-sm font-medium ${metric.color}`}>
                {metric.label}
              </div>
              {metric.icon}
            </div>
            <div className={`text-2xl sm:text-3xl font-bold mb-2 ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
              {metric.hint}
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="rounded-xl p-6 border shadow-sm bg-white border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Engagement Trend</h3>
            <p className="text-sm text-gray-600 mt-1">Monthly views and inquiries over time</p>
          </div>
          
          {trends && (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  trends.views.direction === 'up' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {trends.views.direction === 'up' ? '↑' : '↓'} 
                  {Math.abs(trends.views.percentage)}% views
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  trends.inquiries.direction === 'up' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {trends.inquiries.direction === 'up' ? '↑' : '↓'} 
                  {Math.abs(trends.inquiries.percentage)}% inquiries
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        ) : series.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">No analytics data available</p>
            <p className="text-sm text-gray-500">Data will appear as your profile gets traffic</p>
          </div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={series} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                  name="Views"
                />
                <Line 
                  type="monotone" 
                  dataKey="inquiries" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#06b6d4' }}
                  name="Inquiries"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Quality Note */}
      <div className="text-sm text-gray-500 text-center">
        <p>
          Data updates automatically. 
          {analytics?.last_updated && ` Last updated: ${analytics.last_updated}`}
        </p>
      </div>
    </DashboardLayout>
  );
}