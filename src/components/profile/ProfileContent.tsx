"use client";

import {useState} from "react";
import {
    User,
    Mail,
    Lock,
    ShieldCheck,
    Monitor,
    Smartphone,
    LogOut,
    Save,
    KeyRound,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {clearAuthSession} from "@/lib/auth";
import {useRouter} from "@/i18n/navigation";

type Props = {
    locale: string;
};

type Session = {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current?: boolean;
};

const sessions: Session[] = [
    {
        id: "session-1",
        device: "Chrome · Linux",
        location: "Frankfurt, Germany",
        lastActive: "Active now",
        current: true,
    },
    {
        id: "session-2",
        device: "Chrome · Windows",
        location: "Berlin, Germany",
        lastActive: "2 hours ago",
    },
];

export default function ProfileContent({
                                           locale,
                                       }: Props) {

    const t = useTranslations("ProfilePage");
    const router = useRouter();

    const [name, setName] =
        useState("Mahdi Asgari");

    const [email] =
        useState("user@example.com");

    const [saving, setSaving] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [twoFactorEnabled, setTwoFactorEnabled] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const saveProfile = async () => {

        setSaving(true);
        setSaved(false);
        setMessage("");

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * PUT /api/v1/users/me
         *
         * {
         *     "name": "Mahdi Asgari"
         * }
         *
         * ============================================================
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 800)
        );

        setSaving(false);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2500);
    };

    const changePassword = async () => {

        setMessage("");

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            setMessage(
                t("security.passwordRequired")
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(
                t("security.passwordMismatch")
            );
            return;
        }

        setChangingPassword(true);

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * POST /api/v1/auth/change-password
         *
         * {
         *     "currentPassword": "...",
         *     "newPassword": "..."
         * }
         *
         * Backend should invalidate existing refresh tokens
         * according to the security policy.
         *
         * ============================================================
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setChangingPassword(false);

        setMessage(
            t("security.passwordChanged")
        );
    };

    const toggleTwoFactor = async () => {

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * POST /api/v1/auth/2fa/enable
         * POST /api/v1/auth/2fa/disable
         *
         * For enabling 2FA, backend should return a setup secret
         * and QR provisioning URI.
         *
         * ============================================================
         */

        setTwoFactorEnabled(
            (current) => !current
        );
    };

    const logoutSession = async (
        sessionId: string
    ) => {

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * POST /api/v1/auth/sessions/{sessionId}/revoke
         *
         * ============================================================
         */

        console.log(
            "Revoke session:",
            sessionId
        );
    };

    const logoutAllSessions = async () => {

        /*
         * ============================================================
         * BACKEND TODO
         * ============================================================
         *
         * POST /api/v1/auth/sessions/revoke-all
         *
         * ============================================================
         */

        clearAuthSession();

        router.push("/auth/login");
    };

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">

            {/* Header */}

            <div className="mb-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                        <User size={24}/>
                    </div>

                    <div>

                        <h1 className="text-3xl font-black">
                            {t("title")}
                        </h1>

                        <p className="mt-1 text-gray-400">
                            {t("subtitle")}
                        </p>

                    </div>

                </div>

            </div>

            {/* Profile */}

            <div className="grid gap-8 lg:grid-cols-3">

                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="mb-8">

                        <div className="flex items-center gap-3">

                            <User className="text-cyan-400"/>

                            <div>
                                <h2 className="text-xl font-bold">
                                    {t("profile.title")}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {t("profile.description")}
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="grid gap-6 md:grid-cols-2">

                        <Field
                            label={t("profile.name")}
                            icon={<User size={18}/>}
                        >
                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                className="input"
                            />
                        </Field>

                        <Field
                            label={t("profile.email")}
                            icon={<Mail size={18}/>}
                        >
                            <input
                                value={email}
                                disabled
                                className="input cursor-not-allowed opacity-50"
                            />
                        </Field>

                    </div>

                    <div className="mt-8 flex items-center gap-4">

                        <button
                            type="button"
                            onClick={saveProfile}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
                        >
                            <Save size={18}/>

                            {saving
                                ? t("profile.saving")
                                : t("profile.save")
                            }
                        </button>

                        {saved && (
                            <span className="flex items-center gap-2 text-sm text-green-400">
                                <CheckCircle2 size={17}/>
                                {t("profile.saved")}
                            </span>
                        )}

                    </div>

                </div>

                {/* Account status */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-xl font-bold">
                        {t("account.title")}
                    </h2>

                    <div className="mt-6 space-y-5">

                        <StatusRow
                            label={t("account.emailVerified")}
                            value={t("account.verified")}
                            success
                        />

                        <StatusRow
                            label={t("account.accountStatus")}
                            value={t("account.active")}
                            success
                        />

                        <StatusRow
                            label={t("account.plan")}
                            value="Pro"
                            success
                        />

                    </div>

                </div>

            </div>

            {/* Password */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center gap-3">

                    <Lock className="text-cyan-400"/>

                    <div>

                        <h2 className="text-xl font-bold">
                            {t("security.passwordTitle")}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {t("security.passwordDescription")}
                        </p>

                    </div>

                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-3">

                    <PasswordField
                        label={t("security.currentPassword")}
                        value={currentPassword}
                        onChange={setCurrentPassword}
                    />

                    <PasswordField
                        label={t("security.newPassword")}
                        value={newPassword}
                        onChange={setNewPassword}
                    />

                    <PasswordField
                        label={t("security.confirmPassword")}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                    />

                </div>

                {message && (
                    <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-300">
                        {message}
                    </div>
                )}

                <button
                    type="button"
                    onClick={changePassword}
                    disabled={changingPassword}
                    className="mt-6 flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/20 disabled:opacity-50"
                >
                    <KeyRound size={18}/>

                    {changingPassword
                        ? t("security.changing")
                        : t("security.changePassword")
                    }
                </button>

            </div>

            {/* 2FA */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-start justify-between gap-6">

                    <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                            <ShieldCheck size={22}/>
                        </div>

                        <div>

                            <h2 className="text-xl font-bold">
                                {t("security.twoFactorTitle")}
                            </h2>

                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                {t("security.twoFactorDescription")}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={toggleTwoFactor}
                        className={`
                            relative h-7 w-12 shrink-0 rounded-full transition
                            ${
                            twoFactorEnabled
                                ? "bg-cyan-400"
                                : "bg-gray-700"
                        }
                        `}
                    >
                        <span
                            className={`
                                absolute top-1 h-5 w-5 rounded-full bg-white transition
                                ${
                                twoFactorEnabled
                                    ? "left-6"
                                    : "left-1"
                            }
                            `}
                        />
                    </button>

                </div>

                <div className="mt-6 flex items-center gap-2 text-sm">

                    {twoFactorEnabled ? (
                        <>
                            <CheckCircle2
                                size={17}
                                className="text-green-400"
                            />

                            <span className="text-green-400">
                                {t("security.twoFactorEnabled")}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle
                                size={17}
                                className="text-yellow-400"
                            />

                            <span className="text-yellow-400">
                                {t("security.twoFactorDisabled")}
                            </span>
                        </>
                    )}

                </div>

            </div>

            {/* Sessions */}

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Monitor className="text-cyan-400"/>

                        <div>

                            <h2 className="text-xl font-bold">
                                {t("sessions.title")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("sessions.description")}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={logoutAllSessions}
                        className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-400/10"
                    >
                        <LogOut size={17}/>
                        {t("sessions.logoutAll")}
                    </button>

                </div>

                <div className="mt-6 space-y-3">

                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400">
                                    {session.device.includes("Windows")
                                        ? <Monitor size={19}/>
                                        : <Smartphone size={19}/>
                                    }
                                </div>

                                <div>

                                    <div className="font-semibold">
                                        {session.device}
                                    </div>

                                    <div className="mt-1 text-xs text-gray-500">
                                        {session.location} · {session.lastActive}
                                    </div>

                                </div>

                            </div>

                            {session.current ? (
                                <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-400">
                                    {t("sessions.current")}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        logoutSession(session.id)
                                    }
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    {t("sessions.revoke")}
                                </button>
                            )}

                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}

function Field({
                   label,
                   icon,
                   children,
               }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <label className="block">

            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                {icon}
                {label}
            </div>

            {children}

        </label>
    );
}

function PasswordField({
                           label,
                           value,
                           onChange,
                       }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">

            <div className="mb-2 text-sm text-gray-400">
                {label}
            </div>

            <input
                type="password"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="input"
            />

        </label>
    );
}

function StatusRow({
                       label,
                       value,
                       success = false,
                   }: {
    label: string;
    value: string;
    success?: boolean;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <span className="text-sm text-gray-400">
                {label}
            </span>

            <span
                className={
                    success
                        ? "text-sm font-semibold text-green-400"
                        : "text-sm font-semibold"
                }
            >
                {value}
            </span>

        </div>
    );
}