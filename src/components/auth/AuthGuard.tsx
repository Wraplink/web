"use client";

import {
    useEffect,
    useState,
} from "react";
import {usePathname} from "next/navigation";
import axios from "axios";

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
    const [restoreError, setRestoreError] = useState(false);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const checkAuthentication = async () => {
            setChecking(true);
            setRestoreError(false);

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
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setAuthenticated(false);
                if (!axios.isAxiosError(error) || error.response?.status === 401 || error.response?.status === 403) {
                    clearAuthSession();
                    router.replace(
                    `/auth/login?returnUrl=${encodeURIComponent(pathname)}`
                    );
                } else {
                    setRestoreError(true);
                }
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
    }, [pathname, router, retry]);

    if (restoreError) {
        return <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
            <p>Unable to reach the authentication service. Your session may still be active.</p>
            <button type="button" className="rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-black" onClick={() => setRetry(value => value + 1)}>Retry connection</button>
        </div>;
    }

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
