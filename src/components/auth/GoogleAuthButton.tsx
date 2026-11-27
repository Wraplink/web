"use client";

import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {apiClient} from "@/lib/api/client";

type Registration = {
    termsVersion: string;
    privacyVersion: string;
    marketingConsent: boolean;
    captchaToken: string;
};

type Props = {
    locale: string;
    disabled?: boolean;
    rememberDevice?: boolean;
    registration?: Registration;
    onStartFailure?: () => void;
};

export default function GoogleAuthButton(props: Props) {
    return <Suspense fallback={null}><GoogleAuthAction {...props}/></Suspense>;
}

function GoogleAuthAction({
    locale, disabled, rememberDevice, registration, onStartFailure,
}: Props) {
    const t = useTranslations("GoogleAuth");
    const [available, setAvailable] = useState(false);
    const [working, setWorking] = useState(false);
    const searchParams = useSearchParams();
    const [attemptFailed, setAttemptFailed] = useState<boolean>();
    const failed = attemptFailed ?? searchParams.get("googleError") === "1";

    useEffect(() => {
        const controller = new AbortController();
        apiClient.get<{enabled: boolean}>("/api/v1/auth/google", {signal: controller.signal})
            .then(({data}) => setAvailable(data.enabled))
            .catch(() => {});
        return () => controller.abort();
    }, []);

    async function start() {
        setAttemptFailed(false);
        setWorking(true);
        const returnUrl = searchParams.get("returnUrl") ?? "";
        const payload = {locale, returnUrl, rememberDevice};
        try {
            const {data} = registration
                ? await apiClient.post<{authorizationUrl: string}>("/api/v1/auth/google/register", {
                    ...payload,
                    termsVersion: registration.termsVersion,
                    privacyVersion: registration.privacyVersion,
                    marketingConsent: registration.marketingConsent,
                }, {headers: {"X-Turnstile-Token": registration.captchaToken}})
                : await apiClient.post<{authorizationUrl: string}>("/api/v1/auth/google/login", payload);
            window.location.assign(data.authorizationUrl);
        } catch {
            setAttemptFailed(true);
            setWorking(false);
            onStartFailure?.();
        }
    }

    const needsRegistration = registration && searchParams.get("googleSignup") === "1";

    if (!available && !failed) return null;
    return (
        <div className="mt-4 space-y-2">
            {available && needsRegistration && (
                <p role="status" className="text-sm text-gray-300">{t("registrationRequired")}</p>
            )}
            {available && (
                <button
                    type="button"
                    disabled={disabled || working}
                    onClick={() => void start()}
                    className="w-full rounded-xl border border-white/20 px-4 py-3 font-semibold text-white transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {working ? t("connecting") : t(registration ? "register" : "login")}
                </button>
            )}
            {failed && <p role="alert" className="text-sm text-red-400">{t(registration ? "registrationError" : "loginError")}</p>}
        </div>
    );
}
