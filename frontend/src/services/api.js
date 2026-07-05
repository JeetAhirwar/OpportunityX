const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
export const createApiUrl = (baseUrl, endpoint) => {
    const base = (baseUrl || "").replace(/\/$/, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
};
export const apiUrl = (endpoint) => {
    return createApiUrl(configuredBaseUrl, endpoint);
};
export const publicAssetUrl = (assetPath) => {
    if (/^https?:\/\//i.test(assetPath))
        return assetPath;
    const base = (configuredBaseUrl || "").replace(/\/api\/?$/, "").replace(/\/$/, "");
    const uploadsIndex = assetPath.replace(/\\/g, "/").toLowerCase().indexOf("/uploads/");
    const normalized = uploadsIndex >= 0
        ? assetPath.replace(/\\/g, "/").slice(uploadsIndex)
        : `/${assetPath.replace(/\\/g, "/").replace(/^\/+/, "")}`;
    return `${base}${normalized}`;
};
export class ApiError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}
class ApiClient {
    getToken() {
        return localStorage.getItem("ox_token");
    }
    clearToken() {
        localStorage.removeItem("ox_token");
        localStorage.removeItem("ox_user");
    }
    async request(endpoint, options = {}) {
        const { skipAuth = false, redirectOnUnauthorized = true, headers: customHeaders, body, ...rest } = options;
        const headers = { ...customHeaders };
        if (body && !(body instanceof FormData))
            headers["Content-Type"] = "application/json";
        if (!skipAuth) {
            const token = this.getToken();
            if (token)
                headers.Authorization = `Bearer ${token}`;
        }
        let response;
        try {
            response = await fetch(apiUrl(endpoint), { headers, body, ...rest });
        }
        catch (error) {
            throw new ApiError(error instanceof TypeError ? "Network error. Please check your connection and try again." : "Request failed before reaching the server.", 0);
        }
        if (response.status === 401) {
            this.clearToken();
            if (redirectOnUnauthorized)
                window.location.href = "/login";
            throw new ApiError("Session expired. Please login again.", 401);
        }
        const contentType = response.headers.get("content-type");
        const data = contentType?.includes("application/json") ? await response.json() : null;
        if (!response.ok)
            throw new ApiError(data?.message || `Request failed with status ${response.status}`, response.status);
        return data;
    }
    serializeBody(body) {
        if (body === undefined || body === null)
            return undefined;
        if (body instanceof FormData ||
            body instanceof URLSearchParams ||
            body instanceof Blob ||
            typeof body === "string") {
            return body;
        }
        return JSON.stringify(body);
    }
    get(endpoint, options) {
        return this.request(endpoint, { method: "GET", ...options });
    }
    post(endpoint, body, options) {
        return this.request(endpoint, { method: "POST", body: this.serializeBody(body), ...options });
    }
    put(endpoint, body, options) {
        return this.request(endpoint, { method: "PUT", body: this.serializeBody(body), ...options });
    }
    patch(endpoint, body, options) {
        return this.request(endpoint, { method: "PATCH", body: this.serializeBody(body), ...options });
    }
    delete(endpoint, options) {
        return this.request(endpoint, { method: "DELETE", ...options });
    }
    async upload(endpoint, formData) {
        const headers = {};
        const token = this.getToken();
        if (token)
            headers.Authorization = `Bearer ${token}`;
        let response;
        try {
            response = await fetch(apiUrl(endpoint), { method: "POST", headers, body: formData });
        }
        catch {
            throw new ApiError("Network error. Please check your connection and try again.", 0);
        }
        const data = await response.json().catch(() => null);
        if (response.status === 401) {
            this.clearToken();
            window.location.href = "/login";
            throw new ApiError("Session expired. Please login again.", 401);
        }
        if (!response.ok)
            throw new ApiError(data?.message || "Upload failed", response.status);
        return data;
    }
    async login(email, password) {
        const data = await this.post("/auth/login", { email, password }, { skipAuth: true });
        localStorage.setItem("ox_token", data.token);
        localStorage.setItem("ox_user", JSON.stringify(data.user));
        return data;
    }
    async register(payload) {
        const data = await this.post("/auth/register", payload, { skipAuth: true });
        localStorage.setItem("ox_token", data.token);
        localStorage.setItem("ox_user", JSON.stringify(data.user));
        return data;
    }
    hasToken() {
        return Boolean(this.getToken());
    }
    async logout() {
        try {
            if (this.getToken()) {
                await this.post("/auth/logout", undefined, { redirectOnUnauthorized: false });
            }
        }
        finally {
            this.clearToken();
            window.location.href = "/login";
        }
    }
}
export const api = new ApiClient();
export default api;
