// Centralized API client for OpportunityX
// Configure API_BASE_URL to point to your Node.js backend

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem("ox_token");
  }

  private setToken(token: string) {
    localStorage.setItem("ox_token", token);
  }

  clearToken() {
    localStorage.removeItem("ox_token");
    localStorage.removeItem("ox_user");
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth = false, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      ...rest,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  }

  // Auth helpers
  async login(email: string, password: string) {
    const data = await this.post<{ token: string; user: any }>("/auth/login", { email, password }, { skipAuth: true });
    this.setToken(data.token);
    localStorage.setItem("ox_user", JSON.stringify(data.user));
    return data;
  }

  async register(payload: { name: string; email: string; password: string; role: string }) {
    const data = await this.post<{ token: string; user: any }>("/auth/register", payload, { skipAuth: true });
    this.setToken(data.token);
    localStorage.setItem("ox_user", JSON.stringify(data.user));
    return data;
  }

  logout() {
    this.clearToken();
    window.location.href = "/login";
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
