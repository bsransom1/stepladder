export interface Therapist {
  id: string;
  email: string;
  name: string;
  practice_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  therapist_id: string;
  display_name: string;
  email?: string;
  primary_modality: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ClientMagicLink {
  id: string;
  client_id: string;
  token: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface ERPHierarchyItem {
  id: string;
  client_id: string;
  therapist_id: string;
  label: string;
  description?: string;
  category?: string;
  baseline_suds: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  client_id: string;
  therapist_id: string;
  modality: string;
  goal: string;
  worksheet_type: string;
  config: AssignmentConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentConfig {
  hierarchy_item_id?: string;
  frequency_per_day?: number;
  days_of_week?: string[];
  min_duration_minutes?: number;
  instructions?: string;
  reminder_time?: string;
}

export interface ERPExposureRun {
  id: string;
  client_id: string;
  assignment_id?: string;
  hierarchy_item_id: string;
  date_time: string;
  suds_before: number;
  suds_peak: number;
  suds_after: number;
  duration_minutes: number;
  did_ritual: boolean;
  ritual_description?: string;
  notes?: string;
  created_at: string;
}

export interface ClientMetrics {
  range: string;
  erp: {
    exposures_completed: number;
    exposures_assigned: number;
    avg_suds_before: number;
    avg_suds_after: number;
    runs_with_rituals: number;
  };
}

export interface ClientHomeData {
  client: {
    display_name: string;
  };
  today: string;
  tasks: ClientTask[];
  progress_snippet: {
    avg_suds_drop_last_7_days: number;
    exposures_completed_last_7_days: number;
  };
}

export interface ClientTask {
  assignment_id: string;
  modality: string;
  goal: string;
  type: string;
  label: string;
  remaining_runs_today: number;
  total_runs_today: number;
  instructions: string;
}

