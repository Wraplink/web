"use client";

import {useState} from "react";

import {
    Wifi,
    WifiOff,
    Globe,
    Server,
    Copy,
    Smartphone,
    Download,
    Clock,
    Zap
} from "lucide-react";

import {useTranslations} from "next-intl";

type Props = {
    locale: string;
};

export default function ConnectionContent({locale}: Props) {

    const t = useTranslations("ConnectionPage");

    const [connected, setConnected] = useState(true);

    /*
     * ============================================================
     * BACKEND TODO
     * ============================================================
     *
     * GET /api/v1/connection/current
     * POST /api/v1/connection/connect
     * POST /api/v1/connection/disconnect
     * GET /api/v1/connection/config
     * GET /api/v1/connection/logs
     *
     * Replace mock values with API responses.
     * ============================================================
     */

    const connection = {
        publicIp: "185.220.15.120",
        dns1: "10.10.10.10",
        dns2: "10.10.10.11",
        edge: "Frankfurt-01",
        latency: "18 ms"
    };

    const logs = [
        "Connected to Frankfurt-01",
        "DNS updated",
        "Connection refreshed",
        "Configuration synchronized"
    ];

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">

            {/* Header */}

            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex flex-wrap items-center justify-between gap-6">

                    <div>

                        <h1 className="text-4xl font-black">
                            {t("title")}
                        </h1>

                        <p className="mt-3 text-gray-300">
                            {t("subtitle")}
                        </p>

                    </div>

                    <button
                        onClick={() => setConnected(!connected)}
                        className={`rounded-xl px-6 py-3 font-bold transition ${
                            connected
                                ? "bg-red-500 hover:bg-red-400"
                                : "bg-cyan-400 text-black hover:scale-105"
                        }`}
                    >
                        {connected
                            ? t("disconnect")
                            : t("connect")}
                    </button>

                </div>

            </div>

            {/* Status */}

            <div className="mt-8 grid gap-6 md:grid-cols-3">

                <StatusCard
                    icon={
                        connected
                            ? <Wifi className="text-green-400"/>
                            : <WifiOff className="text-red-400"/>
                    }
                    title={connected
                        ? t("connected")
                        : t("disconnected")}
                    value={connected ? "Online" : "Offline"}
                />

                <StatusCard
                    icon={<Zap className="text-cyan-400"/>}
                    title={t("latency")}
                    value={connection.latency}
                />

                <StatusCard
                    icon={<Server className="text-cyan-400"/>}
                    title={t("info.edgeServer")}
                    value={connection.edge}
                />

            </div>

            {/* Information */}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-2xl font-bold">
                        {t("info.title")}
                    </h2>

                    <div className="mt-6 space-y-5">

                        <InfoRow
                            label={t("info.publicIp")}
                            value={connection.publicIp}
                            copy={() => copy(connection.publicIp)}
                            t={t}
                        />

                        <InfoRow
                            label={t("info.primaryDns")}
                            value={connection.dns1}
                            copy={() => copy(connection.dns1)}
                            t={t}
                        />

                        <InfoRow
                            label={t("info.secondaryDns")}
                            value={connection.dns2}
                            copy={() => copy(connection.dns2)}
                            t={t}
                        />

                        <InfoRow
                            label={t("info.edgeServer")}
                            value={connection.edge}
                            copy={() => copy(connection.edge)}
                            t={t}
                        />

                    </div>

                </div>

                {/* QR Setup */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="flex items-center gap-3">

                        <Smartphone className="text-cyan-400"/>

                        <h2 className="text-2xl font-bold">
                            {t("setup.title")}
                        </h2>

                    </div>

                    <p className="mt-4 text-gray-300">
                        {t("setup.description")}
                    </p>

                    <div className="mt-8 flex justify-center">

                        <div className="flex h-48 w-48 items-center justify-center rounded-3xl border border-cyan-400/20 bg-black/30 text-gray-500">
                            QR
                        </div>

                    </div>

                </div>

            </div>

            {/* Downloads */}

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center gap-3">

                    <Download className="text-cyan-400"/>

                    <h2 className="text-2xl font-bold">
                        {t("download.title")}
                    </h2>

                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                    {[
                        t("download.windows"),
                        t("download.android"),
                        t("download.ios"),
                        t("download.config")
                    ].map((item) => (
                        <button
                            key={item}
                            className="rounded-xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-cyan-400 hover:bg-black/30"
                        >
                            {item}
                        </button>
                    ))}

                </div>

            </div>

            {/* Logs */}

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                <div className="flex items-center gap-3">

                    <Clock className="text-cyan-400"/>

                    <h2 className="text-2xl font-bold">
                        {t("logs")}
                    </h2>

                </div>

                <div className="mt-6 space-y-3">

                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                            {log}
                        </div>
                    ))}

                </div>

            </div>

        </section>
    );
}

function StatusCard({
                        icon,
                        title,
                        value
                    }: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center justify-between">

                <div className="text-gray-300">
                    {title}
                </div>

                {icon}

            </div>

            <div className="mt-5 text-3xl font-black text-cyan-400">
                {value}
            </div>

        </div>
    );
}

function InfoRow({
                     label,
                     value,
                     copy,
                     t
                 }: {
    label: string;
    value: string;
    copy: () => void;
    t: (key: string) => string;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <div>

                <div className="text-sm text-gray-400">
                    {label}
                </div>

                <div className="font-semibold">
                    {value}
                </div>

            </div>

            <button
                onClick={copy}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:border-cyan-400 hover:text-cyan-400"
            >
                <Copy size={16}/>
                {t("copy")}
            </button>

        </div>
    );
}