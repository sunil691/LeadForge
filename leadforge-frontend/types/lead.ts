export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "closed_won"
  | "closed_lost";

export interface TimelineEvent {
  type: string;
  label: string;
  date: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  source: string;
  status: LeadStatus;
  created_at: string;
  
  // Optional fields — populated only when provided by the backend
  company?: string;
  website?: string;
  address?: string;
  rating?: number;
  maps_url?: string;
  notes?: string;
  timeline?: TimelineEvent[];
}

export interface LeadCreatePayload {
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
