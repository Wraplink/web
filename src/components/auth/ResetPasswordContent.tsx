"use client";

import {useMemo, useState} from "react";
import {Eye, EyeOff, Lock, ShieldCheck} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

export default function ResetPasswordContent({locale}: Props) {
    const t = useTranslations("ResetPasswordPage");
    const params = useSearchParams();

    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);

    const [success, setSuccess] = useState(false);

    const strength = useMemo(() => {
        if (!password) return "none";

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return "weak";
        if (score <= 4) return "medium";
        return "strong";
    }, [password]);

    const submit = () => {
        if (!token) return;
        if (password !== confirm) return;

        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * POST /api/v1/auth/reset-password
         *
         * Payload:
         *
         * {
         *   token,
         *   password
         * }
         *
         * Backend should:
         * - Validate token.
         * - Check expiration.
         * - Hash password.
         * - Invalidate token.
         * - Return success.
         * ========================================================
         */

        console.log("Reset password", {
            locale,
            token,
        });

        setSuccess(true);
    };

    if (!token) {
        return (
            <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-xl items-center px-6 py-20">
                <div className="w-full rounded-3xl border border-red-400/20 bg-white/5 p-8 text-center backdrop-blur-xl">
                    <h1 className="text-3xl font-black text-red-400">
                        {t("invalidToken")}
                    </h1>

                    <Link
                        href="/auth/forgot-password"
                        className="mt-8 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black"
                    >
                        Forgot Password
                    </Link>
                </div>
            </section>
        );
    }

    if (success) {
        return (
            <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-xl items-center px-6 py-20">
                <div className="w-full rounded-3xl border border-green-400/20 bg-white/5 p-8 text-center backdrop-blur-xl">
                    <ShieldCheck
                        size={60}
                        className="mx-auto text-green-400"
                    />

                    <h1 className="mt-6 text-3xl font-black">
                        {t("successTitle")}
                    </h1>

                    <p className="mt-4 text-gray-300">
                        {t("successDescription")}
                    </p>

                    <Link
                        href="/auth/login"
                        className="mt-8 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black"
                    >
                        {t("goLogin")}
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-xl items-center px-6 py-20">

            <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                    {t("badge")}
                </span>

                <h1 className="mt-8 text-4xl font-black">
                    {t("title")}
                </h1>

                <p className="mt-4 text-gray-300">
                    {t("description")}
                </p>

                <div className="mt-8 space-y-5">

                    <PasswordField
                        label={t("newPassword")}
                        value={password}
                        setValue={setPassword}
                        show={show1}
                        setShow={setShow1}
                    />

                    <p className="text-xs text-gray-500">
                        {t("passwordHint")}
                    </p>

                    {password && (
                        <div>

                            <div className="mb-2 flex justify-between text-xs">

                                <span>{t("strength")}</span>

                                <span
                                    className={
                                        strength === "strong"
                                            ? "text-green-400"
                                            : strength === "medium"
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                    }
                                >
                  {strength === "strong"
                      ? t("strong")
                      : strength === "medium"
                          ? t("medium")
                          : t("weak")}
                </span>

                            </div>

                            <div className="flex gap-1">

                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full ${
                                            strength === "weak"
                                                ? i <= 1
                                                    ? "bg-red-400"
                                                    : "bg-white/10"
                                                : strength === "medium"
                                                    ? i <= 2
                                                        ? "bg-yellow-400"
                                                        : "bg-white/10"
                                                    : "bg-green-400"
                                        }`}
                                    />
                                ))}

                            </div>

                        </div>
                    )}

                    <PasswordField
                        label={t("confirmPassword")}
                        value={confirm}
                        setValue={setConfirm}
                        show={show2}
                        setShow={setShow2}
                    />

                    <button
                        type="button"
                        onClick={submit}
                        className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02]"
                    >
                        {t("reset")}
                    </button>

                </div>

            </div>

        </section>
    );
}

function PasswordField({
                           label,
                           value,
                           setValue,
                           show,
                           setShow,
                       }: {
    label: string;
    value: string;
    setValue: (value: string) => void;
    show: boolean;
    setShow: (value: boolean) => void;
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold">
                {label}
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4">

                <Lock
                    size={20}
                    className="text-gray-400"
                />

                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) =>
                        setValue(e.target.value)
                    }
                    className="w-full bg-transparent px-3 py-3 outline-none"
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-gray-400 hover:text-cyan-400"
                >
                    {show ? (
                        <EyeOff size={20}/>
                    ) : (
                        <Eye size={20}/>
                    )}
                </button>

            </div>

        </div>
    );
}