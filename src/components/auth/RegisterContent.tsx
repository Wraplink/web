"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {
    Check,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Shield,
    User,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

type FormErrors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    privacy?: string;
};

const TERMS_VERSION = "2026-09-26";
const PRIVACY_VERSION = "2026-09-26";

export default function RegisterContent({
    locale,
}: Props) {
    const t = useTranslations("RegisterPage");

    const isFa = locale === "fa";

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [acceptedTerms, setAcceptedTerms] =
        useState(false);

    const [acceptedPrivacy, setAcceptedPrivacy] =
        useState(false);

    const [marketingConsent, setMarketingConsent] =
        useState(false);

    const [errors, setErrors] =
        useState<FormErrors>({});

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const router = useRouter();

    const passwordStrength = useMemo(() => {
        if (!password) {
            return "none";
        }

        let score = 0;

        if (password.length >= 8) {
            score++;
        }

        if (/[a-z]/.test(password)) {
            score++;
        }

        if (/[A-Z]/.test(password)) {
            score++;
        }

        if (/[0-9]/.test(password)) {
            score++;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        }

        if (score <= 2) {
            return "weak";
        }

        if (score <= 4) {
            return "medium";
        }

        return "strong";
    }, [password]);

    function validate(): boolean {
        const nextErrors: FormErrors = {};

        if (!name.trim()) {
            nextErrors.name = t(
                "validation.nameRequired",
            );
        }

        if (!email.trim()) {
            nextErrors.email = t(
                "validation.emailRequired",
            );
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            nextErrors.email = t(
                "validation.emailInvalid",
            );
        }

        if (!password) {
            nextErrors.password = t(
                "validation.passwordRequired",
            );
        } else if (
            password.length < 8 ||
            !/[a-z]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            nextErrors.password = t(
                "validation.passwordWeak",
            );
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = t(
                "validation.confirmRequired",
            );
        } else if (
            password !== confirmPassword
        ) {
            nextErrors.confirmPassword = t(
                "validation.passwordMismatch",
            );
        }

        if (!acceptedTerms) {
            nextErrors.terms = t(
                "validation.termsRequired",
            );
        }

        if (!acceptedPrivacy) {
            nextErrors.privacy = t(
                "validation.privacyRequired",
            );
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * POST /api/v1/auth/register
         *
         * Payload should eventually contain:
         *
         * {
         *   name,
         *   email,
         *   password,
         *
         *   legal: {
         *     termsVersion: "2026-09-26",
         *     privacyVersion: "2026-09-26",
         *     acceptedAt: "...",
         *     marketingConsent: false
         *   }
         * }
         *
         * Backend MUST:
         *
         * 1. Validate the account data.
         * 2. Hash the password using a strong password hashing
         *    algorithm such as Argon2id.
         * 3. Create the user.
         * 4. Persist the exact accepted Terms version.
         * 5. Persist the exact accepted Privacy Policy version.
         * 6. Persist acceptedAt on the server.
         * 7. Persist marketingConsent separately from mandatory
         *    legal acceptance.
         * 8. Create email verification request.
         * 9. Return the appropriate verification state.
         *
         * IMPORTANT:
         *
         * Do NOT trust the client-provided acceptedAt.
         * The backend must generate the authoritative timestamp.
         *
         * Do NOT store passwords or authentication secrets
         * in localStorage.
         *
         * ========================================================
         */

        const registrationPayload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,

            legal: {
                termsVersion: TERMS_VERSION,
                privacyVersion: PRIVACY_VERSION,
                marketingConsent,
            },

            locale,
        };

        console.log(
            "Registration form is valid",
            registrationPayload,
        );

        /*
         * Temporary frontend implementation.
         *
         * Remove this when the backend API is connected.
         */
        setTimeout(() => {
            setIsSubmitting(false);
            router.push(
                locale === "fa"
                    ? "/fa/auth/login"
                    : "/auth/login"
            );
        }, 500);
    }

    const loginHref = isFa
        ? "/fa/auth/login"
        : "/auth/login";

    const legalHref = isFa
        ? "/fa/legal"
        : "/legal";

    const privacyHref = isFa
        ? "/fa/privacy"
        : "/privacy";

    return (
        <section
            dir={isFa ? "rtl" : "ltr"}
            className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center px-6 py-20"
        >
            <div className="grid w-full gap-10 lg:grid-cols-2">

                {/* Information */}

                <div className="flex flex-col justify-center">

                    <span className="inline-flex w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                        {t("badge")}
                    </span>

                    <h1 className="mt-8 text-5xl font-black lg:text-6xl">
                        {t("title")}
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-gray-300">
                        {t("description")}
                    </p>

                    <div className="mt-12 rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <Shield
                                size={28}
                                className="text-cyan-400"
                            />
                        </div>

                        <h3 className="mt-6 text-2xl font-bold">
                            {t("securityTitle")}
                        </h3>

                        <p className="mt-3 leading-7 text-gray-400">
                            {t("securityText")}
                        </p>

                    </div>

                </div>

                {/* Registration Form */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >

                        {/* Name */}

                        <Field
                            icon={<User size={20}/>}
                            label={t("fullName")}
                            error={errors.name}
                        >
                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="w-full bg-transparent px-3 py-3 outline-none"
                                autoComplete="name"
                                disabled={isSubmitting}
                            />
                        </Field>

                        {/* Email */}

                        <Field
                            icon={<Mail size={20}/>}
                            label={t("email")}
                            error={errors.email}
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full bg-transparent px-3 py-3 outline-none"
                                autoComplete="email"
                                disabled={isSubmitting}
                            />
                        </Field>

                        {/* Password */}

                        <Field
                            icon={<Lock size={20}/>}
                            label={t("password")}
                            error={errors.password}
                        >
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full bg-transparent px-3 py-3 outline-none"
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword,
                                    )
                                }
                                className="text-gray-400 transition hover:text-cyan-400"
                                aria-label={t("password")}
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <EyeOff size={20}/>
                                ) : (
                                    <Eye size={20}/>
                                )}
                            </button>
                        </Field>

                        <p className="text-xs leading-5 text-gray-500">
                            {t("passwordHint")}
                        </p>

                        {/* Password Strength */}

                        {password && (
                            <div>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span className="text-gray-400">
                                        {t("strength")}
                                    </span>

                                    <span
                                        className={
                                            passwordStrength ===
                                            "strong"
                                                ? "text-green-400"
                                                : passwordStrength ===
                                                "medium"
                                                    ? "text-yellow-400"
                                                    : "text-red-400"
                                        }
                                    >
                                        {passwordStrength ===
                                        "strong"
                                            ? t("strong")
                                            : passwordStrength ===
                                            "medium"
                                                ? t("medium")
                                                : t("weak")}
                                    </span>
                                </div>

                                <div className="flex gap-1">
                                    {[1, 2, 3].map(
                                        (item) => {
                                            const active =
                                                passwordStrength ===
                                                "weak"
                                                    ? item === 1
                                                    : passwordStrength ===
                                                    "medium"
                                                        ? item <= 2
                                                        : item <= 3;

                                            return (
                                                <div
                                                    key={item}
                                                    className={`h-1.5 flex-1 rounded-full ${
    active
        ? passwordStrength ===
        "weak"
            ? "bg-red-400"
            : passwordStrength ===
            "medium"
                ? "bg-yellow-400"
                : "bg-green-400"
        : "bg-white/10"
}`}
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Confirm Password */}

                        <Field
                            icon={<Lock size={20}/>}
                            label={t("confirmPassword")}
                            error={errors.confirmPassword}
                        >
                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value,
                                    )
                                }
                                className="w-full bg-transparent px-3 py-3 outline-none"
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword,
                                    )
                                }
                                className="text-gray-400 transition hover:text-cyan-400"
                                aria-label={t(
                                    "confirmPassword",
                                )}
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={20}/>
                                ) : (
                                    <Eye size={20}/>
                                )}
                            </button>
                        </Field>

                        {/* Legal Acceptance */}

                        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">

                            {/* Terms */}

                            <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-300">

                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => {
                                        setAcceptedTerms(
                                            e.target.checked,
                                        );

                                        if (
                                            e.target.checked
                                        ) {
                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    terms: undefined,
                                                }),
                                            );
                                        }
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                                    disabled={isSubmitting}
                                />

                                <span className="leading-6">
                                    <span className="text-white">
                                        {t("termsPrefix")}{" "}
                                    </span>

                                    <Link
                                        href={legalHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-cyan-400 hover:underline"
                                    >
                                        {t("termsLink")}
                                    </Link>

                                    <span>
                                        {" "}
                                        {t("termsSuffix")}
                                    </span>
                                </span>

                            </label>

                            {errors.terms && (
                                <p className="text-sm text-red-400">
                                    {errors.terms}
                                </p>
                            )}

                            {/* Privacy */}

                            <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-300">

                                <input
                                    type="checkbox"
                                    checked={acceptedPrivacy}
                                    onChange={(e) => {
                                        setAcceptedPrivacy(
                                            e.target.checked,
                                        );

                                        if (
                                            e.target.checked
                                        ) {
                                            setErrors(
                                                (current) => ({
                                                    ...current,
                                                    privacy:
                                                        undefined,
                                                }),
                                            );
                                        }
                                    }}
                                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                                    disabled={isSubmitting}
                                />

                                <span className="leading-6">
                                    <span className="text-white">
                                        {t("privacyPrefix")}{" "}
                                    </span>

                                    <Link
                                        href={privacyHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-cyan-400 hover:underline"
                                    >
                                        {t("privacyLink")}
                                    </Link>

                                    <span>
                                        {" "}
                                        {t("privacySuffix")}
                                    </span>
                                </span>

                            </label>

                            {errors.privacy && (
                                <p className="text-sm text-red-400">
                                    {errors.privacy}
                                </p>
                            )}

                            {/* Marketing - OPTIONAL */}

                            <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-400">

                                <input
                                    type="checkbox"
                                    checked={marketingConsent}
                                    onChange={(e) =>
                                        setMarketingConsent(
                                            e.target.checked,
                                        )
                                    }
                                    className="mt-1 h-4 w-4 shrink-0 accent-cyan-400"
                                    disabled={isSubmitting}
                                />

                                <span className="leading-6">
                                    {t("marketing")}
                                </span>

                            </label>

                            <div className="flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-gray-500">
                                <Check
                                    size={15}
                                    className="mt-0.5 shrink-0 text-cyan-400"
                                />

                                <span>
                                    {t("legalNotice")}
                                </span>
                            </div>

                        </div>

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !acceptedTerms ||
                                !acceptedPrivacy
                            }
                            className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                        >
                            {isSubmitting
                                ? t("creating")
                                : t("register")}
                        </button>

                    </form>

                    <div className="mt-8 text-center text-gray-400">

                        {t("alreadyAccount")}{" "}

                        <Link
                            href={loginHref}
                            className="font-semibold text-cyan-400 hover:underline"
                        >
                            {t("login")}
                        </Link>

                    </div>

                </div>

            </div>
        </section>
    );
}

function Field({
    icon,
    label,
    error,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold">
                {label}
            </label>

            <div
                className={`flex items-center rounded-xl border bg-black/20 px-4 transition ${
    error
        ? "border-red-400/60"
        : "border-white/10 focus-within:border-cyan-400"
}`}
            >
                <span className="text-gray-400">
                    {icon}
                </span>

                {children}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}