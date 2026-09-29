/**
 * The lead record — one shape, used by the contact form write path, the admin
 * dashboard/leads list, and every API route in between.
 *
 * Type-only module: safe to import from client components (it erases at
 * compile time) and from server code.
 */

export type LeadStatus = "New" | "Contacted" | "In Progress" | "Closed";

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  budget?: string;
  message: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
}
