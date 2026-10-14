import axios, {
    AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:7080";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_API_BASE_URL;

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

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
            config._wraplinkRetry ||
            isAuthenticationBootstrapRequest(config.url)
        ) {
            throw error;
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
            setAccessToken(null);
            throw refreshError;
        }
    }
);

export async function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = requestRefreshToken()
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
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
