"use client";

import {useEffect} from "react";
import {NextIntlClientProvider} from "next-intl";
import {usePathname} from "next/navigation";

import en from "@/messages/en.json";
import fa from "@/messages/fa.json";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ThemeBackground from "./ThemeBackground";

type Props = {
    children: React.ReactNode;
};

export default function AppShell({children}: Props) {
    const pathname = usePathname();

    const locale = pathname === "/fa" || pathname.startsWith("/fa/")
        ? "fa"
        : "en";

    const messages = locale === "fa" ? fa : en;

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir =
            locale === "fa" ? "rtl" : "ltr";
    }, [locale]);

    console.log("AppShell locale:", locale);
    console.log(
        "ForgotPassword title:",
        messages.ForgotPasswordPage?.title
    );
    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="UTC"

        >
            <ThemeBackground/>

            <Navbar/>

            <main className="min-h-screen">
                {children}
            </main>

            <Footer/>
        </NextIntlClientProvider>
    );
}