"use client";

import {
    Activity,
    BarChart3,
    Headphones,
    LogOut,
    Menu,
    Package,
    Server,
    ShoppingBag,
    Wallet,
    X,
} from "lucide-react";
import {useTranslations, useLocale} from "next-intl";

import {
    Link,
    usePathname,
    useRouter,
} from "@/i18n/navigation";

import {clearAuthSession} from "@/lib/auth";

const navigation = [
    {
        key: "dashboard",
        href: "/dashboard",
        icon: BarChart3,
    },
    {
        key: "connection",
        href: "/connection",
        icon: Server,
    },
    {
        key: "wallet",
        href: "/wallet",
        icon: Wallet,
    },
    {
        key: "market",
        href: "/market",
        icon: ShoppingBag,
    },
    {
        key: "basket",
        href: "/basket",
        icon: Package,
    },
    {
        key: "orders",
        href: "/orders",
        icon: Activity,
    },
    {
        key: "support",
        href: "/support",
        icon: Headphones,
    },
    {
        key: "bandwidth",
        href: "/bandwidth",
        icon: BarChart3,
    },
] as const;

type Props = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
};

export default function UserSidebar({
                                        mobileOpen,
                                        setMobileOpen,
                                    }: Props) {
    const t = useTranslations("UserSidebar");
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const isRtl = locale === "fa";

    const handleLogout = () => {
        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * Replace this with:
         *
         * POST /api/v1/auth/logout
         *
         * The Go backend should invalidate the refresh token /
         * server-side session.
         * ========================================================
         */

        clearAuthSession();

        setMobileOpen(false);

        router.push("/auth/login");
    };

    return (
        <>
            {/* Mobile menu button */}

            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`fixed top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-white backdrop-blur-xl lg:hidden ${
                    isRtl
                        ? "right-4"
                        : "left-4"
                }`}
                aria-label={t("openMenu")}
            >
                <Menu size={22}/>
            </button>

            {/* Mobile overlay */}

            {mobileOpen && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    aria-label={t("closeMenu")}
                />
            )}

            {/* Sidebar */}

            <aside
                className={`
                    fixed
                    inset-y-0
                    z-50
                    flex
                    w-72
                    flex-col
                    border-white/10
                    bg-[#05080d]/95
                    backdrop-blur-2xl
                    transition-transform
                    duration-300
                    ${isRtl
                    ? "right-0 border-l"
                    : "left-0 border-r"
                }
                    ${
                    mobileOpen
                        ? "translate-x-0"
                        : isRtl
                            ? "translate-x-full lg:translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                }
                `}
            >

                {/* Header */}

                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                    >
                        <div className="h-9 w-9 rounded-xl bg-cyan-400 shadow-[0_0_20px_#00E5FF]"/>

                        <div>
                            <div className="font-bold text-white">
                                WrapLink
                            </div>

                            <div className="text-xs text-gray-500">
                                {t("controlPanel")}
                            </div>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(false)
                        }
                        className="text-gray-400 hover:text-white lg:hidden"
                        aria-label={t("closeMenu")}
                    >
                        <X size={22}/>
                    </button>

                </div>

                {/* User */}

                <div className="border-b border-white/10 p-5">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
                            <span className="font-bold">
                                MA
                            </span>
                        </div>

                        <div className="min-w-0">

                            <div className="truncate font-semibold text-white">
                                Mahdi Asgari
                            </div>

                            <div className="truncate text-xs text-gray-500">
                                user@example.com
                            </div>

                        </div>

                    </div>

                </div>

                {/* Navigation */}

                <div className="flex-1 overflow-y-auto p-4">

                    <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {t("navigation")}
                    </div>

                    <nav className="space-y-1">

                        {navigation.map((item) => {
                            const Icon = item.icon;

                            const active =
                                pathname === item.href ||
                                pathname.startsWith(
                                    `${item.href}/`
                                );

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                    className={`
                                        flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition
                                        ${
                                        active
                                            ? "bg-cyan-400/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(0,229,255,0.05)]"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }
                                    `}
                                >
                                    <Icon size={19}/>

                                    <span>
                                        {t(
                                            `items.${item.key}`
                                        )}
                                    </span>
                                </Link>
                            );
                        })}

                    </nav>

                </div>

                {/* Wallet */}

                <div className="mx-4 mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">

                    <div className="text-xs text-gray-500">
                        {t("wallet")}
                    </div>

                    <div className="mt-1 text-xl font-bold text-cyan-400">
                        $126.75
                    </div>

                </div>

                {/* Logout */}

                <div className="border-t border-white/10 p-4">

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-400/10 hover:text-red-400"
                    >
                        <LogOut size={19}/>

                        {t("logout")}
                    </button>

                </div>

            </aside>
        </>
    );
}