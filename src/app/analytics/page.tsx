'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TherapistLayout } from '@/components/TherapistLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TimeRangeToggle } from '@/components/analytics/TimeRangeToggle';
import { StatCard } from '@/components/analytics/StatCard';
import { LineChartCard } from '@/components/analytics/LineChartCard';
import { DonutChartCard } from '@/components/analytics/DonutChartCard';
import { FunnelChartCard } from '@/components/analytics/FunnelChartCard';
import { RiskCard } from '@/components/analytics/RiskCard';
import { getMockAnalytics, type TimeRange } from '@/lib/mockAnalytics';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('SUDS');
  const [analyticsData, setAnalyticsData] = useState(getMockAnalytics('30d'));

  useEffect(() => {
    // Verify auth on mount
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load analytics data for selected time range
    setAnalyticsData(getMockAnalytics(timeRange));
    setLoading(false);
  }, [router, timeRange]);

  useEffect(() => {
    // Update data when time range changes
    setAnalyticsData(getMockAnalytics(timeRange));
  }, [timeRange]);

  if (loading) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <LoadingSpinner size={48} />
        </div>
      </TherapistLayout>
    );
  }

  const { summary, outcomes, funnel, modalities, worksheetImpact, risk, insights } = analyticsData;

  // Determine trend for completion rate
  const completionTrend = summary.completionChange > 0 ? 'up' : summary.completionChange < 0 ? 'down' : 'neutral';
  
  // Determine trend for days since last entry (lower is better, so negative change is up)
  const daysTrend = summary.daysChange < 0 ? 'up' : summary.daysChange > 0 ? 'down' : 'neutral';

  // Metric selector for outcomes chart
  const metricOptions = Object.keys(outcomes);
  const MetricSelector = (
    <div className="inline-flex rounded-lg border border-step-border dark:border-step-dark-border bg-step-surface dark:bg-step-dark-surface p-1">
      {metricOptions.map((metric) => (
        <button
          key={metric}
          onClick={() => setSelectedMetric(metric)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
            selectedMetric === metric
              ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white'
              : 'text-step-text-muted dark:text-step-dark-text-muted hover:text-step-text-main dark:hover:text-step-dark-text-main'
          }`}
        >
          {metric}
        </button>
      ))}
    </div>
  );

  return (
    <TherapistLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main tracking-tight mb-2">
              Analytics
            </h1>
            <p className="text-sm text-step-text-muted">
              Big-picture trends across your caseload.
            </p>
          </div>
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Row 1 - Caseload Health Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Avg homework completion"
            value={`${summary.avgCompletionRate}%`}
            change={Math.abs(summary.completionChange)}
            trend={completionTrend}
            subtext={`vs ${summary.avgCompletionRate - summary.completionChange}% last period`}
          />
          <StatCard
            title="Avg entries per active client"
            value={summary.avgEntriesPerClient.toFixed(1)}
            subtext={`Homework entries in selected range / active clients`}
          />
          <StatCard
            title="Clients showing improvement"
            value={`${summary.clientsImproving} / ${summary.clientsTotal}`}
            subtext="Clients with improving key metrics (SUDS, belief ratings, urges, etc.)"
          />
          <StatCard
            title="Avg days since last entry"
            value={`${summary.avgDaysSinceLastEntry.toFixed(1)} days`}
            change={Math.abs(summary.daysChange)}
            trend={daysTrend}
            subtext="Lower is better – how 'fresh' your caseload is"
          />
        </div>

        {/* Row 2 - Outcomes over time and Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          <div className="lg:col-span-2">
            <LineChartCard
              title="Outcomes over time"
              subtitle="Average change in key metrics by week"
              data={outcomes[selectedMetric] || []}
              metricSelector={MetricSelector}
              legend="Avg change from start of worksheet"
            />
          </div>
          <div className="lg:col-span-1">
            <RiskCard data={risk} />
          </div>
        </div>

        {/* Row 3 - Engagement & Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FunnelChartCard title="Assignment funnel" data={funnel} />
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
              Insights
            </h3>
            <ul className="space-y-3">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-step-primary-600 dark:text-step-primary-500 mt-0.5">•</span>
                  <span className="text-sm text-step-text-main dark:text-step-dark-text-main">
                    {insight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 4 - Modality & Worksheet Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChartCard
            title="Time spent by modality"
            data={modalities}
            subtext="Helps you see where your practice time is going."
          />
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
              Most impactful worksheets
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-step-border dark:border-step-dark-border">
                    <th className="text-left py-2 px-3 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide">
                      Worksheet
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide">
                      Modality
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide">
                      Avg improvement
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide">
                      Avg completions/client
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {worksheetImpact.map((worksheet) => (
                    <tr 
                      key={worksheet.id}
                      className="border-b border-step-border dark:border-step-dark-border last:border-0 hover:bg-step-bg dark:hover:bg-step-dark-bg transition-colors"
                    >
                      <td className="py-3 px-3 text-step-text-main dark:text-step-dark-text-main font-medium">
                        {worksheet.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-xs font-medium text-step-text-muted bg-step-surface dark:bg-step-dark-surface rounded border border-step-border dark:border-step-dark-border">
                          {worksheet.modality}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-step-text-main dark:text-step-dark-text-main">
                        {worksheet.avgImprovement.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right text-step-text-main dark:text-step-dark-text-main">
                        {worksheet.avgCompletionsPerClient.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
}
