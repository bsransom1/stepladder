export type TimeRange = 'week' | '30d' | '90d';

export interface OutcomePoint {
  date: string;      // ISO date or label
  value: number;     // average change
}

export interface FunnelDatum {
  modality: string;
  assigned: number;
  started: number;
  completed: number;
}

export interface ModalityShare {
  modality: string;
  entries: number;
}

export interface WorksheetImpact {
  id: string;
  name: string;
  modality: string;
  avgImprovement: number; // e.g. 0–100 scale or 0–10
  avgCompletionsPerClient: number;
}

export interface RiskSnapshot {
  elevatedClients: number;
  totalClients: number;
  newCrisisFlags: number;
  resolvedFlags: number;
  trend: OutcomePoint[];
}

export interface CaseloadHealthSummary {
  avgCompletionRate: number;
  completionChange: number; // vs previous period
  avgEntriesPerClient: number;
  clientsImproving: number;
  clientsTotal: number;
  avgDaysSinceLastEntry: number;
  daysChange: number;
}

export interface AnalyticsData {
  summary: CaseloadHealthSummary;
  outcomes: Record<string, OutcomePoint[]>; // keyed by metric name
  funnel: FunnelDatum[];
  modalities: ModalityShare[];
  worksheetImpact: WorksheetImpact[];
  risk: RiskSnapshot;
  insights: string[];
}

export function getMockAnalytics(timeRange: TimeRange): AnalyticsData {
  // Generate different data based on time range
  const baseMultiplier = timeRange === 'week' ? 1 : timeRange === '30d' ? 4 : 12;
  
  // Caseload Health Summary
  const summary: CaseloadHealthSummary = {
    avgCompletionRate: timeRange === 'week' ? 82 : timeRange === '30d' ? 78 : 75,
    completionChange: timeRange === 'week' ? 8 : timeRange === '30d' ? 5 : 3,
    avgEntriesPerClient: timeRange === 'week' ? 5.8 : timeRange === '30d' ? 12.4 : 28.6,
    clientsImproving: timeRange === 'week' ? 10 : timeRange === '30d' ? 12 : 14,
    clientsTotal: 14,
    avgDaysSinceLastEntry: timeRange === 'week' ? 3.2 : timeRange === '30d' ? 2.8 : 2.5,
    daysChange: timeRange === 'week' ? -0.5 : timeRange === '30d' ? -0.8 : -1.2,
  };

  // Outcomes over time - generate weekly data points
  const weeks = timeRange === 'week' ? 1 : timeRange === '30d' ? 4 : 12;
  const sudsData: OutcomePoint[] = Array.from({ length: weeks }, (_, i) => ({
    date: `Week ${i + 1}`,
    value: 10 - (i * 0.8) + Math.random() * 0.5,
  }));

  const beliefData: OutcomePoint[] = Array.from({ length: weeks }, (_, i) => ({
    date: `Week ${i + 1}`,
    value: 8 - (i * 0.6) + Math.random() * 0.4,
  }));

  const urgeData: OutcomePoint[] = Array.from({ length: weeks }, (_, i) => ({
    date: `Week ${i + 1}`,
    value: 7 - (i * 0.5) + Math.random() * 0.3,
  }));

  const outcomes: Record<string, OutcomePoint[]> = {
    'SUDS': sudsData,
    'Belief': beliefData,
    'Urge / harm': urgeData,
  };

  // Funnel data
  const funnel: FunnelDatum[] = [
    { modality: 'ERP', assigned: 45 * baseMultiplier, started: 38 * baseMultiplier, completed: 32 * baseMultiplier },
    { modality: 'CBT', assigned: 32 * baseMultiplier, started: 28 * baseMultiplier, completed: 24 * baseMultiplier },
    { modality: 'DBT', assigned: 28 * baseMultiplier, started: 24 * baseMultiplier, completed: 20 * baseMultiplier },
    { modality: 'CBT-J', assigned: 18 * baseMultiplier, started: 15 * baseMultiplier, completed: 12 * baseMultiplier },
    { modality: 'SUD', assigned: 15 * baseMultiplier, started: 12 * baseMultiplier, completed: 10 * baseMultiplier },
  ];

  // Modality shares
  const modalities: ModalityShare[] = [
    { modality: 'ERP', entries: 120 * baseMultiplier },
    { modality: 'CBT', entries: 85 * baseMultiplier },
    { modality: 'DBT', entries: 65 * baseMultiplier },
    { modality: 'CBT-J', entries: 42 * baseMultiplier },
    { modality: 'SUD', entries: 38 * baseMultiplier },
  ];

  // Worksheet impact
  const worksheetImpact: WorksheetImpact[] = [
    { id: 'erp-exposure-hierarchy', name: 'Exposure Hierarchy', modality: 'ERP', avgImprovement: 8.2, avgCompletionsPerClient: 4.5 },
    { id: 'cbt-thought-record', name: 'Thought Record', modality: 'CBT', avgImprovement: 7.8, avgCompletionsPerClient: 3.8 },
    { id: 'dbt-diary-card', name: 'DBT Diary Card', modality: 'DBT', avgImprovement: 7.5, avgCompletionsPerClient: 5.2 },
    { id: 'cbtj-sleep-diary', name: 'Sleep Diary', modality: 'CBT-J', avgImprovement: 7.3, avgCompletionsPerClient: 6.1 },
    { id: 'sud-craving-log', name: 'Craving Log', modality: 'SUD', avgImprovement: 7.1, avgCompletionsPerClient: 4.3 },
  ];

  // Risk snapshot
  const riskTrend: OutcomePoint[] = Array.from({ length: weeks }, (_, i) => ({
    date: `Week ${i + 1}`,
    value: Math.max(0, 3 - (i * 0.2) + Math.random() * 0.5),
  }));

  const risk: RiskSnapshot = {
    elevatedClients: timeRange === 'week' ? 2 : timeRange === '30d' ? 3 : 4,
    totalClients: 14,
    newCrisisFlags: timeRange === 'week' ? 1 : timeRange === '30d' ? 2 : 3,
    resolvedFlags: timeRange === 'week' ? 2 : timeRange === '30d' ? 4 : 6,
    trend: riskTrend,
  };

  // Insights
  const insights: string[] = [
    'Most completions happen on Wednesday and Thursday.',
    timeRange === 'week' 
      ? 'Clients are most likely to drop off between Week 2 and Week 3.'
      : timeRange === '30d'
      ? 'Clients are most likely to drop off between Week 3 and Week 4.'
      : 'Clients are most likely to drop off between Week 4 and Week 5.',
    'CBT worksheets have the highest completion rate this period.',
    'ERP exposure practices show the strongest improvement trends.',
  ];

  return {
    summary,
    outcomes,
    funnel,
    modalities,
    worksheetImpact,
    risk,
    insights,
  };
}

