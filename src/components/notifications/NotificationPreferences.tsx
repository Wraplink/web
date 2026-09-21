"use client";

import {useEffect, useState} from "react";
import {Bell, Mail, Smartphone} from "lucide-react";
import {useTranslations} from "next-intl";
import {useLocale} from "next-intl";

const KEY = "wraplink_notification_preferences";

type Preferences = {
    orders: boolean;
    payments: boolean;
    support: boolean;
    security: boolean;
    system: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
};

const defaults: Preferences = {
    orders: true,
    payments: true,
    support: true,
    security: true,
    system: true,
    email: true,
    push: false,
    sms: false,
};

export default function NotificationPreferences() {
    const t = useTranslations("NotificationPage.preferences");

    const [prefs, setPrefs] = useState(defaults);

    useEffect(() => {
        const raw = localStorage.getItem(KEY);
        if (raw) setPrefs(JSON.parse(raw));
    }, []);

    const toggle = (key: keyof Preferences) => {
        const next = {...prefs, [key]: !prefs[key]};
        setPrefs(next);
        localStorage.setItem(KEY, JSON.stringify(next));

        /*
         * BACKEND TODO
         * PUT /api/v1/profile/preferences
         */
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
                <Bell className="text-cyan-400"/>
                <h2 className="text-xl font-bold">{t("title")}</h2>
            </div>

            <div className="space-y-3">
                <Toggle label={t("orders")} checked={prefs.orders} onClick={() => toggle("orders")}/>
                <Toggle label={t("payments")} checked={prefs.payments} onClick={() => toggle("payments")}/>
                <Toggle label={t("support")} checked={prefs.support} onClick={() => toggle("support")}/>
                <Toggle label={t("security")} checked={prefs.security} onClick={() => toggle("security")}/>
                <Toggle label={t("system")} checked={prefs.system} onClick={() => toggle("system")}/>
            </div>

            <div className="my-6 border-t border-white/10"/>

            <div className="space-y-3">
                <Toggle icon={<Mail size={18}/>} label={t("email")} checked={prefs.email}
                        onClick={() => toggle("email")}/>
                <Toggle icon={<Bell size={18}/>} label={t("push")} checked={prefs.push}
                        onClick={() => toggle("push")}/>
                <Toggle icon={<Smartphone size={18}/>} label={t("sms")} checked={prefs.sms}
                        onClick={() => toggle("sms")}/>
            </div>
        </div>
    );
}

function Toggle({
                    icon,
                    label,
                    checked,
                    onClick,
                }: {
    icon?: React.ReactNode;
    label: string;
    checked: boolean;
    onClick: () => void;
}) {

    const locale = useLocale();

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-cyan-400"
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>

            <div
                className={`flex h-6 w-11 items-center rounded-full px-0.5 transition ${
                    checked ? "bg-cyan-400" : "bg-gray-600"
                } ${
                    (locale === "fa") === checked
                        ? "justify-start"
                        : "justify-end"
                }`}
            >
                <div className="h-5 w-5 rounded-full bg-white" />
            </div>
        </button>
    );
}