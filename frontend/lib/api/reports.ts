import { apiFetch } from "./client";
import { ApiStats, ApiWeeklyData } from "./types";

export async function getStats(): Promise<ApiStats> {
  return apiFetch<ApiStats>("/reports/stats");
}

export async function getWeeklyData(): Promise<ApiWeeklyData> {
  return apiFetch<ApiWeeklyData>("/reports/weekly");
}
