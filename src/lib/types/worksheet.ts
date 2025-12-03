/**
 * Worksheet System - Phase 1 Schema Types
 * 
 * This file defines the schema-driven type system for worksheets.
 * It is backend-agnostic and modality-agnostic, providing a foundation
 * for building any worksheet template.
 */

export type WorksheetFieldType =
  | "text"          // single-line text input
  | "textarea"      // multi-line text input
  | "number"        // numeric input
  | "rating_0_10"   // 0-10 numeric rating scale
  | "checkbox"      // single checkbox (boolean)
  | "checkbox_group" // group of checkboxes
  | "select"        // single select dropdown
  | "multi_select"  // multi-select dropdown
  | "date"          // date picker
  | "time"          // time picker
  | "likert";       // Likert scale (e.g., strongly disagree → strongly agree)

export interface WorksheetFieldOption {
  value: string;
  label: string;
}

export interface WorksheetField {
  id: string;                  // stable key like "situation", "automatic_thought"
  label: string;               // user-facing label
  description?: string;        // optional helper/explanation text
  type: WorksheetFieldType;
  required?: boolean;
  placeholder?: string;
  options?: WorksheetFieldOption[];    // for select/multi_select/checkbox_group/likert
  min?: number;                 // for numeric / rating types
  max?: number;
  clinicianConfigurable?: boolean; // If true, clinician can pre-fill this field. If false/undefined, patient-only.
}

export interface WorksheetTemplate {
  id: string;                      // unique id, e.g., "cbt-thought-record"
  title: string;                   // "5-Column Thought Record"
  modality: string;                // e.g., "CBT", "ERP", "DBT", "SUD"
  modules: string[];               // e.g., ["Cognitive Restructuring"]
  problemDomains: string[];        // e.g., ["Depression", "Anxiety"]
  evidenceTag?: string;            // e.g., "CBT for depression"
  description?: string;
  fields: WorksheetField[];
}

/**
 * Type guard to check if a value is a valid WorksheetFieldType
 */
export function isWorksheetFieldType(value: string): value is WorksheetFieldType {
  return [
    "text",
    "textarea",
    "number",
    "rating_0_10",
    "checkbox",
    "checkbox_group",
    "select",
    "multi_select",
    "date",
    "time",
    "likert",
  ].includes(value);
}

/**
 * Type guard to check if an object is a valid WorksheetTemplate
 */
export function isWorksheetTemplate(obj: any): obj is WorksheetTemplate {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.modality === "string" &&
    Array.isArray(obj.modules) &&
    Array.isArray(obj.problemDomains) &&
    Array.isArray(obj.fields) &&
    obj.fields.every((field: any) => isWorksheetField(field))
  );
}

/**
 * Type guard to check if an object is a valid WorksheetField
 */
export function isWorksheetField(obj: any): obj is WorksheetField {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.label === "string" &&
    isWorksheetFieldType(obj.type)
  );
}

/* ============================================================================
 * WORKSHEET SYSTEM ROADMAP - PHASES 1-4
 * ============================================================================
 * 
 * This document outlines the long-term plan for building a schema-driven,
 * modality-agnostic worksheet system. DO NOT implement Phases 2-4 yet.
 * 
 * ----------------------------------------------------------------------------
 * PHASE 1 (CURRENT) - Foundation & Generic Form Renderer
 * ----------------------------------------------------------------------------
 * 
 * Goals:
 * - Define worksheet schema/types (this file)
 * - Implement generic WorksheetForm component that can render any template
 * - Wipe old worksheet data seeds so we can rebuild on clean foundation
 * 
 * Deliverables:
 * - ✅ Schema types (WorksheetTemplate, WorksheetField, etc.)
 * - ✅ Generic WorksheetForm component
 * - ✅ Empty worksheet data placeholders (old data wiped)
 * 
 * Status: IN PROGRESS
 * 
 * ----------------------------------------------------------------------------
 * PHASE 2 (FUTURE - DO NOT IMPLEMENT NOW)
 * ----------------------------------------------------------------------------
 * 
 * Goals:
 * - Create modality-specific worksheet libraries as separate data files
 * - Each library exports WorksheetTemplate[] using Phase 1 schema
 * - No UI changes beyond wiring data into registries
 * 
 * Planned Structure:
 * - src/data/worksheets/cbt.ts (CBT worksheets)
 * - src/data/worksheets/erp.ts (ERP worksheets)
 * - src/data/worksheets/dbt.ts (DBT worksheets)
 * - src/data/worksheets/cbt-j.ts (CBT-J worksheets)
 * - src/data/worksheets/sud.ts (SUD worksheets)
 * 
 * Each file exports:
 *   export const cbtWorksheets: WorksheetTemplate[] = [
 *     {
 *       id: "cbt-thought-record-5-column",
 *       title: "5-Column Thought Record",
 *       modality: "CBT",
 *       modules: ["Cognitive Restructuring"],
 *       problemDomains: ["Depression", "Anxiety"],
 *       evidenceTag: "CBT for depression",
 *       fields: [...]
 *     },
 *     ...
 *   ];
 * 
 * DO NOT START THIS PHASE YET.
 * 
 * ----------------------------------------------------------------------------
 * PHASE 3 (FUTURE - DO NOT IMPLEMENT NOW)
 * ----------------------------------------------------------------------------
 * 
 * Goals:
 * - Build worksheet browsing UI (filter by modality/problem domain)
 * - Add "Preview worksheet" experience using WorksheetForm
 * - Still no client-specific assignment logic
 * 
 * Planned Features:
 * - Worksheet library browser page
 * - Filter by modality, problem domain, evidence tag
 * - Preview modal showing WorksheetForm with template
 * - Search functionality
 * 
 * DO NOT START THIS PHASE YET.
 * 
 * ----------------------------------------------------------------------------
 * PHASE 4 (FUTURE - DO NOT IMPLEMENT NOW)
 * ----------------------------------------------------------------------------
 * 
 * Goals:
 * - Implement client-specific worksheet assignments
 * - Add due dates, completion state, therapist/AI feedback
 * - Integrate with analytics (completion rates, skill usage, etc.)
 * 
 * Planned Features:
 * - Assign worksheet to client with due date
 * - Client portal to complete worksheets
 * - Therapist view of completed worksheets
 * - Analytics dashboard (completion rates, skill usage trends)
 * - AI-powered feedback generation
 * 
 * DO NOT START THIS PHASE YET.
 * 
 * ============================================================================
 */





