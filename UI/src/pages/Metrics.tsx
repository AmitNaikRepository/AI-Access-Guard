import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import PageMeta from '../components/common/PageMeta';
import { DollarLineIcon, PieChartIcon, CheckCircleIcon, GridIcon } from '../icons';

interface MetricsData {
  total_queries: number;
  cache_hits: number;
  api_calls: number;
  cache_hit_rate_percent: number;
  total_cost: number;
  money_saved: number;
  queries_last_24h: number;
  queries_last_hour: number;
  avg_tokens_per_query: number;
  total_tokens_used: number;
  cost_breakdown: Record<string, {
    queries: number;
    tokens: number;
    cost: number;
  }>;
}

interface HourlyData {
  [key: string]: {
    total: number;
    cache_hits: number;
    api_calls: number;
    tokens: number;
  };
}

type TimeRange = 'daily' | 'monthly';

export default function Metrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData>({});
  const [monthlyData, setMonthlyData] = useState<HourlyData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demoDataLoaded, setDemoDataLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  
  // Use ref to always have current timeRange value in interval
  const timeRangeRef = useRef<TimeRange>(timeRange);
  
  // Update ref when timeRange changes
  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

  const fetchMetrics = async (range: TimeRange) => {
    try {
      // Fetch main metrics with range parameter
      const metricsRes = await axios.get<{ metrics: MetricsData }>(`http://localhost:8000/metrics?range=${range}`);
      
      // Fetch chart data based on range
      if (range === 'daily') {
        const hourlyRes = await axios.get<{ data: HourlyData }>('http://localhost:8000/metrics/hourly?hours=24');
        if (hourlyRes.data.data) {
          setHourlyData(hourlyRes.data.data);
        }
      } else {
        const monthlyRes = await axios.get<{ data: HourlyData }>('http://localhost:8000/metrics/monthly?days=30');
        if (monthlyRes.data.data) {
          setMonthlyData(monthlyRes.data.data);
        }
      }

      // Update metrics state
      if (metricsRes.data.metrics) {
        setMetrics(metricsRes.data.metrics);
      }

      setError(null);
    } catch (err) {
      console.error('Metrics fetch error:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to fetch metrics');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize metrics once
  useEffect(() => {
    const initializeMetrics = async () => {
      try {
        const checkRes = await axios.get<{ metrics: MetricsData }>('http://localhost:8000/metrics?range=monthly');

        if (checkRes.data.metrics.total_queries === 0) {
          await axios.post('http://localhost:8000/seed-demo-data');
          setDemoDataLoaded(true);
        }

        await fetchMetrics('monthly');
        await fetchMetrics('daily');
        await fetchMetrics('monthly');

      } catch (err) {
        console.error('Failed to initialize:', err);
        setLoading(false);
      }
    };

    initializeMetrics();
  }, []);

  // Separate useEffect for auto-refresh that uses ref
  useEffect(() => {
    const interval = setInterval(() => {
      // Use ref to get current value, not captured value
      fetchMetrics(timeRangeRef.current);
    }, 5000);

    return () => clearInterval(interval);
  }, []); // Empty deps OK because we use ref

  // When time range changes, fetch new metrics immediately
  const handleTimeRangeChange = async (range: TimeRange) => {
    setTimeRange(range);
    await fetchMetrics(range);
  };

  // Prepare chart data
  const getChartData = (): { options: ApexOptions; series: any[] } => {
    const data = timeRange === 'daily' ? hourlyData : monthlyData;
    const keys = Object.keys(data || {}).sort();

    const options: ApexOptions = {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 4,
        colors: ['#10B981', '#3B82F6'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 6 },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      colors: ['#10B981', '#3B82F6'],
      xaxis: {
        categories: keys.map((k) => {
          const date = new Date(k);
          if (timeRange === 'daily') {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }),
        labels: {
          style: { colors: '#6B7280' },
          rotate: -45,
          rotateAlways: false,
        },
      },
      yaxis: {
        labels: { style: { colors: '#6B7280' } },
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 4,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: '#6B7280' },
      },
      tooltip: {
        theme: 'light',
        x: {
          format: timeRange === 'daily' ? 'dd MMM HH:mm' : 'dd MMM yyyy',
        },
      },
    };

    const series = [
      {
        name: 'Cache Hits',
        data: keys.map((key) => data[key]?.cache_hits || 0),
      },
      {
        name: 'API Calls',
        data: keys.map((key) => data[key]?.api_calls || 0),
      },
    ];

    return { options, series };
  };

  const chartData = metrics ? getChartData() : { options: {} as ApexOptions, series: [] };
  const { options: chartOptions, series: chartSeries } = chartData;

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 80) return 'from-green-500 to-emerald-600';
    if (rate >= 50) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getCacheHitRateTextColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">{error || 'No metrics available'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Metrics | Cost Tracking & ROI" />
      <div className="min-h-screen">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Metrics & ROI Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time cost tracking and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-refreshing
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cache Hit Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${getCacheHitRateColor(metrics.cache_hit_rate_percent)}`}>
                <PieChartIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Cache Performance</span>
            </div>
            <h3 className={`text-3xl font-bold mb-1 ${getCacheHitRateTextColor(metrics.cache_hit_rate_percent)}`}>
              {metrics.cache_hit_rate_percent.toFixed(1)}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cache Hit Rate
            </p>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {metrics.cache_hits.toLocaleString()} hits / {metrics.total_queries.toLocaleString()} queries
            </div>
          </div>

          {/* Money Saved */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <DollarLineIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Cost Savings</span>
            </div>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              💰 ${metrics.money_saved.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Money Saved
            </p>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Total spent: ${metrics.total_cost.toFixed(4)}
            </div>
          </div>

          {/* API Calls Saved */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">API Efficiency</span>
            </div>
            <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {metrics.cache_hits.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              API Calls Saved
            </p>
            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
              {metrics.api_calls.toLocaleString()} actual API calls
            </div>
          </div>

          {/* Total Queries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <GridIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Activity</span>
            </div>
            <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {metrics.total_queries.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Queries
            </p>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {timeRange === 'daily' ? 'Last 24h' : 'Last 30 days'}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Query Activity
            </h2>
            {/* Time Range Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => handleTimeRangeChange('daily')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === 'daily'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Last 24 Hours
              </button>
              <button
                onClick={() => handleTimeRangeChange('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === 'monthly'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Last Month
              </button>
            </div>
          </div>

          {/* Savings Display */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {timeRange === 'daily' ? 'Daily Savings' : 'Monthly Savings'}:
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                💰 ${metrics.money_saved.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total spent: ${metrics.total_cost.toFixed(4)} • Cache hit rate: {metrics.cache_hit_rate_percent.toFixed(1)}%
            </p>
          </div>

          {chartSeries.length > 0 && (
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={350}
            />
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Token Usage
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Tokens Used</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.total_tokens_used.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Avg Tokens per Query</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {metrics.avg_tokens_per_query.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cost Breakdown by Model
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics.cost_breakdown).length > 0 ? (
                Object.entries(metrics.cost_breakdown).map(([model, data]) => (
                  <div key={model} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {model}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${data.cost.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{data.queries} queries</span>
                      <span>{data.tokens.toLocaleString()} tokens</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No API calls made yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Demo Data Badge */}
        {demoDataLoaded && (
          <div className="fixed bottom-6 right-6">
            <div className="bg-gray-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Demo Data
            </div>
          </div>
        )}
      </div>
    </>
  );
}
