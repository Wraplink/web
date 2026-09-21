"use client";

import {useMemo, useState} from "react";

import {
    Activity,
    Check,
    CircleAlert,
    CircleCheck,
    Copy,
    Gauge,
    Globe,
    Network,
    Power,
    RefreshCw,
    Route,
    Server,
    ShieldCheck,
    Wifi,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {useConnectionRealtime} from "@/hooks/useConnectionRealtime";

type Props = {
    locale: string;
};

type ConnectionMode =
    | "smart"
    | "gaming"
    | "streaming";

type EventType =
    | "success"
    | "info"
    | "warning";

type ConnectionEvent = {
    id: string;
    type: EventType;
    title: string;
    time: string;
};

type DiagnosticResult = {
    value: string;
    success: boolean;
};

const initialEvents: ConnectionEvent[] = [
    {
        id: "1",
        type: "success",
        title: "events.connected",
        time: "events.todayTime",
    },
    {
        id: "2",
        type: "info",
        title: "events.dnsUpdated",
        time: "events.yesterday",
    },
    {
        id: "3",
        type: "warning",
        title: "events.maintenance",
        time: "events.twoDaysAgo",
    },
];

export default function ConnectionContent({
                                              locale,
                                          }: Props) {
    const t = useTranslations("ConnectionPage");

    /*
     * ---------------------------------------------------------
     * Connection state
     * ---------------------------------------------------------
     */

    const [connected, setConnected] =
        useState(true);

    const [connecting, setConnecting] =
        useState(false);

    const [mode, setMode] =
        useState<ConnectionMode>("gaming");

    const [copied, setCopied] =
        useState<string | null>(null);

    const [runningTest, setRunningTest] =
        useState<string | null>(null);

    const [diagnostics, setDiagnostics] =
        useState<Record<string, DiagnosticResult>>(
            {}
        );

    const [events] =
        useState(initialEvents);

    /*
     * ---------------------------------------------------------
     * Real-time connection state
     *
     * BACKEND TODO:
     * Replace the mock implementation inside
     * useConnectionRealtime with WebSocket/SSE.
     * ---------------------------------------------------------
     */

    const realtime =
        useConnectionRealtime({
            enabled: connected,
        });

    /*
     * ---------------------------------------------------------
     * Connection data
     *
     * BACKEND TODO:
     * Replace static fields with:
     *
     * GET /api/v1/connection/status
     * GET /api/v1/connection/dns
     * GET /api/v1/edge/state
     * ---------------------------------------------------------
     */

    const connection = {
        latency: realtime.latency,
        packetLoss: realtime.packetLoss,
        primaryDns: "10.10.10.10",
        secondaryDns: "10.10.20.20",
        edge: realtime.edge,
        region: "Frankfurt",
        country: "Germany",
        load: realtime.load,
    };

    /*
     * ---------------------------------------------------------
     * Connection quality
     * ---------------------------------------------------------
     */

    const connectionQuality = useMemo(() => {
        if (connection.latency <= 20) {
            return "excellent";
        }

        if (connection.latency <= 40) {
            return "good";
        }

        return "average";
    }, [connection.latency]);

    /*
     * ---------------------------------------------------------
     * Toggle connection
     * ---------------------------------------------------------
     */

    const toggleConnection = async () => {
        if (connecting) {
            return;
        }

        setConnecting(true);

        /*
         * =====================================================
         * BACKEND TODO
         * =====================================================
         *
         * When connected:
         *
         * POST /api/v1/connection/disconnect
         *
         * When disconnected:
         *
         * POST /api/v1/connection/connect
         *
         * Expected response:
         *
         * {
         *     connected: true
         * }
         *
         * =====================================================
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 1200)
        );

        setConnected(
            (current) => !current
        );

        setConnecting(false);
    };

    /*
     * ---------------------------------------------------------
     * Copy DNS
     * ---------------------------------------------------------
     */

    const copyText = async (
        text: string,
        key: string
    ) => {
        try {
            await navigator.clipboard.writeText(
                text
            );

            setCopied(key);

            setTimeout(
                () => setCopied(null),
                2000
            );
        } catch {
            // Clipboard access may be unavailable.
        }
    };

    /*
     * ---------------------------------------------------------
     * Diagnostics
     * ---------------------------------------------------------
     */

    const runTest = async (
        type: string
    ) => {
        if (runningTest || !connected) {
            return;
        }

        setRunningTest(type);

        /*
         * =====================================================
         * BACKEND TODO
         * =====================================================
         *
         * POST /api/v1/diagnostics/ping
         * POST /api/v1/diagnostics/dns
         * POST /api/v1/diagnostics/route
         *
         * Expected example:
         *
         * {
         *     success: true,
         *     value: "18 ms"
         * }
         *
         * =====================================================
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 1200)
        );

        let result: DiagnosticResult;

        switch (type) {
            case "ping":
                result = {
                    value: `${connection.latency} ms`,
                    success: true,
                };
                break;

            case "dns":
                result = {
                    value: t(
                        "diagnostics.ok"
                    ),
                    success: true,
                };
                break;

            case "route":
                result = {
                    value: t(
                        "diagnostics.optimized"
                    ),
                    success: true,
                };
                break;

            default:
                result = {
                    value: "--",
                    success: false,
                };
        }

        setDiagnostics((current) => ({
            ...current,
            [type]: result,
        }));

        setRunningTest(null);
    };

    /*
     * ---------------------------------------------------------
     * Connection mode
     * ---------------------------------------------------------
     */

    const changeMode = async (
        nextMode: ConnectionMode
    ) => {
        if (nextMode === mode) {
            return;
        }

        setMode(nextMode);

        /*
         * =====================================================
         * BACKEND TODO
         * =====================================================
         *
         * PUT /api/v1/connection/mode
         *
         * {
         *     mode: nextMode
         * }
         *
         * =====================================================
         */
    };

    /*
     * ---------------------------------------------------------
     * Render
     * ---------------------------------------------------------
     */

    return (
        <section
            className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-12"
            lang={locale}
            dir={locale === "fa" ? "rtl" : "ltr"}
        >
            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    HEADER
                   ================================================= */}

                <div className="mb-8">

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400">
                        <Network size={16}/>

                        {t("badge")}
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                        {t("title")}
                    </h1>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
                        {t("subtitle")}
                    </p>

                </div>

                {/* =================================================
                    POWER BUTTON
                   ================================================= */}

                <ConnectionPowerCard
                    connected={connected}
                    connecting={connecting}
                    onToggle={toggleConnection}
                    t={t}
                />

                {/* =================================================
                    STATUS CARDS
                   ================================================= */}

                <div className="grid gap-4 md:grid-cols-3">

                    <StatusCard
                        icon={<Wifi size={22}/>}
                        label={t(
                            "status.connection"
                        )}
                        value={
                            connected
                                ? t(
                                    "status.connected"
                                )
                                : t(
                                    "status.disconnected"
                                )
                        }
                        color={
                            connected
                                ? "green"
                                : "red"
                        }
                    />

                    <StatusCard
                        icon={<Gauge size={22}/>}
                        label={t(
                            "status.latency"
                        )}
                        value={
                            connected
                                ? `${connection.latency} ms`
                                : "--"
                        }
                        color="cyan"
                    />

                    <StatusCard
                        icon={<Activity size={22}/>}
                        label={t(
                            "status.packetLoss"
                        )}
                        value={
                            connected
                                ? `${connection.packetLoss}%`
                                : "--"
                        }
                        color="purple"
                    />

                </div>

                {/* =================================================
                    DNS
                   ================================================= */}

                <div className="mt-8 grid gap-6 lg:grid-cols-2">

                    <DnsCard
                        title={t(
                            "dns.primary"
                        )}
                        value={
                            connection.primaryDns
                        }
                        copied={
                            copied === "primary"
                        }
                        onCopy={() =>
                            copyText(
                                connection.primaryDns,
                                "primary"
                            )
                        }
                    />

                    <DnsCard
                        title={t(
                            "dns.secondary"
                        )}
                        value={
                            connection.secondaryDns
                        }
                        copied={
                            copied === "secondary"
                        }
                        onCopy={() =>
                            copyText(
                                connection.secondaryDns,
                                "secondary"
                            )
                        }
                    />

                </div>

                {/* =================================================
                    CONNECTION MODE
                   ================================================= */}

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                            <Route size={22}/>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {t("mode.title")}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {t("mode.description")}
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">

                        <ModeButton
                            active={
                                mode === "smart"
                            }
                            onClick={() =>
                                changeMode(
                                    "smart"
                                )
                            }
                            title={t(
                                "mode.smart"
                            )}
                        />

                        <ModeButton
                            active={
                                mode === "gaming"
                            }
                            onClick={() =>
                                changeMode(
                                    "gaming"
                                )
                            }
                            title={t(
                                "mode.gaming"
                            )}
                        />

                        <ModeButton
                            active={
                                mode === "streaming"
                            }
                            onClick={() =>
                                changeMode(
                                    "streaming"
                                )
                            }
                            title={t(
                                "mode.streaming"
                            )}
                        />

                    </div>

                </div>

                {/* =================================================
                    EDGE SERVER
                   ================================================= */}

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                                <Server size={22}/>
                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-white">
                                    {t("edge.title")}
                                </h2>

                                <p className="mt-1 text-lg font-semibold text-cyan-400">
                                    {connection.region}
                                    {" · "}
                                    {connection.edge}
                                </p>

                            </div>

                        </div>

                        <span className="inline-flex w-fit rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-300">
                            {t("edge.optimal")}
                        </span>

                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">

                        <InfoCard
                            icon={<Globe size={18}/>}
                            label={t("edge.country")}
                            value={connection.country}
                        />

                        <InfoCard
                            icon={<Server size={18}/>}
                            label={t("edge.region")}
                            value={connection.region}
                        />

                        <InfoCard
                            icon={<Activity size={18}/>}
                            label={t("edge.load")}
                            value={`${connection.load}%`}
                        />

                    </div>

                </div>

                {/* =================================================
                    DIAGNOSTICS
                   ================================================= */}

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                            <ShieldCheck size={22}/>
                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-white">
                                {t(
                                    "diagnostics.title"
                                )}
                            </h2>

                            <p className="text-sm text-gray-500">
                                {t(
                                    "diagnostics.description"
                                )}
                            </p>

                        </div>

                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">

                        <DiagnosticCard
                            title={t(
                                "diagnostics.ping"
                            )}
                            value={
                                diagnostics.ping?.value ??
                                (connected
                                    ? `${connection.latency} ms`
                                    : "--")
                            }
                            icon={
                                <Activity
                                    size={20}
                                />
                            }
                            running={
                                runningTest ===
                                "ping"
                            }
                            success={
                                diagnostics.ping?.success
                            }
                            onRun={() =>
                                runTest("ping")
                            }
                            disabled={!connected}
                        />

                        <DiagnosticCard
                            title={t(
                                "diagnostics.dns"
                            )}
                            value={
                                diagnostics.dns?.value ??
                                (connected
                                    ? t(
                                        "diagnostics.ok"
                                    )
                                    : "--")
                            }
                            icon={
                                <CircleCheck
                                    size={20}
                                />
                            }
                            running={
                                runningTest ===
                                "dns"
                            }
                            success={
                                diagnostics.dns?.success
                            }
                            onRun={() =>
                                runTest("dns")
                            }
                            disabled={!connected}
                        />

                        <DiagnosticCard
                            title={t(
                                "diagnostics.route"
                            )}
                            value={
                                diagnostics.route?.value ??
                                (connected
                                    ? t(
                                        "diagnostics.optimized"
                                    )
                                    : "--")
                            }
                            icon={
                                <Route size={20}/>
                            }
                            running={
                                runningTest ===
                                "route"
                            }
                            success={
                                diagnostics.route?.success
                            }
                            onRun={() =>
                                runTest("route")
                            }
                            disabled={!connected}
                        />

                    </div>

                </div>

                {/* =================================================
                    EVENTS
                   ================================================= */}

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {t("events.title")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("events.description")}
                            </p>
                        </div>

                        <Activity
                            size={22}
                            className="text-cyan-400"
                        />

                    </div>

                    <div className="mt-6 space-y-3">

                        {events.map(
                            (event) => (
                                <EventCard
                                    key={
                                        event.id
                                    }
                                    event={
                                        event
                                    }
                                    t={t}
                                />
                            )
                        )}

                    </div>

                </div>

            </div>
        </section>
    );
}

/*
 * =============================================================
 * POWER CARD
 * =============================================================
 */

function ConnectionPowerCard({
                                 connected,
                                 connecting,
                                 onToggle,
                                 t,
                             }: {
    connected: boolean;
    connecting: boolean;
    onToggle: () => void;
    t: ReturnType<typeof useTranslations>;
}) {
    return (
        <div
            className={`
                relative mb-8 overflow-hidden rounded-3xl
                border p-8 transition-all duration-500
                ${
                connected
                    ? "border-cyan-400/20 bg-cyan-400/[0.04]"
                    : "border-red-400/20 bg-red-400/[0.03]"
            }
            `}
        >
            <div
                className={`
                    pointer-events-none absolute left-1/2 top-1/2
                    h-64 w-64 -translate-x-1/2 -translate-y-1/2
                    rounded-full blur-3xl
                    ${
                    connected
                        ? "bg-cyan-400/10"
                        : "bg-red-400/10"
                }
                `}
            />

            <div className="relative flex flex-col items-center text-center">

                <button
                    type="button"
                    onClick={onToggle}
                    disabled={connecting}
                    aria-label={
                        connected
                            ? t(
                                "power.disconnect"
                            )
                            : t(
                                "power.connect"
                            )
                    }
                    className={`
                        group relative flex h-36 w-36
                        items-center justify-center
                        rounded-full border-4
                        transition-all duration-500
                        sm:h-40 sm:w-40
                        ${
                        connecting
                            ? "cursor-wait animate-pulse"
                            : "hover:scale-105 active:scale-95"
                    }
                        ${
                        connected
                            ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_70px_rgba(34,211,238,0.35)]"
                            : "border-red-400/70 bg-red-400/5 shadow-[0_0_50px_rgba(248,113,113,0.2)]"
                    }
                    `}
                >

                    <div
                        className={`
                            absolute inset-3 rounded-full
                            border border-white/5
                            transition-all duration-500
                            ${
                            connected
                                ? "bg-cyan-400/5 group-hover:bg-cyan-400/10"
                                : "bg-red-400/5 group-hover:bg-red-400/10"
                        }
                        `}
                    />

                    <Power
                        size={58}
                        strokeWidth={2}
                        className={`
                            relative z-10
                            transition-all duration-500
                            ${
                            connected
                                ? "text-cyan-400"
                                : "text-red-400"
                        }
                            ${
                            connecting
                                ? "rotate-180"
                                : ""
                        }
                        `}
                    />

                </button>

                <h2 className="mt-7 text-2xl font-black text-white sm:text-3xl">
                    {connecting
                        ? t(
                            "power.connecting"
                        )
                        : connected
                            ? t(
                                "power.connected"
                            )
                            : t(
                                "power.disconnected"
                            )}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                    {connected
                        ? t(
                            "power.connectedDescription"
                        )
                        : t(
                            "power.disconnectedDescription"
                        )}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-bold tracking-wider">

                    <span
                        className={`
                            h-2.5 w-2.5 rounded-full
                            ${
                            connected
                                ? "bg-green-400 shadow-[0_0_10px_#4ade80]"
                                : "bg-red-400 shadow-[0_0_10px_#f87171]"
                        }
                        `}
                    />

                    {connected
                        ? t("power.online")
                        : t("power.offline")}

                </div>

            </div>
        </div>
    );
}

/*
 * =============================================================
 * STATUS CARD
 * =============================================================
 */

function StatusCard({
                        icon,
                        label,
                        value,
                        color,
                    }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color:
        | "green"
        | "cyan"
        | "purple"
        | "red";
}) {
    const colors = {
        green:
            "bg-green-400/10 text-green-400",
        cyan:
            "bg-cyan-400/10 text-cyan-400",
        purple:
            "bg-purple-400/10 text-purple-400",
        red:
            "bg-red-400/10 text-red-400",
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div
                className={`
                    flex h-12 w-12 items-center
                    justify-center rounded-xl
                    ${colors[color]}
                `}
            >
                {icon}
            </div>

            <div className="mt-5 text-sm text-gray-500">
                {label}
            </div>

            <div className="mt-2 text-3xl font-black text-white">
                {value}
            </div>

        </div>
    );
}

/*
 * =============================================================
 * DNS CARD
 * =============================================================
 */

function DnsCard({
                     title,
                     value,
                     copied,
                     onCopy,
                 }: {
    title: string;
    value: string;
    copied: boolean;
    onCopy: () => void;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center justify-between gap-4">

                <div>

                    <div className="text-sm text-gray-500">
                        {title}
                    </div>

                    <div className="mt-2 text-2xl font-black text-cyan-400">
                        {value}
                    </div>

                </div>

                <button
                    type="button"
                    onClick={onCopy}
                    className="shrink-0 rounded-xl border border-white/10 p-3 text-gray-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                    aria-label="Copy DNS"
                >
                    {copied ? (
                        <Check size={18}/>
                    ) : (
                        <Copy size={18}/>
                    )}
                </button>

            </div>

        </div>
    );
}

/*
 * =============================================================
 * MODE BUTTON
 * =============================================================
 */

function ModeButton({
                        active,
                        onClick,
                        title,
                    }: {
    active: boolean;
    onClick: () => void;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                rounded-xl border px-4 py-4
                font-semibold transition
                ${
                active
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                    : "border-white/10 bg-black/20 text-gray-400 hover:border-cyan-400/30 hover:text-white"
            }
            `}
        >
            {title}
        </button>
    );
}

/*
 * =============================================================
 * INFO CARD
 * =============================================================
 */

function InfoCard({
                      icon,
                      label,
                      value,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

            <div className="flex items-center gap-2 text-cyan-400">

                {icon}

                <span className="text-xs text-gray-500">
                    {label}
                </span>

            </div>

            <div className="mt-3 text-xl font-bold text-white">
                {value}
            </div>

        </div>
    );
}

/*
 * =============================================================
 * DIAGNOSTIC CARD
 * =============================================================
 */

function DiagnosticCard({
                            title,
                            value,
                            icon,
                            running,
                            success,
                            onRun,
                            disabled,
                        }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    running: boolean;
    success?: boolean;
    onRun: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

            <div className="flex items-center justify-between">

                <div
                    className={
                        success === true
                            ? "text-green-400"
                            : "text-cyan-400"
                    }
                >
                    {icon}
                </div>

                <button
                    type="button"
                    onClick={onRun}
                    disabled={
                        running ||
                        disabled
                    }
                    aria-label={`Run ${title} test`}
                    className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-cyan-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <RefreshCw
                        size={16}
                        className={
                            running
                                ? "animate-spin"
                                : ""
                        }
                    />
                </button>

            </div>

            <div className="mt-4 text-sm text-gray-500">
                {title}
            </div>

            <div className="mt-2 text-2xl font-black text-white">
                {value}
            </div>

        </div>
    );
}

/*
 * =============================================================
 * EVENT CARD
 * =============================================================
 */

function EventCard({
                       event,
                       t,
                   }: {
    event: ConnectionEvent;
    t: ReturnType<typeof useTranslations>;
}) {
    const styles = {
        success:
            "border-green-400/20 bg-green-400/5 text-green-400",

        info:
            "border-cyan-400/20 bg-cyan-400/5 text-cyan-400",

        warning:
            "border-yellow-400/20 bg-yellow-400/5 text-yellow-400",
    };

    const Icon =
        event.type === "success"
            ? CircleCheck
            : event.type === "info"
                ? RefreshCw
                : CircleAlert;

    return (
        <div
            className={`
                rounded-xl border p-4
                ${styles[event.type]}
            `}
        >
            <div className="flex items-center gap-3">

                <Icon size={18}/>

                <div className="flex-1">

                    <div className="font-semibold text-white">
                        {t(event.title)}
                    </div>

                    <div className="mt-1 text-xs opacity-80">
                        {t(event.time)}
                    </div>

                </div>

            </div>
        </div>
    );
}