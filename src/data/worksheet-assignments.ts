/**
 * Worksheet Assignments Repository - Phase 4
 * 
 * In-memory repository for worksheet assignments with localStorage persistence.
 * This is a temporary implementation that can be easily swapped for a real database later.
 */

import {
  WorksheetAssignment,
  WorksheetAssignmentStatus,
  WorksheetResponse,
} from "@/lib/types/worksheet-assignment";
import { getWorksheetById } from "@/data/worksheets";

const STORAGE_KEY = 'stepladder_worksheet_assignments';

/**
 * Load assignments from localStorage
 */
function loadAssignments(): WorksheetAssignment[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load assignments from localStorage:', error);
  }
  
  return [];
}

/**
 * Save assignments to localStorage
 */
function saveAssignments(assignments: WorksheetAssignment[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error('Failed to save assignments to localStorage:', error);
  }
}

// Initialize assignments from localStorage
const assignments: WorksheetAssignment[] = loadAssignments();

/**
 * Generate a unique ID for assignments
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new worksheet assignment
 */
export function createAssignment(input: {
  clientId: string;
  worksheetId: string;
  dueDate?: string;
  note?: string;
  clinicianConfigValues?: Record<string, any>;
}): WorksheetAssignment {
  // Validate that the worksheet template exists
  const template = getWorksheetById(input.worksheetId);
  if (!template) {
    throw new Error(`Worksheet template not found: ${input.worksheetId}`);
  }

  // Reload from localStorage to ensure we have the latest data
  const allAssignments = getAssignments();

  const now = new Date().toISOString();
  const assignment: WorksheetAssignment = {
    id: generateId(),
    clientId: input.clientId,
    worksheetId: input.worksheetId,
    status: "assigned",
    assignedAt: now,
    lastUpdatedAt: now,
    dueDate: input.dueDate,
    note: input.note,
    clinicianConfig: input.clinicianConfigValues
      ? {
          values: input.clinicianConfigValues,
          configuredAt: now,
        }
      : undefined,
  };

  allAssignments.push(assignment);
  saveAssignments(allAssignments);
  return assignment;
}

/**
 * Get the current assignments array (reloads from localStorage to ensure freshness)
 */
function getAssignments(): WorksheetAssignment[] {
  // Reload from localStorage to ensure we have the latest data
  const loaded = loadAssignments();
  // Update the in-memory array
  assignments.length = 0;
  assignments.push(...loaded);
  return assignments;
}

/**
 * Get an assignment by ID
 */
export function getAssignmentById(id: string): WorksheetAssignment | undefined {
  const allAssignments = getAssignments();
  return allAssignments.find((a) => a.id === id);
}

/**
 * Get all assignments for a specific client, sorted by assignedAt descending
 */
export function getAssignmentsByClient(clientId: string): WorksheetAssignment[] {
  const allAssignments = getAssignments();
  return allAssignments
    .filter((a) => a.clientId === clientId)
    .sort((a, b) => {
      // Sort by assignedAt descending (newest first)
      return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });
}

/**
 * Update an assignment's status
 */
export function updateAssignmentStatus(
  id: string,
  status: WorksheetAssignmentStatus
): WorksheetAssignment | undefined {
  const allAssignments = getAssignments();
  const assignment = allAssignments.find((a) => a.id === id);
  if (!assignment) {
    return undefined;
  }

  assignment.status = status;
  assignment.lastUpdatedAt = new Date().toISOString();

  // If setting to completed and completedAt is not set, set it now
  if (status === "completed" && !assignment.completedAt) {
    assignment.completedAt = new Date().toISOString();
  }

  saveAssignments(allAssignments);
  return assignment;
}

/**
 * Save a response to an assignment
 */
export function saveAssignmentResponse(
  id: string,
  response: WorksheetResponse
): WorksheetAssignment | undefined {
  const allAssignments = getAssignments();
  const assignment = allAssignments.find((a) => a.id === id);
  if (!assignment) {
    return undefined;
  }

  assignment.response = response;
  assignment.lastUpdatedAt = new Date().toISOString();

  // If status is "assigned", bump it to "in_progress"
  if (assignment.status === "assigned") {
    assignment.status = "in_progress";
  }

  saveAssignments(allAssignments);
  return assignment;
}





