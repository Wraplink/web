"use client";

import {
    Activity,
    BarChart3,
    Headphones,
    LogOut,
    Menu,
    Package,
    Server,
    User,
    Bell,
    ShoppingBag,
    Wallet,
    X,
    Shield,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import {
    useTranslations,
    useLocale,
} from "next-intl";

import {
    Link,
    usePathname,
    useRouter,
} from "@/i18n/navigation";

import {apiClient} from "@/lib/api/client";
import {getNotifications} from "@/lib/notifications";

import {
    clearAuthSession,
    getAuthUser,
    subscribeAuth,
} from "@/lib/auth";
import {
    logout,
    type AuthUser,
} from "@/lib/api/auth";

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
    {
        key: "profile",
        href: "/profile",
        icon: User,
    },
    {
        key: "notifications",
        href: "/notifications",
        icon: Bell,
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

    const [user, setUser] =
        useState<AuthUser | null>(getAuthUser());

    const [loggingOut, setLoggingOut] =
        useState(false);

    useEffect(() => {
        return subscribeAuth(setUser);
    }, []);

    const [unreadNotifications,setUnreadNotifications]=useState(0);
    useEffect(()=>{if(!user)return;let active=true;const refresh=()=>{void getNotifications(1).then(data=>{if(active)setUnreadNotifications(data.unreadCount)}).catch(()=>{})};refresh();const timer=setInterval(refresh,30000);return()=>{active=false;clearInterval(timer)}},[user]);
    const [canAdmin, setCanAdmin] = useState(false);
    useEffect(() => {
        if (!user) {return;}
        let active = true;
        Promise.allSettled([
            apiClient.get("/api/v1/admin/access/permissions"),
            apiClient.get("/api/v1/admin/payment-reviews/receipts"),
            apiClient.get("/api/v1/admin/payment-reviews/discounts"),
        ]).then(results => {
            if (active) setCanAdmin(results.some(result => result.status === "fulfilled"));
        });
        return () => {active = false;};
    }, [user]);

    const isRtl = locale === "fa";

    const handleLogout = async () => {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            console.error(
                "Backend logout failed:",
                error
            );
        } finally {
            clearAuthSession();
            setMobileOpen(false);
            setLoggingOut(false);
            router.push("/auth/login");
        }
    };

    const initials = getInitials(user?.name);

    return (
        <>
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

            {mobileOpen && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    aria-label={t("closeMenu")}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 z-50 flex w-72 flex-col border-white/10
                    bg-[#05080d]/95 backdrop-blur-2xl transition-transform duration-300
                    ${isRtl ? "right-0 border-l" : "left-0 border-r"}
                    ${
                    mobileOpen
                        ? "translate-x-0"
                        : isRtl
                            ? "translate-x-full lg:translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                }
                `}
            >
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

                <div className="border-b border-white/10 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
                            <span className="font-bold">
                                {initials}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <div className="truncate font-semibold text-white">
                                {user?.name || "WrapLink User"}
                            </div>

                            <div className="truncate text-xs text-gray-500">
                                {user?.email || ""}
                            </div>
                        </div>
                    </div>
                </div>

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
                                    {item.key==="notifications"&&unreadNotifications>0&&<span aria-label={`${unreadNotifications} unread notifications`} className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{unreadNotifications>99?"99+":unreadNotifications}</span>}
                                </Link>
                            );
                        })}
                        {canAdmin && user && (
                            <Link href="/admin" onClick={() => setMobileOpen(false)}
                                className="mt-4 flex items-center gap-3 rounded-xl border border-cyan-400/20 px-4 py-3 text-sm font-medium text-cyan-300 hover:bg-cyan-400/10">
                                <Shield size={19}/>
                                <span>{locale === "fa" ? "مدیریت" : "Administration"}</span>
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="mx-4 mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
                    <div className="text-xs text-gray-500">
                        {t("wallet")}
                    </div>

                    <div className="mt-1 text-xl font-bold text-cyan-400">
                        0 تومان
                    </div>
                </div>

                <div className="border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut size={19}/>
                        {t("logout")}
                    </button>
                </div>
            </aside>
        </>
    );
}

function getInitials(
    name: string | undefined
): string {
    if (!name?.trim()) {
        return "WL";
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .slice(0, 2);

    return parts
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "WL";
}
