import {
  AuthResponse,
  Lead,
  LeadCreatePayload,
  LeadStatus,
} from "@/types/lead";
import { getToken } from "@/lib/auth";

export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("leadforge_api_url");
    if (stored) return stored;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;

    try {
      const body = await response.json();

      if (body?.detail) {
        detail = body.detail;
      }
    } catch {
      // ignore parsing errors
    }

    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/* =========================
   AUTH
========================= */

export async function registerUser(
  email: string,
  password: string
) {
  return request<{
    id: number;
    email: string;
    created_at: string;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function loginUser(
  email: string,
  password: string
) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

/* =========================
   LEAD DISCOVERY
========================= */

export async function generateLeads(data: {
  keyword: string;
  location: string;
  limit: number;
}) {
  return request<any[]>(
    "/leads/generate-leads",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

/* =========================
   LEADS CRUD
========================= */

export async function fetchLeads() {
  return request<Lead[]>("/leads/");
}

export async function fetchLeadById(id: number) {
  return request<Lead>(`/leads/${id}`);
}

export async function createLead(
  payload: LeadCreatePayload
) {
  return request<Lead>(
    "/leads/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true
  );
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus
) {
  const lead = await request<Lead>(
    `/leads/${id}?status=${encodeURIComponent(status)}`,
    {
      method: "PATCH",
    },
    true
  );

  return { ...lead, status };
}

export async function deleteLead(id: number) {
  return request<{ message: string }>(
    `/leads/${id}`,
    {
      method: "DELETE",
    },
    true
  );
}

export { ApiError };