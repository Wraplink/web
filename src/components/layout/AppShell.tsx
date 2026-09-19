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

const authenticatedRoutes = [
    "/dashboard",
    "/connection",
    "/wallet",
    "/market",
    "/basket",
    "/orders",
    "/support",
    "/bandwidth",
];

export default function AppShell({
                                     children,
                                 }: Props) {
    const pathname = usePathname();

    const locale =
        pathname === "/fa" ||
        pathname.startsWith("/fa/")
            ? "fa"
            : "en";

    const messages =
        locale === "fa"
            ? fa
            : en;

    const normalizedPath =
        locale === "fa"
            ? pathname.replace(/^\/fa/, "") || "/"
            : pathname;

    const isAuthenticatedRoute =
        authenticatedRoutes.some(
            (route) =>
                normalizedPath === route ||
                normalizedPath.startsWith(
                    `${route}/`
                )
        );

    useEffect(() => {
        document.documentElement.lang =
            locale;

        document.documentElement.dir =
            locale === "fa"
                ? "rtl"
                : "ltr";
    }, [locale]);

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="UTC"
        >
            <ThemeBackground/>

            {!isAuthenticatedRoute && (
                <Navbar/>
            )}

            <main
                className={
                    isAuthenticatedRoute
                        ? "min-h-screen"
                        : "min-h-screen"
                }
            >
                {children}
            </main>

            {!isAuthenticatedRoute && (
                <Footer/>
            )}

        </NextIntlClientProvider>
    );
}