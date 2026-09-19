"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

import {useRouter} from "@/i18n/navigation";

import {isAuthenticated} from "@/lib/auth";

export default function AuthGuard({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Important:
    // The first render must be identical on server and client.
    const [checking, setChecking] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);

    useEffect(() => {
        const authenticated =
            isAuthenticated();

        if (!authenticated) {
            router.replace(
                `/auth/login?returnUrl=${encodeURIComponent(pathname)}`
            );

            return;
        }

        setAuthenticated(true);
        setChecking(false);
    }, [pathname, router]);

    /*
     * ========================================================
     * BACKEND TODO
     * ========================================================
     *
     * The frontend localStorage check is temporary.
     *
     * Replace with real Go backend session validation:
     *
     * GET /api/v1/auth/me
     *
     * The backend should validate the access token/session
     * and return the current authenticated user.
     *
     * ========================================================
     */

    if (checking || !authenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="text-center">

                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"/>

                    <p className="text-sm text-gray-400">
                        Checking authentication...
                    </p>

                </div>
            </div>
        );
    }

    return <>{children}</>;
}