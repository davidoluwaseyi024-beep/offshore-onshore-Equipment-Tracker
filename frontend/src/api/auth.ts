import { apiClient, setAccessToken } from "./client";
import type { User } from "../types/user";

interface LoginResponse {
  access: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login/", { email, password });
  setAccessToken(data.access);
  return data.user;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<LoginResponse>("/auth/register/", payload);
  setAccessToken(data.access);
  return data.user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post("/auth/password-reset/", { email });
}

export async function confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/password-reset/confirm/", { uid, token, new_password: newPassword });
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout/");
  setAccessToken(null);
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me/");
  return data;
}

export async function refreshSession(): Promise<{ access: string }> {
  const { data } = await apiClient.post<{ access: string }>("/auth/refresh/");
  setAccessToken(data.access);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/change-password/", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
