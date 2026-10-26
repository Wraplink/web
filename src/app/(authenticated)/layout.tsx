"use client";

import {useLocale} from "next-intl";
import {useEffect,useState} from "react";
import {applyTheme,isTheme} from "@/lib/themes";

import AuthGuard from "@/components/auth/AuthGuard";
import UserSidebar from "@/components/layout/UserSidebar";

type Props = {
    children: React.ReactNode;
};

export default function AuthenticatedLayout({
                                                children,
                                            }: Props) {
    const locale = useLocale();
    useEffect(()=>{const saved=localStorage.getItem("wraplink-theme");if(saved&&isTheme(saved))applyTheme(saved);return ()=>{delete document.documentElement.dataset.wraplinkTheme}},[]);

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const isRtl = locale === "fa";

    return (
        <AuthGuard>

            <div className="wraplink-user-zone min-h-screen">

                <UserSidebar
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />

                <div
                    className={
                        isRtl
                            ? "lg:pr-72"
                            : "lg:pl-72"
                    }
                >
                    {children}
                </div>

            </div>

        </AuthGuard>
    );
}