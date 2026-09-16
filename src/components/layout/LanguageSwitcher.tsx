"use client";

import {useLocale} from "next-intl";

import {
    Link,
    usePathname,
} from "@/i18n/navigation";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();

    const targetLocale = locale === "en" ? "fa" : "en";

    return (
        <Link
            href={pathname}
            locale={targetLocale}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-cyan-400 hover:text-cyan-400"
        >
            {locale === "en" ? "فارسی" : "English"}
        </Link>
    );
}