"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {apiClient} from "@/lib/api/client";

type Settings = {enabled: boolean; configured: boolean};

const endpoint = "/api/v1/admin/auth/google/settings";

export default function AdminGoogleAuthContent() {
    const t = useTranslations("AdminGoogleAuth");
    const [settings, setSettings] = useState<Settings>();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<"loadError" | "saveError" | "saved">();

    useEffect(() => {
        const controller = new AbortController();
        apiClient.get<Settings>(endpoint, {signal: controller.signal})
            .then(({data}) => setSettings(data))
            .catch(() => {
                if (!controller.signal.aborted) setMessage("loadError");
            });
        return () => controller.abort();
    }, []);

    async function toggle() {
        if (!settings) return;
        setSaving(true);
        setMessage(undefined);
        try {
            const {data} = await apiClient.put<Settings>(endpoint, {enabled: !settings.enabled});
            setSettings(data);
            setMessage("saved");
        } catch {
            setMessage("saveError");
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="space-y-5 p-6">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            {!settings && !message && <p role="status">{t("loading")}</p>}
            {settings && (
                <section className="max-w-xl space-y-4 rounded-xl border border-white/15 p-5">
                    <label className="flex items-center gap-3 font-semibold">
                        <input
                            type="checkbox"
                            checked={settings.enabled}
                            disabled={saving || (!settings.configured && !settings.enabled)}
                            onChange={() => void toggle()}
                            className="h-4 w-4 accent-cyan-400"
                        />
                        {t("toggle")}
                    </label>
                    {!settings.configured && <p className="text-sm text-gray-300">{t("unconfigured")}</p>}
                </section>
            )}
            {message && <p role={message === "saved" ? "status" : "alert"}>{t(message)}</p>}
        </main>
    );
}
