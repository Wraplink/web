import {
    getAccessToken,
    setAccessToken,
} from "@/lib/api/client";
import type {AuthUser} from "@/lib/api/auth";

export type AuthSession = {
    accessToken: string;
    user: AuthUser;
};

type AuthListener = (
    user: AuthUser | null
) => void;

let currentUser: AuthUser | null = null;
const listeners = new Set<AuthListener>();

export function isAuthenticated(): boolean {
    return Boolean(
        currentUser && getAccessToken()
    );
}

export function getAuthUser(): AuthUser | null {
    return currentUser;
}

export function getAuthSession(): AuthSession | null {
    const token = getAccessToken();

    if (!currentUser || !token) {
        return null;
    }

    return {
        accessToken: token,
        user: currentUser,
    };
}

export function setAuthUser(
    user: AuthUser | null
) {
    currentUser = user;
    emit();
}

// Kept for compatibility with existing components. The token is stored only
// in module memory and is never persisted in localStorage/sessionStorage.
export function setAuthSession(
    session: AuthSession
) {
    setAccessToken(session.accessToken);
    currentUser = session.user;
    emit();
}

export function clearAuthSession() {
    setAccessToken(null);
    currentUser = null;
    emit();
}

export function subscribeAuth(
    listener: AuthListener
): () => void {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

function emit() {
    for (const listener of listeners) {
        listener(currentUser);
    }
}
