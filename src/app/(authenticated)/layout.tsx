"use client";

import {useLocale} from "next-intl";
import {usePathname} from "next/navigation";
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
    const pathname=usePathname();
    const isAdmin=/^\/(?:fa\/|en\/)?admin(?:\/|$)/.test(pathname);
    useEffect(()=>{const saved=localStorage.getItem("wraplink-theme");if(!isAdmin&&saved&&isTheme(saved))applyTheme(saved);return ()=>{delete document.documentElement.dataset.wraplinkTheme}},[isAdmin]);

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const isRtl = locale === "fa";

    return (
        <AuthGuard>

            <div className={isAdmin?"min-h-screen":"wraplink-user-zone min-h-screen"}>

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