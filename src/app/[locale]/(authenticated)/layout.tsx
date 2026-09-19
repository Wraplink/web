"use client";

import {useLocale} from "next-intl";
import {useState} from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import UserSidebar from "@/components/layout/UserSidebar";

type Props = {
    children: React.ReactNode;
};

export default function AuthenticatedLayout({
                                                children,
                                            }: Props) {
    const locale = useLocale();

    const [mobileOpen, setMobileOpen] =
        useState(false);

    const isRtl = locale === "fa";

    return (
        <AuthGuard>

            <div className="min-h-screen">

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