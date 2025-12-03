export type Modality = "ERP" | "CBT" | "DBT" | "CBT_I" | "SUD";

export type WorksheetType =
  | "erp_exposure_hierarchy"
  | "erp_exposure_run"
  | "cbt_thought_record"
  | "dbt_diary_card"
  | "sleep_diary"
  | "sud_craving_log";

export type WorksheetKpiDefinition = {
  id: string;
  label: string;          // e.g. "Exposures (last 7 days)"
  description?: string;   // e.g. "Completed / assigned"
  valueKey: string;       // key used in computed metrics object
  format?: (value: any) => string | number; // optional formatter function
};

export type WorksheetAnalyticsDefinition = {
  kpiTitle?: string;      // e.g. "ERP Analytics"
  kpis: WorksheetKpiDefinition[];
  chartTitle?: string;    // e.g. "SUDS over recent exposures"
  tableTitle?: string;    // e.g. "Recent exposure runs"
  summaryKey?: string;    // key for summary text in metrics
};

export type WorksheetConfigFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox";

export type WorksheetConfigField = {
  key: string;                    // e.g. "frequency_per_day"
  label: string;                  // e.g. "Target exposures per day"
  description?: string;           // helper text
  type: WorksheetConfigFieldType;
  options?: { label: string; value: string }[]; // for select
  defaultValue?: any;
  required?: boolean;
};

export type WorksheetDefinition = {
  type: WorksheetType;
  title: string;          // e.g. "Exposure Hierarchy Worksheet"
  description?: string;   // doc-style description for the worksheet card
  analytics?: WorksheetAnalyticsDefinition;
  itemLabel?: string;     // e.g. "Step", "Entry", "Record"
  addButtonLabel?: string; // e.g. "Add Step", "Add Entry"
  supportedModalities: Modality[]; // which modalities this worksheet applies to
  configFields?: WorksheetConfigField[]; // dynamic config fields for worksheet setup
};

// WIPED: All concrete worksheet data has been removed to prepare for Phase 1 schema-driven system
// This empty object maintains type compatibility while we rebuild on the new foundation
export const WORKSHEET_DEFINITIONS: Record<WorksheetType, WorksheetDefinition> = {
  erp_exposure_hierarchy: {
    type: "erp_exposure_hierarchy",
    title: "",
    supportedModalities: [],
  },
  erp_exposure_run: {
    type: "erp_exposure_run",
    title: "",
    supportedModalities: [],
  },
  cbt_thought_record: {
    type: "cbt_thought_record",
    title: "",
    supportedModalities: [],
  },
  dbt_diary_card: {
    type: "dbt_diary_card",
    title: "",
    supportedModalities: [],
  },
  sleep_diary: {
    type: "sleep_diary",
    title: "",
    supportedModalities: [],
  },
  sud_craving_log: {
    type: "sud_craving_log",
    title: "",
    supportedModalities: [],
  },
};

// Helper to get worksheet definition by type
export function getWorksheetDefinition(type: WorksheetType): WorksheetDefinition {
  return WORKSHEET_DEFINITIONS[type];
}

// Helper to get all worksheet types that have analytics
export function getWorksheetsWithAnalytics(): WorksheetType[] {
  return Object.values(WORKSHEET_DEFINITIONS)
    .filter(def => def.analytics !== undefined)
    .map(def => def.type);
}

// Helper to get worksheet definitions for a specific modality
export function getWorksheetDefinitionsForModality(modality: Modality): WorksheetDefinition[] {
  return Object.values(WORKSHEET_DEFINITIONS).filter(def =>
    def.supportedModalities.includes(modality)
  );
}

// Helper to get config fields for a worksheet type
export function getConfigFieldsForWorksheet(type: WorksheetType): WorksheetConfigField[] {
  return WORKSHEET_DEFINITIONS[type]?.configFields ?? [];
}

