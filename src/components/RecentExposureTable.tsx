'use client';

interface ExposureRun {
  clientInitials: string;
  exposureStep: string;
  date: string;
  sudsBefore: number;
  sudsAfter: number;
  didRitual: boolean;
}

interface RecentExposureTableProps {
  runs: ExposureRun[];
}

export const RecentExposureTable: React.FC<RecentExposureTableProps> = ({ runs }) => {
  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg overflow-hidden transition-colors duration-200">
      <div className="p-6 border-b border-step-border dark:border-step-dark-border">
        <h3 className="text-heading-lg">Recent exposure runs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-step-border dark:divide-step-dark-border">
          <thead className="bg-step-bg dark:bg-step-dark-bg">
            <tr>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Client
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Exposure Step
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Date
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                SUDS
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Ritual?
              </th>
            </tr>
          </thead>
          <tbody className="bg-step-surface dark:bg-step-dark-surface divide-y divide-step-border dark:divide-step-dark-border">
            {runs.map((run, index) => (
              <tr key={index} className="hover:bg-step-bg dark:hover:bg-step-dark-bg transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-body-sm font-medium text-step-text-main dark:text-step-dark-text-main">{run.clientInitials}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-body-sm text-step-text-main dark:text-step-dark-text-main">{run.exposureStep}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-body-sm text-muted">{run.date}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-body-sm text-step-text-main dark:text-step-dark-text-main">
                    {run.sudsBefore} → {run.sudsAfter}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {run.didRitual ? (
                    <span className="text-body-sm text-step-status-danger-text dark:text-step-status-danger-textDark transition-colors duration-200">Yes</span>
                  ) : (
                    <span className="text-body-sm text-step-status-success-text dark:text-step-status-success-textDark transition-colors duration-200">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

