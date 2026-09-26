"use client";

import {Menu} from "lucide-react";
import {useState} from "react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import NotificationBell from "@/components/notifications/NotificationBell";

const navigation = [
    {
        key: "home",
        href: "/",
    },
    {
        key: "about",
        href: "/about",
    },
    {
        key: "market",
        href: "/market",
    },
    {
        key: "pricing",
        href: "/pricing",
    },
    {
        key: "contact",
        href: "/contact",
    },
    {
        key: "legal",
        href: "/legal",
    },
] as const;

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const t = useTranslations("Navigation");

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                    >
                        <div className="h-8 w-8 rounded-lg bg-cyan-400 shadow-[0_0_20px_#00E5FF]" />

                        <span className="text-xl font-bold text-white">
                            WrapLink
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-300 transition hover:text-cyan-400"
                            >
                                {t(item.key)}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-3 md:flex">

                        <LanguageSwitcher />
                        <NotificationBell/>

                        <Link
                            href="/auth/login"
                            className="rounded-xl border border-cyan-400 px-4 py-2 text-cyan-400 transition hover:bg-cyan-400 hover:text-black"
                        >
                            {t("login")}
                        </Link>

                        <Link
                            href="/auth/register"
                            className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black shadow-[0_0_20px_#00E5FF] transition hover:scale-105"
                        >
                            {t("register")}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="text-white md:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={28}/>
                    </button>
                </div>
            </header>

            <MobileMenu
                open={open}
                setOpen={setOpen}
            />
        </>
    );
}