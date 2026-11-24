import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:7080";

export const API_BASE_URL = normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL
);

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const AUTH_SESSION_EXPIRED_EVENT = "wraplink:auth-session-expired";

function notifySessionExpired() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
}

export function setAccessToken(token: string | null) {
    accessToken = token?.trim() || null;
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function hasAccessToken(): boolean {
    return Boolean(accessToken);
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15_000,
    headers: {
        Accept: "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.set(
                "Authorization",
                `Bearer ${accessToken}`
            );
        }

        return config;
    }
);

type RetryRequestConfig =
    InternalAxiosRequestConfig & {
        _wraplinkRetry?: boolean;
    };

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const response = error.response;
        const config =
            error.config as RetryRequestConfig | undefined;

        if (
            !config ||
            response?.status !== 401 ||
            isAuthenticationBootstrapRequest(config.url) ||
            isPublicPlanRequest(config.url)
        ) {
            throw error;
        }

        // A refresh succeeded, but the protected endpoint still rejected the
        // retried access token. Avoid an endless retry loop or stale admin UI.
        // Do not log out if a different request has since installed a newer token.
        if (config._wraplinkRetry) {
            const rejectedToken = config.headers.get("Authorization");
            if (accessToken && rejectedToken === `Bearer ${accessToken}`) {
                setAccessToken(null);
                notifySessionExpired();
            }
            throw error;
        }

        // Another request may already have refreshed the token while this one failed.
        const failedToken = config.headers.get("Authorization");
        if (accessToken && failedToken !== `Bearer ${accessToken}`) {
            config._wraplinkRetry = true;
            config.headers.set("Authorization", `Bearer ${accessToken}`);
            return apiClient.request(config);
        }

        config._wraplinkRetry = true;

        try {
            const token = await refreshAccessToken();
            config.headers.set(
                "Authorization",
                `Bearer ${token}`
            );

            return apiClient.request(config);
        } catch (refreshError) {
            // Network/server failures are transient; only an explicit auth rejection
            // proves the refresh session is invalid.
            if (axios.isAxiosError(refreshError) &&
                [401, 403].includes(refreshError.response?.status ?? 0)) {
                setAccessToken(null);
                notifySessionExpired();
            }
            throw refreshError;
        }
    }
);

export async function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        // Refresh tokens rotate on every successful call. A module-level
        // promise only deduplicates requests in this tab; without a shared
        // lock, two tabs can submit the same cookie and trigger backend replay
        // detection, which revokes the entire session family.
        refreshPromise = requestRefreshTokenWithCrossTabLock()
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

async function requestRefreshTokenWithCrossTabLock(): Promise<string> {
    // The Web Locks API serializes refresh calls across tabs/windows of the
    // same origin. Each waiter sends its request only after the previous
    // response (including Set-Cookie) has completed.
    if (typeof navigator !== "undefined" && navigator.locks) {
        return navigator.locks.request(
            "wraplink-auth-refresh",
            {mode: "exclusive"},
            () => requestRefreshToken()
        );
    }

    // Older browsers retain the existing per-tab single-flight behavior.
    return requestRefreshToken();
}

async function requestRefreshToken(): Promise<string> {
    const response = await axios.post<{
        accessToken: string;
    }>(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        undefined,
        {
            withCredentials: true,
            timeout: 15_000,
            headers: {
                Accept: "application/json",
            },
        }
    );

    const token = response.data.accessToken?.trim();
    if (!token) {
        throw new Error(
            "Backend refresh response did not contain an access token"
        );
    }

    setAccessToken(token);
    return token;
}

// Public catalog requests must not trigger refresh-token rotation or a logout
// when the API is temporarily misconfigured or rejects anonymous traffic.
function isPublicPlanRequest(url: string | undefined): boolean {
    if (!url) return false;
    return /^\/api\/v1\/plans(?:\/[^/?#]+)?(?:[?#]|$)/.test(url);
}

function isAuthenticationBootstrapRequest(
    url: string | undefined
): boolean {
    if (!url) {
        return false;
    }

    return (
        url.includes("/api/v1/auth/login") ||
        url.includes("/api/v1/auth/refresh")
    );
}

function normalizeApiBaseUrl(value: string): string {
    const trimmed = value.trim().replace(/\/$/, "");

    try {
        const url = new URL(trimmed);

        // The backend network-entitlement endpoint is currently IPv4-only.
        // Browsers can resolve localhost to ::1, which causes activation to
        // fail with HTTP 400. Use an explicit IPv4 loopback address locally.
        if (url.hostname === "localhost") {
            url.hostname = "127.0.0.1";
        }

        return url.toString().replace(/\/$/, "");
    } catch {
        return trimmed;
    }
}
