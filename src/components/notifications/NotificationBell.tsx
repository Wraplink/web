"use client";

import {useEffect, useState} from "react";
import {Bell} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {unreadCount} from "@/lib/notifications";

export default function NotificationBell() {
    const [count, setCount] =
        useState(0);

    useEffect(() => {
        setCount(unreadCount());

        const timer = setInterval(() => {
            setCount(unreadCount());
        }, 1000);

        return () =>
            clearInterval(timer);
    }, []);

    return (
        <Link
            href="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-gray-300 transition hover:border-cyan-400 hover:text-cyan-400"
        >
            <Bell size={20}/>

            {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {count}
                </span>
            )}
        </Link>
    );
}