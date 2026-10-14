import axios from "axios";

import {
    API_BASE_URL,
    apiClient,
    refreshAccessToken,
    setAccessToken,
} from "@/lib/api/client";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

type MeResponse = {
    id: string;
    email: string;
    full_name: string;
    email_verified: boolean;
    account_status: string;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
};

export async function login(
    email: string,
    password: string
): Promise<AuthUser> {
    const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        {
            email: email.trim(),
            password,
        },
        {
            withCredentials: true,
            timeout: 15_000,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }
    );

    const token = response.data.accessToken?.trim();
    if (!token) {
        throw new Error(
            "Backend login response did not contain an access token"
        );
    }

    setAccessToken(token);
    return response.data.user;
}

export async function getMe(): Promise<AuthUser> {
    const response = await apiClient.get<MeResponse>(
        "/api/v1/me/"
    );

    return {
        id: response.data.id,
        name: response.data.full_name,
        email: response.data.email,
    };
}

export async function restoreSession(): Promise<AuthUser> {
    await refreshAccessToken();
    return getMe();
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post(
            "/api/v1/auth/logout"
        );
    } finally {
        setAccessToken(null);
    }
}
