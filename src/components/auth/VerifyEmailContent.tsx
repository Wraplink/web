"use client";

import {useEffect, useState} from "react";
import {
    MailCheck,
    RotateCw,
    ArrowLeft,
    Mail
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

export default function VerifyEmailContent({locale}: Props) {

    const t = useTranslations("VerifyEmailPage");

    const [seconds, setSeconds] = useState(30);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (seconds === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setSeconds((value) => value - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [seconds]);

    const resendEmail = () => {
        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * POST /api/v1/auth/verify-email/resend
         *
         * Payload:
         * {
         *   email
         * }
         *
         * Backend should:
         * - Generate a new verification token.
         * - Rate limit requests.
         * - Send a new verification email.
         * ========================================================
         */

        console.log("Resend verification email", {
            locale,
        });

        setSent(true);
        setSeconds(30);
    };

    return (
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,229,255,0.12),transparent_35%)]"/>

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-6 py-16">

                <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl">

                    <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                        {t("badge")}
                    </span>

                    <div className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">

                        <MailCheck
                            size={42}
                            className="text-cyan-400"
                        />

                    </div>

                    <h1 className="mt-8 text-3xl font-black">
                        {t("title")}
                    </h1>

                    <p className="mt-4 leading-7 text-gray-300">
                        {t("description")}
                    </p>

                    <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">

                        <div className="flex items-center justify-center gap-2 text-gray-300">

                            <Mail
                                size={18}
                                className="text-cyan-400"
                            />

                            <span>
                                {t("checkInbox")}
                            </span>

                        </div>

                    </div>

                    {sent && (
                        <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 p-3 text-sm text-green-300">
                            {t("success")}
                        </div>
                    )}

                    <button
                        type="button"
                        className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-105"
                    >
                        <Mail size={20}/>
                        {t("openMail")}
                    </button>

                    <div className="mt-10">

                        {seconds > 0 ? (
                            <div className="text-sm text-gray-400">
                                {t("resendIn", {
                                    seconds,
                                })}
                            </div>
                        ) : (
                            <button
                                onClick={resendEmail}
                                className="inline-flex items-center gap-2 text-cyan-400 transition hover:text-cyan-300"
                            >
                                <RotateCw size={18}/>

                                {t("resend")}
                            </button>
                        )}

                    </div>

                    <Link
                        href="/auth/login"
                        className="mt-10 inline-flex items-center gap-2 text-gray-400 transition hover:text-cyan-400"
                    >
                        <ArrowLeft size={18}/>
                        {t("backToLogin")}
                    </Link>

                </div>

            </div>

        </section>
    );
}