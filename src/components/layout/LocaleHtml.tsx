"use client";

import { useLocale } from "next-intl";

export default function LocaleHtml({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const locale = useLocale();

    return (
        <html
            lang={locale}
            dir={locale === "fa" ? "rtl" : "ltr"}
        >
        <body className="text-white antialiased">
        {children}
        </body>
        </html>
    );
}