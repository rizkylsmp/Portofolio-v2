import { AxiosError } from "axios";
import { apiClient, getApiErrorMessage } from "./apiClient";
import { getSessionToken, logout } from "./authService";

type UploadResponse = {
  urls: string[];
};

type UploadTarget = "projects" | "experiences" | "certificates";

export async function uploadImages(target: UploadTarget, files: File[]): Promise<string[]> {
  const token = getSessionToken();
  if (!token) {
    throw new Error("Sesi admin tidak ditemukan. Silakan login ulang.");
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  try {
    const { data } = await apiClient.post<UploadResponse>(
      `/api/admin/uploads/${target}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.urls;
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 401) {
      logout();
    }
    throw new Error(getApiErrorMessage(err, "Gagal upload gambar."));
  }
}

export function uploadProjectImages(files: File[]): Promise<string[]> {
  return uploadImages("projects", files);
}

export function uploadExperienceImages(files: File[]): Promise<string[]> {
  return uploadImages("experiences", files);
}

export function uploadCertificateImages(files: File[]): Promise<string[]> {
  return uploadImages("certificates", files);
}
