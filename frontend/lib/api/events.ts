import { apiFetch } from "./client";
import { ApiRawEvent, ApiPaginated } from "./types";

export async function getEvents(limit = 50): Promise<ApiPaginated<ApiRawEvent>> {
  return apiFetch<ApiPaginated<ApiRawEvent>>(`/events?limit=${limit}`);
}
