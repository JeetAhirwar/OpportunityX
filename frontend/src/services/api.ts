const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const apiUrl = (endpoint: string) => {
  const base = (configuredBaseUrl || "").replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return base.endsWith("/api") && path.startsWith("/api/")
    ? `${base}${path.slice(4)}`
    : `${base}${path}`;
};

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private getToken() {
    return localStorage.getItem("ox_token");
  }

  clearToken() {
    localStorage.removeItem("ox_token");
    localStorage.removeItem("ox_user");
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth = false, headers: customHeaders, body, ...rest } = options;
    const headers: Record<string, string> = { ...(customHeaders as Record<string, string>) };

    if (body && !(body instanceof FormData)) headers["Content-Type"] = "application/json";
    if (!skipAuth) {
      const token = this.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl(endpoint), { headers, body, ...rest });
    if (response.status === 401) {
      this.clearToken();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await response.json() : null;
    if (!response.ok) throw new Error(data?.message || `Request failed with status ${response.status}`);
    return data;
  }

  get<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  post<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined, ...options });
  }

  put<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined, ...options });
  }

  patch<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined, ...options });
  }

  delete<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = {};
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(apiUrl(endpoint), { method: "POST", headers, body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.post<{ token: string; user: unknown }>("/api/auth/login", { email, password }, { skipAuth: true });
    localStorage.setItem("ox_token", data.token);
    localStorage.setItem("ox_user", JSON.stringify(data.user));
    return data;
  }

  async register(payload: { name: string; email: string; password: string; role: string }) {
    const data = await this.post<{ token: string; user: unknown }>("/api/auth/register", payload, { skipAuth: true });
    localStorage.setItem("ox_token", data.token);
    localStorage.setItem("ox_user", JSON.stringify(data.user));
    return data;
  }

  logout() {
    this.clearToken();
    window.location.href = "/login";
  }
}

export const api = new ApiClient();
export default api;
