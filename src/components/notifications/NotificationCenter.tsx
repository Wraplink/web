"use client";

import {useEffect, useMemo, useState} from "react";

import {
    Bell,
    CreditCard,
    Headphones,
    Package,
    Shield,
    Settings,
    CheckCheck,
    Check,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {
    getNotifications,
    markAllRead,
    markRead,
    type Notification,
} from "@/lib/notifications";

import NotificationPreferences from "./NotificationPreferences";

type Props = {
    locale: string;
};

export default function NotificationCenter({locale}: Props) {
    const t = useTranslations("NotificationPage");

    const [notifications, setNotifications] =
        useState<Notification[]>([]);

    const [filter, setFilter] =
        useState<
            | "all"
            | "unread"
            | "order"
            | "payment"
            | "support"
            | "security"
            | "system"
        >("all");

    useEffect(() => {
        setNotifications(getNotifications());
    }, []);

    const filtered = useMemo(() => {
        if (filter === "all") return notifications;
        if (filter === "unread")
            return notifications.filter((n) => !n.read);

        return notifications.filter((n) => n.type === filter);
    }, [notifications, filter]);

    const handleRead = (id: string) => {
        markRead(id);
        setNotifications(getNotifications());
    };

    const handleReadAll = () => {
        markAllRead();
        setNotifications(getNotifications());
    };

    const unread = notifications.filter((n) => !n.read).length;

    return (
        <section className="min-h-screen px-6 py-12">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400">
                            <Bell size={16}/>
                            {t("badge")}
                        </div>

                        <h1 className="text-4xl font-black">
                            {t("title")}
                        </h1>

                        <p className="mt-2 text-gray-400">
                            {t("subtitle")}
                        </p>

                    </div>

                    <button
                        onClick={handleReadAll}
                        className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-cyan-400 transition hover:bg-cyan-400 hover:text-black"
                    >
                        <CheckCheck size={18}/>
                        {t("markAll")}
                    </button>

                </div>

                <div className="mb-6 grid gap-3 sm:grid-cols-4">

                    <Stat title={t("stats.total")} value={notifications.length}/>
                    <Stat title={t("stats.unread")} value={unread}/>
                    <Stat title={t("stats.read")} value={notifications.length - unread}/>
                    <Stat title={t("stats.categories")} value={5}/>

                </div>

                <div className="mb-6 flex flex-wrap gap-2">

                    {[
                        "all",
                        "unread",
                        "order",
                        "payment",
                        "support",
                        "security",
                        "system",
                    ].map((key) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as any)}
                            className={`rounded-xl px-4 py-2 text-sm transition ${
                                filter === key
                                    ? "bg-cyan-400 text-black"
                                    : "border border-white/10 hover:border-cyan-400"
                            }`}
                        >
                            {t(`filters.${key}`)}
                        </button>
                    ))}

                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                    <div className="space-y-4">

                        {filtered.length === 0 ? (
                            <div className="rounded-3xl border border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">

                                <Bell size={40} className="mx-auto text-gray-500"/>

                                <h3 className="mt-5 text-xl font-bold">
                                    {t("empty")}
                                </h3>

                            </div>
                        ) : (
                            filtered.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    t={t}
                                    onRead={() => handleRead(notification.id)}
                                />
                            ))
                        )}

                    </div>

                    <NotificationPreferences/>

                </div>

            </div>
        </section>
    );
}

function Stat({
                  title,
                  value,
              }: {
    title: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="text-2xl font-black text-cyan-400">{value}</div>
            <div className="mt-2 text-sm text-gray-500">{title}</div>
        </div>
    );
}

function NotificationCard({
                              notification,
                              t,
                              onRead,
                          }: {
    notification: Notification;
    t: ReturnType<typeof useTranslations>;
    onRead: () => void;
}) {
    const icon = {
        order: <Package className="text-cyan-400"/>,
        payment: <CreditCard className="text-green-400"/>,
        support: <Headphones className="text-purple-400"/>,
        security: <Shield className="text-red-400"/>,
        system: <Settings className="text-yellow-400"/>,
    }[notification.type];

    return (
        <div
            className={`rounded-2xl border p-5 backdrop-blur-xl transition ${
                notification.read
                    ? "border-white/10 bg-white/5"
                    : "border-cyan-400/20 bg-cyan-400/5"
            }`}
        >

            <div className="flex items-start gap-4">

                <div className="mt-1">{icon}</div>

                <div className="flex-1">

                    <div className="flex items-center justify-between">

                        <h3 className="font-bold">{notification.title}</h3>

                        {!notification.read && (
                            <button
                                onClick={onRead}
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                <Check size={18}/>
                            </button>
                        )}

                    </div>

                    <p className="mt-2 text-gray-400">
                        {notification.message}
                    </p>

                    <div className="mt-4 text-xs text-gray-500">
                        {notification.createdAt}
                    </div>

                </div>

            </div>

        </div>
    );
}