/*
 * ========================================================
 * FRONTEND AUTH
 * ========================================================
 *
 * Temporary frontend authentication state.
 *
 * BACKEND TODO:
 * Replace this with real authentication against the Go API.
 *
 * Expected future API:
 *
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/refresh
 * GET  /api/v1/auth/me
 *
 * The real implementation should validate the user's
 * access token/session on the server.
 * ========================================================
 */

export const AUTH_STORAGE_KEY = "wraplink_auth";

export type AuthSession = {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
};

export function isAuthenticated(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return Boolean(
        localStorage.getItem(AUTH_STORAGE_KEY)
    );
}

export function getAuthSession(): AuthSession | null {
    if (typeof window === "undefined") {
        return null;
    }

    const value =
        localStorage.getItem(AUTH_STORAGE_KEY);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as AuthSession;
    } catch {
        return null;
    }
}

export function setAuthSession(
    session: AuthSession
) {
    localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(session)
    );
}

export function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}