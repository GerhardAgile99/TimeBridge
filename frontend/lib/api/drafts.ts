import { apiFetch } from "./client";
import { ApiDraft, ApiDraftsResponse } from "./types";

export async function getDrafts(status?: "pending" | "approved" | "rejected"): Promise<ApiDraftsResponse> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<ApiDraftsResponse>(`/drafts${qs}`);
}

export async function approveDraft(id: string): Promise<{ draft: ApiDraft }> {
  return apiFetch<{ draft: ApiDraft }>(`/drafts/${id}/approve`, { method: "POST" });
}

export async function rejectDraft(id: string): Promise<ApiDraft> {
  return apiFetch<ApiDraft>(`/drafts/${id}/reject`, { method: "POST" });
}

export async function approveAllDrafts(): Promise<{ approved: number }> {
  return apiFetch<{ approved: number }>("/drafts/approve-all", { method: "POST" });
}
