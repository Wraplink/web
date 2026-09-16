"use client";

import {X} from "lucide-react";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

import LanguageSwitcher from "./LanguageSwitcher";

const navigation = [
    {key: "home", href: "/"},
    {key: "about", href: "/about"},
    {key: "market", href: "/market"},
    {key: "pricing", href: "/pricing"},
    {key: "contact", href: "/contact"},
] as const;

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function MobileMenu({
                                       open,
                                       setOpen,
                                   }: Props) {
    const t = useTranslations("Navigation");

    return (
        <div
            className={`fixed inset-0 z-50 transition ${
                open
                    ? "visible bg-black/60"
                    : "invisible pointer-events-none"
            }`}
        >
            <aside
                className={`absolute end-0 h-full w-80 border-s border-white/10 bg-[#111827] p-6 transition-transform ${
                    open
                        ? "translate-x-0"
                        : "translate-x-full rtl:-translate-x-full"
                }`}
            >

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        WrapLink
                    </h2>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="text-white"
                    >
                        <X />
                    </button>
                </div>

                <div className="mt-8 flex flex-col gap-6">

                    {navigation.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="text-gray-300 transition hover:text-cyan-400"
                        >
                            {t(item.key)}
                        </Link>
                    ))}

                    <div className="border-t border-white/10 pt-6">
                        <LanguageSwitcher />
                    </div>

                    <Link
                        href="/auth/login"
                        onClick={() => setOpen(false)}
                        className="rounded-lg border border-cyan-400 py-3 text-center text-cyan-400"
                    >
                        {t("login")}
                    </Link>

                    <Link
                        href="/auth/register"
                        onClick={() => setOpen(false)}
                        className="rounded-lg bg-cyan-400 py-3 text-center font-bold text-black"
                    >
                        {t("register")}
                    </Link>

                </div>

            </aside>
        </div>
    );
}