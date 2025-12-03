'use client';

import React from 'react';
import { KpiCard } from '../KpiCard';
import { HomeworkActivityChart } from '../HomeworkActivityChart';
import { ModalitySnapshot } from '../ModalitySnapshot';
import { WorksheetType } from '@/config/worksheetDefinitions';

interface KpiData {
  clientsWithActiveHomework: number;
  totalActiveClients: number;
  homeworkEntriesThisWeek: number;
  clientsOnTrack: number;
  clientsWithElevatedRisk: number;
}

interface ChartDataPoint {
  day: string;
  value: number;
}

interface ModalityData {
  label: string;
  detail: string;
  worksheetType?: WorksheetType;
}

interface AnalyticsOverviewProps {
  kpiData: KpiData;
  chartData: ChartDataPoint[];
  modalityData: ModalityData[];
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  kpiData,
  chartData,
  modalityData,
}) => {
  const totalEntries = chartData.reduce((sum, d) => sum + d.value, 0);
  const clientsLogged = 6; // TODO: Calculate from actual data

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Clients with active homework"
          value={kpiData.clientsWithActiveHomework}
          subtitle={`Out of ${kpiData.totalActiveClients} active clients`}
        />
        <KpiCard
          title="Homework entries this week"
          value={kpiData.homeworkEntriesThisWeek}
          subtitle="Worksheets completed across all modalities"
        />
        <KpiCard
          title="Clients on track"
          value={`${kpiData.clientsOnTrack} / ${kpiData.totalActiveClients}`}
          subtitle="Completed ≥ 70% of assigned tasks"
        />
        <KpiCard
          title="Clients with elevated risk signals"
          value={kpiData.clientsWithElevatedRisk}
          subtitle="High urges or crisis flags in last 7 days"
        />
      </div>

      {/* Homework Activity Chart */}
      <div className="mb-8">
        <HomeworkActivityChart
          data={chartData}
          totalEntries={totalEntries}
          clientsLogged={clientsLogged}
          totalClients={kpiData.totalActiveClients}
        />
      </div>

      {/* Modality Snapshot */}
      <div className="mb-8">
        <ModalitySnapshot modalities={modalityData} />
      </div>
    </>
  );
};

