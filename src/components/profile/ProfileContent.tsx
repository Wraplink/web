"use client";

import {useState} from "react";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Laptop,
    LogOut,
    Mail,
    Save,
    ShieldCheck,
    Smartphone,
    User,
} from "lucide-react";

import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";
import {clearAuthSession, getAuthSession} from "@/lib/auth";

type Props = {
    locale: string;
};

type Session = {
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    current: boolean;
    icon: "desktop" | "mobile";
};

const mockSessions: Session[] = [
    {
        id: "session-001",
        device: "Linux Desktop",
        browser: "Chrome",
        location: "Frankfurt, Germany",
        lastActive: "Now",
        current: true,
        icon: "desktop",
    },
    {
        id: "session-002",
        device: "Android Phone",
        browser: "Chrome Mobile",
        location: "Frankfurt, Germany",
        lastActive: "2 hours ago",
        current: false,
        icon: "mobile",
    },
    {
        id: "session-003",
        device: "Windows Laptop",
        browser: "Firefox",
        location: "Berlin, Germany",
        lastActive: "Yesterday",
        current: false,
        icon: "desktop",
    },
];

export default function ProfileContent({locale}: Props) {
    const t = useTranslations("ProfilePage");
    const router = useRouter();

    const session = getAuthSession();

    const [name, setName] = useState(
        session?.user.name || "Mahdi Asgari"
    );

    const [email] = useState(
        session?.user.email || "user@example.com"
    );

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [profileSaved, setProfileSaved] =
        useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrent, setShowCurrent] =
        useState(false);

    const [showNew, setShowNew] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [passwordError, setPasswordError] =
        useState("");

    const [passwordSaved, setPasswordSaved] =
        useState(false);

    const [sessions, setSessions] =
        useState(mockSessions);

    const [loadingSession, setLoadingSession] =
        useState<string | null>(null);

    const handleProfileSave = async () => {
        setProfileSaved(false);
        setSavingProfile(true);

        /*
         * BACKEND TODO:
         * PUT /api/v1/profile
         *
         * Request:
         * {
         *   name
         * }
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 700)
        );

        setSavingProfile(false);
        setProfileSaved(true);
    };

    const handlePasswordChange = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setPasswordError("");
        setPasswordSaved(false);

        if (!currentPassword || !newPassword) {
            setPasswordError(
                t("password.errors.required")
            );
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                t("password.errors.minLength")
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError(
                t("password.errors.mismatch")
            );
            return;
        }

        /*
         * BACKEND TODO:
         * POST /api/v1/auth/change-password
         *
         * Request:
         * {
         *   currentPassword,
         *   newPassword
         * }
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 900)
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSaved(true);
    };

    const handleLogoutSession = async (
        sessionId: string
    ) => {
        setLoadingSession(sessionId);

        /*
         * BACKEND TODO:
         * POST /api/v1/auth/sessions/{sessionId}/revoke
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 600)
        );

        setSessions((current) =>
            current.filter(
                (item) => item.id !== sessionId
            )
        );

        setLoadingSession(null);
    };

    const handleLogoutAll = async () => {
        setLoadingSession("all");

        /*
         * BACKEND TODO:
         * POST /api/v1/auth/sessions/revoke-all
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 800)
        );

        setSessions((current) =>
            current.filter((item) => item.current)
        );

        setLoadingSession(null);
    };

    const handleLogout = () => {
        /*
         * BACKEND TODO:
         * POST /api/v1/auth/logout
         */

        clearAuthSession();
        router.push("/auth/login");
    };

    return (
        <section className="min-h-screen bg-[#03060a] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        <ShieldCheck size={15}/>
                        {t("badge")}
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        {t("title")}
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-gray-400 sm:text-base">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Profile */}
                    <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                                <User size={22}/>
                            </div>

                            <div>
                                <h2 className="font-bold text-white">
                                    {t("profile.title")}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {t("profile.description")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">

                            <div>
                                <label className="mb-2 block text-sm text-gray-400">
                                    {t("profile.name")}
                                </label>

                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 rtl:right-4 rtl:left-auto"
                                    />

                                    <input
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/50 rtl:pl-4 rtl:pr-11"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-400">
                                    {t("profile.email")}
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 rtl:right-4 rtl:left-auto"
                                    />

                                    <input
                                        value={email}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-gray-500 rtl:pl-4 rtl:pr-11"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleProfileSave}
                                    disabled={savingProfile}
                                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={17}/>

                                    {savingProfile
                                        ? t("profile.saving")
                                        : t("profile.save")}
                                </button>

                                {profileSaved && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                                        <CheckCircle2 size={17}/>
                                        {t("profile.saved")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Verification */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                            <Mail size={22}/>
                        </div>

                        <h2 className="font-bold text-white">
                            {t("verification.title")}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {t("verification.description")}
                        </p>

                        <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                            <CheckCircle2
                                size={20}
                                className="text-emerald-400"
                            />

                            <div>
                                <div className="text-sm font-semibold text-white">
                                    {t("verification.verified")}
                                </div>

                                <div className="text-xs text-gray-500">
                                    {email}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                            /*
                             * BACKEND TODO:
                             * POST /api/v1/auth/email/resend-verification
                             */
                        >
                            {t("verification.resend")}
                        </button>
                    </div>

                    {/* Password */}
                    <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400">
                                <KeyRound size={22}/>
                            </div>

                            <div>
                                <h2 className="font-bold text-white">
                                    {t("password.title")}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {t("password.description")}
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handlePasswordChange}
                            className="grid gap-5 sm:grid-cols-3"
                        >
                            <PasswordField
                                label={t("password.current")}
                                value={currentPassword}
                                onChange={setCurrentPassword}
                                visible={showCurrent}
                                setVisible={setShowCurrent}
                            />

                            <PasswordField
                                label={t("password.new")}
                                value={newPassword}
                                onChange={setNewPassword}
                                visible={showNew}
                                setVisible={setShowNew}
                            />

                            <PasswordField
                                label={t("password.confirm")}
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                visible={showConfirm}
                                setVisible={setShowConfirm}
                            />

                            {passwordError && (
                                <div className="sm:col-span-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
                                    {passwordError}
                                </div>
                            )}

                            <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-gray-200"
                                >
                                    {t("password.change")}
                                </button>

                                {passwordSaved && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                                        <CheckCircle2 size={17}/>
                                        {t("password.saved")}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                            <ShieldCheck size={22}/>
                        </div>

                        <h2 className="font-bold text-white">
                            {t("security.title")}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {t("security.description")}
                        </p>

                        <div className="mt-5 space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                <div className="text-xs text-gray-500">
                                    {t("security.twoFactor")}
                                </div>

                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">
                                        {t("security.disabled")}
                                    </span>

                                    <span className="rounded-full bg-gray-400/10 px-2 py-1 text-xs text-gray-400">
                                        {t("security.optional")}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                            >
                                {t("security.setup2fa")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sessions */}
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
                                <Laptop size={22}/>
                            </div>

                            <div>
                                <h2 className="font-bold text-white">
                                    {t("sessions.title")}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {t("sessions.description")}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogoutAll}
                            disabled={loadingSession === "all"}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                        >
                            <LogOut size={17}/>
                            {t("sessions.logoutAll")}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {sessions.map((item) => {
                            const DeviceIcon =
                                item.icon === "mobile"
                                    ? Smartphone
                                    : Laptop;

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                                            <DeviceIcon size={20}/>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-white">
                                                    {item.device}
                                                </span>

                                                {item.current && (
                                                    <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-400">
                                                        {t("sessions.current")}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                {item.browser} · {item.location} · {item.lastActive}
                                            </div>
                                        </div>
                                    </div>

                                    {!item.current && (
                                        <button
                                            type="button"
                                            disabled={loadingSession === item.id}
                                            onClick={() =>
                                                handleLogoutSession(
                                                    item.id
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                                        >
                                            <LogOut size={16}/>
                                            {loadingSession === item.id
                                                ? t("sessions.revoking")
                                                : t("sessions.logout")}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Account */}
                <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-400/[0.03] p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-bold text-white">
                                {t("account.title")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("account.description")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-400/10"
                        >
                            <LogOut size={17}/>
                            {t("account.logout")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PasswordField({
                           label,
                           value,
                           onChange,
                           visible,
                           setVisible,
                       }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    setVisible: (value: boolean) => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm text-gray-400">
                {label}
            </label>

            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-cyan-400/50 rtl:pl-11 rtl:pr-4"
                />

                <button
                    type="button"
                    onClick={() =>
                        setVisible(!visible)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-white rtl:left-3 rtl:right-auto"
                >
                    {visible ? (
                        <EyeOff size={18}/>
                    ) : (
                        <Eye size={18}/>
                    )}
                </button>
            </div>
        </div>
    );
}