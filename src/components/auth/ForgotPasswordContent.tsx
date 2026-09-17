"use client";

import {ArrowLeft, CheckCircle2, Mail, ShieldCheck} from "lucide-react";
import {FormEvent, useState} from "react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

export default function ForgotPasswordContent({locale}: Props) {
    const t = useTranslations("ForgotPasswordPage");

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError(t("errors.emailRequired"));
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError(t("errors.emailInvalid"));
            return;
        }

        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * When the Go backend is ready:
         *
         * POST /api/v1/auth/forgot-password
         *
         * Payload:
         *
         * {
         *   email
         * }
         *
         * Backend should:
         *
         * 1. Find the account by email.
         * 2. Generate a secure, short-lived reset token.
         * 3. Store only the hashed token.
         * 4. Send the password reset email.
         * 5. Return a generic response so account existence
         *    cannot be discovered.
         *
         * The frontend should NOT receive or store the reset token.
         * ========================================================
         */

        console.log("Forgot password request", {
            email,
            locale,
        });

        setSubmitted(true);
    };

    return (
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,229,255,0.12),transparent_35%)]"/>

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-16">
                <div className="w-full">
                    {/* Back */}
                    <Link
                        href="/auth/login"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-400"
                    >
                        <ArrowLeft size={16}/>
                        {t("backToLogin")}
                    </Link>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
                            <ShieldCheck
                                size={30}
                                className="text-cyan-400"
                            />
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {t("title")}
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-gray-400">
                            {t("description")}
                        </p>
                    </div>

                    {submitted ? (
                        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-center">
                            <CheckCircle2
                                size={42}
                                className="mx-auto mb-4 text-emerald-400"
                            />

                            <h2 className="text-xl font-semibold text-white">
                                {t("successTitle")}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-400">
                                {t("successDescription")}
                            </p>

                            <Link
                                href="/auth/login"
                                className="mt-6 inline-flex rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:scale-105"
                            >
                                {t("backToLogin")}
                            </Link>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
                        >
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                {t("email")}
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                />

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder={t("emailPlaceholder")}
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                                />
                            </div>

                            {error && (
                                <p className="mt-2 text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="mt-6 w-full rounded-xl bg-cyan-400 py-3.5 font-semibold text-black shadow-[0_0_25px_rgba(0,229,255,0.2)] transition hover:scale-[1.01] hover:bg-cyan-300"
                            >
                                {t("submit")}
                            </button>

                            <div className="mt-6 text-center text-sm text-gray-500">
                                {t("rememberPassword")}{" "}
                                <Link
                                    href="/auth/login"
                                    className="font-medium text-cyan-400 hover:text-cyan-300"
                                >
                                    {t("login")}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}