const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// Kept in memory only — never in localStorage/sessionStorage — so an XSS
// bug can't read it off disk. It's re-derived on load via /auth/refresh,
// which relies on the httpOnly cookie instead (see AuthInitializer).
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // sends the httpOnly refresh-token cookie
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Request failed.");
  }
  return body;
}

export const apiClient = {
  get: (path: string) => request(path),
  post: (path: string, data: unknown) => request(path, { method: "POST", body: JSON.stringify(data) }),
};

/** For endpoints that return a file (export) rather than JSON. */
export async function downloadFile(path: string, filename: string) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Export failed.");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
