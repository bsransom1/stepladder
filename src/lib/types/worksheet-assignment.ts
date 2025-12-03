/**
 * Worksheet Assignment Types - Phase 4
 * 
 * Types for client-specific worksheet assignments and responses.
 * These types are metadata-only and do not include worksheet template definitions.
 * 
 * ----------------------------------------------------------------------------
 * PHASE 4 COMPLETION - Client Worksheet Assignments
 * ----------------------------------------------------------------------------
 * 
 * Phase 4 introduces a complete system for assigning worksheets to clients:
 * 
 * 1. **Types** (this file):
 *    - WorksheetAssignment: Metadata for assignments (status, dates, notes)
 *    - WorksheetResponse: Client responses to worksheet fields
 *    - WorksheetAssignmentStatus: Status enum (assigned, in_progress, completed)
 * 
 * 2. **In-Memory Repository** (src/data/worksheet-assignments.ts):
 *    - createAssignment: Create new assignments
 *    - getAssignmentById: Retrieve by ID
 *    - getAssignmentsByClient: Get all assignments for a client
 *    - updateAssignmentStatus: Update assignment status
 *    - saveAssignmentResponse: Save client responses
 *    - All functions use in-memory storage (easy to swap for DB later)
 * 
 * 3. **Client Overview Page** (src/app/clients/[clientId]/page.tsx):
 *    - View all assignments for a client directly on the overview page
 *    - Filter assignments by "Assigned" or "All" using dropdown
 *    - Assign new worksheets via modal dialog
 *    - Display assignment status, dates, and metadata
 *    - Navigate to assignment detail pages
 * 
 * 4. **Assignment Detail/Fill Page** (src/app/clients/[clientId]/worksheets/[assignmentId]/page.tsx):
 *    - View and fill worksheet using WorksheetForm component
 *    - Save responses as "in progress" or "completed"
 *    - Display assignment metadata and status
 *    - Read-only view for completed assignments
 * 
 * **Future Enhancements:**
 * - Replace in-memory repository with real database (Prisma/Supabase)
 * - Add analytics (completion rates, skill usage trends)
 * - Add therapist feedback and AI-powered suggestions
 * - Support multiple responses per assignment (history)
 * - Add assignment notifications and reminders
 */

import type { WorksheetTemplate } from "@/lib/types/worksheet";

export type WorksheetAssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed";

export interface WorksheetResponse {
  // Keyed by WorksheetField.id
  values: Record<string, any>;
  submittedAt: string; // ISO date
}

export interface WorksheetClinicianConfig {
  values: Record<string, any>;  // keyed by WorksheetField.id
  configuredAt: string;         // ISO timestamp when the clinician configured it
}

export interface WorksheetAssignment {
  id: string;                 // unique assignment id
  clientId: string;           // foreign key to Client
  worksheetId: string;        // id of WorksheetTemplate
  status: WorksheetAssignmentStatus;
  assignedAt: string;         // ISO date
  dueDate?: string;           // optional ISO date
  completedAt?: string;       // ISO date when completed (if completed)
  lastUpdatedAt: string;      // ISO date
  // Optional therapist note / context
  note?: string;

  // Optional clinician configuration (values pre-filled by clinician)
  clinicianConfig?: WorksheetClinicianConfig;

  // Optional response payload (for now, single latest response)
  response?: WorksheetResponse;
}

