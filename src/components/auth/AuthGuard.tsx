"use client";

import {
    useEffect,
    useState,
} from "react";
import {usePathname} from "next/navigation";

import {useRouter} from "@/i18n/navigation";
import {
    clearAuthSession,
    isAuthenticated,
    setAuthUser,
} from "@/lib/auth";
import {restoreSession} from "@/lib/api/auth";

export default function AuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [checking, setChecking] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        const checkAuthentication = async () => {
            setChecking(true);

            if (isAuthenticated()) {
                if (!cancelled) {
                    setAuthenticated(true);
                    setChecking(false);
                }
                return;
            }

            try {
                const user = await restoreSession();

                if (cancelled) {
                    return;
                }

                setAuthUser(user);
                setAuthenticated(true);
            } catch {
                if (cancelled) {
                    return;
                }

                clearAuthSession();
                setAuthenticated(false);

                router.replace(
                    `/auth/login?returnUrl=${encodeURIComponent(pathname)}`
                );
            } finally {
                if (!cancelled) {
                    setChecking(false);
                }
            }
        };

        void checkAuthentication();

        return () => {
            cancelled = true;
        };
    }, [pathname, router]);

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
