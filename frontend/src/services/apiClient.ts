import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_PORTFOLIO_API_URL || "").replace(/\/$/, ""),
  headers: {
    Accept: "application/json",
  },
});

export function getApiErrorData(error: unknown): Record<string, unknown> {
  if (error instanceof AxiosError && error.response?.data && typeof error.response.data === "object") {
    return error.response.data as Record<string, unknown>;
  }

  return {};
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = getApiErrorData(error);
  return typeof data.error === "string" ? data.error : fallback;
}
