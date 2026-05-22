import { apiFetch } from "./client";
import { ApiProject } from "./types";

export async function getProjects(): Promise<{ data: ApiProject[] }> {
  return apiFetch<{ data: ApiProject[] }>("/projects");
}
