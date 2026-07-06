import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "../config/env";

// The access token lives in memory only — never localStorage — so it can't
// be exfiltrated via XSS. The refresh token is an httpOnly cookie the
// browser attaches automatically (withCredentials) and JS never touches.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access: string }>(`${API_BASE_URL}/auth/refresh/`, {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.access);
        return res.data.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && config && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      try {
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(config);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }
    }
    return Promise.reject(error);
  },
);
