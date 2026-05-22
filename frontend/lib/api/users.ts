import { apiFetch } from "./client";

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export async function getMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users/me");
}

export async function updateMe(name: string): Promise<ApiUser> {
  return apiFetch<ApiUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}
