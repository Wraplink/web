"use client";

import {useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";
import {MailCheck, RotateCw, CheckCircle2, AlertCircle} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {apiClient} from "@/lib/api/client";

type Props = {locale: string};
type Status = "checking" | "pending" | "verified" | "invalid" | "error";

export default function VerifyEmailContent({locale}: Props) {
    const t = useTranslations("VerifyEmailPage");
    const search = useSearchParams();
    const token = search.get("token");
    const email = search.get("email") ?? "";
    const [status, setStatus] = useState<Status>(token ? "checking" : "pending");
    const [seconds, setSeconds] = useState(30);
    const [sending, setSending] = useState(false);
    const [notice, setNotice] = useState("");
    const attempted = useRef<string | null>(null);

    useEffect(() => {
        if (!token) {setStatus("pending"); return;}
        if (attempted.current === token) return;
        attempted.current = token;
        setStatus("checking");
        // Remove the secret from browser history as soon as it has been captured.
        window.history.replaceState(window.history.state, "", window.location.pathname);
        apiClient.post("/api/v1/auth/verify-email", {token})
            .then(() => setStatus("verified"))
            .catch((error) => setStatus(error?.response?.status === 400 ? "invalid" : "error"));
    }, [token]);

    useEffect(() => {
        if (seconds <= 0) return;
        const id = window.setTimeout(() => setSeconds(value => Math.max(0, value - 1)), 1000);
        return () => window.clearTimeout(id);
    }, [seconds]);

    async function resend() {
        if (!email || seconds > 0 || sending) return;
        setSending(true);
        setNotice("");
        try {
            await apiClient.post("/api/v1/auth/resend-verification", {email});
            setNotice(t("success"));
            setSeconds(30);
        } catch {
            setNotice(t("resendError"));
        } finally {
            setSending(false);
        }
    }

    const isFa = locale === "fa";
    const loginHref = "/auth/login";
    return (
        <section dir={isFa ? "rtl" : "ltr"} className="relative min-h-[calc(100vh-4rem)] px-6 py-20">
            <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
                {status === "verified" ? <CheckCircle2 className="mx-auto text-green-400" size={60}/> :
                 status === "invalid" || status === "error" ? <AlertCircle className="mx-auto text-amber-400" size={60}/> :
                 <MailCheck className="mx-auto text-cyan-400" size={60}/>}
                <h1 className="mt-7 text-3xl font-bold">
                    {status === "verified" ? t("verifiedTitle") :
                     status === "checking" ? t("checkingTitle") :
                     status === "invalid" ? t("invalidTitle") :
                     status === "error" ? t("errorTitle") : t("checkTitle")}
                </h1>
                <p className="mt-4 leading-8 text-gray-300">
                    {status === "verified" ? t("verifiedDescription") :
                     status === "checking" ? t("checkingDescription") :
                     status === "invalid" ? t("invalidDescription") :
                     status === "error" ? t("errorDescription") : t("description")}
                </p>
                {status === "pending" && <p className="mt-5 text-sm text-gray-400">{t("checkInbox")}</p>}
                {status === "pending" && email && <p dir="ltr" className="mt-3 text-cyan-300">{email.replace(/^(.{2}).*(@.*)$/, "$1***$2")}</p>}
                {(status === "pending" || status === "invalid") && (
                    <div className="mt-8">
                        {email ? (
                            <button type="button" disabled={seconds > 0 || sending} onClick={resend}
                                className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">
                                <RotateCw className="me-2 inline" size={18}/>
                                {seconds > 0 ? t("resendIn", {seconds}) : t("resend")}
                            </button>
                        ) : <p className="text-sm text-gray-400">{t("resendRequiresEmail")}</p>}
                    </div>
                )}
                {notice && <p role="status" className="mt-4 text-sm text-cyan-300">{notice}</p>}
                {status === "error" && <button className="mt-6 text-cyan-400 underline" onClick={() => window.location.reload()}>{t("retry")}</button>}
                {(status === "verified" || status === "pending" || status === "invalid") && (
                    <Link href={loginHref} className="mt-8 block rounded-xl border border-cyan-400/40 px-6 py-3 text-cyan-300">
                        {status === "verified" ? t("goLogin") : t("backToLogin")}
                    </Link>
                )}
            </div>
        </section>
    );
}
