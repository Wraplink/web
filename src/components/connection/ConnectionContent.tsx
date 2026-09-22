"use client";

import {
    Activity,
    CheckCircle2,
    Clipboard,
    Cloud,
    Globe2,
    Loader2,
    MapPin,
    Network,
    Power,
    RefreshCw,
    Route,
    Server,
    ShieldCheck,
    Wifi,
    XCircle,
    Zap,
} from "lucide-react";
import {
    useEffect,
    useState,
} from "react";
import {useTranslations} from "next-intl";

import {
    connect,
    disconnect,
    getConnectionEvents,
    getConnectionStatus,
    runDiagnostic,
    updateConnectionMode,
    type ConnectionEvent,
    type ConnectionMode,
    type ConnectionStatus,
    type DiagnosticResult,
    type DiagnosticType,
} from "@/lib/api/connection";

import {useConnectionRealtime} from "@/hooks/useConnectionRealtime";

type Props = {
    locale: string;
};

export default function ConnectionContent({
    locale,
}: Props) {
    const t = useTranslations("ConnectionPage");

    const [connection, setConnection] =
        useState<ConnectionStatus | null>(null);

    const [events, setEvents] =
        useState<ConnectionEvent[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [connectionLoading, setConnectionLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [diagnosticLoading, setDiagnosticLoading] =
        useState<DiagnosticType | null>(null);

    const [diagnosticResults, setDiagnosticResults] =
        useState<
            Partial<Record<DiagnosticType, DiagnosticResult>>
        >({});

    const [modeLoading, setModeLoading] =
        useState(false);

    /*
     * BACKEND TODO:
     * Replace initial API loading with the real Go backend.
     *
     * GET /api/v1/connection/status
     * GET /api/v1/connection/events
     */
    const loadConnection = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                connectionStatus,
                connectionEvents,
            ] = await Promise.all([
                getConnectionStatus(),
                getConnectionEvents(),
            ]);

            setConnection(connectionStatus);
            setEvents(connectionEvents);
        } catch (err) {
            console.error(
                "Failed to load connection:",
                err
            );

            setError(
                t("errors.loadFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConnection();
    }, []);

    /*
     * Realtime connection information.
     *
     * BACKEND TODO:
     * Replace the mock realtime hook with:
     *
     * WebSocket:
     * wss://api.wraplink.com/api/v1/connection/stream
     *
     * or:
     *
     * SSE:
     * GET /api/v1/connection/stream
     */
    const realtime =
        useConnectionRealtime({
            enabled:
                connection?.connected ?? false,
        });

    const liveConnection: ConnectionStatus | null =
        connection
            ? {
                ...connection,
                latency:
                    realtime.latency,
                packetLoss:
                    realtime.packetLoss,
                edge:
                    realtime.edge,
                load:
                    realtime.load,
            }
            : null;

    /*
     * Connect / disconnect.
     *
     * BACKEND TODO:
     *
     * POST /api/v1/connection/connect
     * POST /api/v1/connection/disconnect
     */
    const toggleConnection = async () => {
        if (!connection) {
            return;
        }

        try {
            setConnectionLoading(true);
            setError(null);

            if (connection.connected) {
                await disconnect();
            } else {
                await connect();
            }

            const updated =
                await getConnectionStatus();

            setConnection(updated);
        } catch (err) {
            console.error(
                "Failed to change connection state:",
                err
            );

            setError(
                t("errors.connectionFailed")
            );
        } finally {
            setConnectionLoading(false);
        }
    };

    /*
     * Run diagnostic.
     *
     * BACKEND TODO:
     *
     * POST /api/v1/diagnostics/ping
     * POST /api/v1/diagnostics/dns
     * POST /api/v1/diagnostics/route
     */
    const handleDiagnostic = async (
        type: DiagnosticType
    ) => {
        try {
            setDiagnosticLoading(type);
            setError(null);

            const result =
                await runDiagnostic(type);

            setDiagnosticResults(
                (current) => ({
                    ...current,
                    [type]: result,
                })
            );
        } catch (err) {
            console.error(
                `Diagnostic failed: ${type}`,
                err
            );

            setError(
                t("errors.diagnosticFailed")
            );
        } finally {
            setDiagnosticLoading(null);
        }
    };

    /*
     * Change connection mode.
     *
     * BACKEND TODO:
     *
     * PUT /api/v1/connection/mode
     *
     * {
     *   "mode": "gaming"
     * }
     */
    const handleModeChange = async (
        mode: ConnectionMode
    ) => {
        if (!connection) {
            return;
        }

        const previousMode =
            connection.mode;

        try {
            setModeLoading(true);
            setError(null);

            // Optimistic update.
            setConnection(
                (current) =>
                    current
                        ? {
                            ...current,
                            mode,
                        }
                        : current
            );

            await updateConnectionMode(mode);
        } catch (err) {
            console.error(
                "Failed to update connection mode:",
                err
            );

            // Rollback.
            setConnection(
                (current) =>
                    current
                        ? {
                            ...current,
                            mode: previousMode,
                        }
                        : current
            );

            setError(
                t("errors.modeUpdateFailed")
            );
        } finally {
            setModeLoading(false);
        }
    };

    const copyValue = async (
        value: string
    ) => {
        try {
            await navigator.clipboard.writeText(
                value
            );
        } catch (err) {
            console.error(
                "Clipboard error:",
                err
            );

            setError(
                t("errors.copyFailed")
            );
        }
    };

    if (loading) {
        return (
            <ConnectionLoading/>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div
                    className={
                        locale === "fa"
                            ? "mb-8 text-right"
                            : "mb-8 text-left"
                    }
                >
                    <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2">
                            <Wifi className="h-6 w-6 text-cyan-400"/>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight">
                            {t("title")}
                        </h1>
                    </div>

                    <p className="text-sm text-white/50">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <ErrorBanner
                        message={error}
                        onClose={() =>
                            setError(null)
                        }
                    />
                )}

                {liveConnection && (
                    <>
                        {/* Top grid */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            <ConnectionPowerCard
                                connected={
                                    liveConnection.connected
                                }
                                loading={
                                    connectionLoading
                                }
                                onToggle={
                                    toggleConnection
                                }
                            />

                            <StatusCard
                                connection={
                                    liveConnection
                                }
                            />

                            <DnsCard
                                primaryDns={
                                    liveConnection.primaryDns
                                }
                                secondaryDns={
                                    liveConnection.secondaryDns
                                }
                                onCopy={
                                    copyValue
                                }
                            />
                        </div>

                        {/* Connection details */}
                        <section className="mt-6">
                            <SectionHeader
                                icon={
                                    <Globe2 className="h-5 w-5"/>
                                }
                                title={t(
                                    "connectionDetails.title"
                                )}
                            />

                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <InfoCard
                                    icon={
                                        <Server className="h-5 w-5"/>
                                    }
                                    label={t(
                                        "connectionDetails.edgeServer"
                                    )}
                                    value={
                                        liveConnection.edge
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <MapPin className="h-5 w-5"/>
                                    }
                                    label={t(
                                        "connectionDetails.region"
                                    )}
                                    value={
                                        liveConnection.region
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <Globe2 className="h-5 w-5"/>
                                    }
                                    label={t(
                                        "connectionDetails.country"
                                    )}
                                    value={
                                        liveConnection.country
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <Activity className="h-5 w-5"/>
                                    }
                                    label={t(
                                        "connectionDetails.serverLoad"
                                    )}
                                    value={`${liveConnection.load}%`}
                                />
                            </div>
                        </section>

                        {/* Connection mode */}
                        <section className="mt-8">
                            <SectionHeader
                                icon={
                                    <Zap className="h-5 w-5"/>
                                }
                                title={t(
                                    "modes.title"
                                )}
                            />

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <ModeButton
                                    mode="smart"
                                    currentMode={
                                        liveConnection.mode
                                    }
                                    loading={
                                        modeLoading
                                    }
                                    icon={
                                        <Network className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "modes.smart.title"
                                    )}
                                    description={t(
                                        "modes.smart.description"
                                    )}
                                    onClick={
                                        handleModeChange
                                    }
                                />

                                <ModeButton
                                    mode="gaming"
                                    currentMode={
                                        liveConnection.mode
                                    }
                                    loading={
                                        modeLoading
                                    }
                                    icon={
                                        <Zap className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "modes.gaming.title"
                                    )}
                                    description={t(
                                        "modes.gaming.description"
                                    )}
                                    onClick={
                                        handleModeChange
                                    }
                                />

                                <ModeButton
                                    mode="streaming"
                                    currentMode={
                                        liveConnection.mode
                                    }
                                    loading={
                                        modeLoading
                                    }
                                    icon={
                                        <Cloud className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "modes.streaming.title"
                                    )}
                                    description={t(
                                        "modes.streaming.description"
                                    )}
                                    onClick={
                                        handleModeChange
                                    }
                                />
                            </div>
                        </section>

                        {/* Diagnostics */}
                        <section className="mt-8">
                            <SectionHeader
                                icon={
                                    <ShieldCheck className="h-5 w-5"/>
                                }
                                title={t(
                                    "diagnostics.title"
                                )}
                            />

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                <DiagnosticCard
                                    type="ping"
                                    icon={
                                        <Activity className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "diagnostics.ping.title"
                                    )}
                                    description={t(
                                        "diagnostics.ping.description"
                                    )}
                                    result={
                                        diagnosticResults
                                            .ping
                                    }
                                    loading={
                                        diagnosticLoading ===
                                        "ping"
                                    }
                                    onRun={
                                        handleDiagnostic
                                    }
                                />

                                <DiagnosticCard
                                    type="dns"
                                    icon={
                                        <Network className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "diagnostics.dns.title"
                                    )}
                                    description={t(
                                        "diagnostics.dns.description"
                                    )}
                                    result={
                                        diagnosticResults
                                            .dns
                                    }
                                    loading={
                                        diagnosticLoading ===
                                        "dns"
                                    }
                                    onRun={
                                        handleDiagnostic
                                    }
                                />

                                <DiagnosticCard
                                    type="route"
                                    icon={
                                        <Route className="h-5 w-5"/>
                                    }
                                    title={t(
                                        "diagnostics.route.title"
                                    )}
                                    description={t(
                                        "diagnostics.route.description"
                                    )}
                                    result={
                                        diagnosticResults
                                            .route
                                    }
                                    loading={
                                        diagnosticLoading ===
                                        "route"
                                    }
                                    onRun={
                                        handleDiagnostic
                                    }
                                />
                            </div>
                        </section>
                    </>
                )}

                {/* Events */}
                <section className="mt-8">
                    <SectionHeader
                        icon={
                            <RefreshCw className="h-5 w-5"/>
                        }
                        title={t(
                            "events.title"
                        )}
                    />

                    {events.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-sm text-white/40">
                            {t(
                                "events.empty"
                            )}
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {events.map(
                                (event) => (
                                    <EventCard
                                        key={
                                            event.id
                                        }
                                        event={
                                            event
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                     */
/* -------------------------------------------------------------------------- */

function ConnectionLoading() {
    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex items-center gap-3 text-white/60">
                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400"/>
                        <span>
                            Loading connection...
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* -------------------------------------------------------------------------- */
/* Error banner                                                                */
/* -------------------------------------------------------------------------- */

function ErrorBanner({
    message,
    onClose,
}: {
    message: string;
    onClose: () => void;
}) {
    return (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3">
            <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 shrink-0 text-red-400"/>

                <p className="text-sm text-red-200">
                    {message}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="text-xs text-white/50 transition hover:text-white"
            >
                ×
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Section header                                                              */
/* -------------------------------------------------------------------------- */

function SectionHeader({
    icon,
    title,
}: {
    icon: React.ReactNode;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-400">
                {icon}
            </div>

            <h2 className="text-lg font-semibold">
                {title}
            </h2>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Power card                                                                  */
/* -------------------------------------------------------------------------- */

function ConnectionPowerCard({
                                 connected,
                                 loading,
                                 onToggle,
                             }: {
    connected: boolean;
    loading: boolean;
    onToggle: () => void;
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <div className="flex flex-col items-center justify-center py-6">
                <div className="relative">
                    {/* Outer animated rings */}
                    {connected && (
                        <>
                            <span
                                className="
                                    absolute
                                    inset-0
                                    rounded-full
                                    border
                                    border-cyan-400/50
                                    animate-ping
                                    pointer-events-none
                                "
                            />

                            <span
                                className="
                                    absolute
                                    -inset-3
                                    rounded-full
                                    border
                                    border-cyan-400/20
                                    animate-pulse
                                    pointer-events-none
                                "
                            />
                        </>
                    )}

                    <button
                        type="button"
                        onClick={onToggle}
                        disabled={loading}
                        aria-label={
                            connected
                                ? "Disconnect"
                                : "Connect"
                        }
                        className={`
                            relative
                            z-10
                            flex
                            h-32
                            w-32
                            items-center
                            justify-center
                            rounded-full
                            border
                            transition-all
                            duration-300

                            ${
                            connected
                                ? `
                                        border-cyan-400/70
                                        bg-cyan-400/10
                                        shadow-[0_0_50px_rgba(34,211,238,0.45)]
                                    `
                                : `
                                        border-white/10
                                        bg-white/5
                                        hover:border-cyan-400/50
                                        hover:bg-cyan-400/5
                                        hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
                                    `
                        }

                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        `}
                    >
                        {/* Inner glow */}
                        {connected && (
                            <span
                                className="
                                    absolute
                                    inset-3
                                    rounded-full
                                    bg-cyan-400/10
                                    animate-pulse
                                "
                            />
                        )}

                        {/* Inner border */}
                        <span
                            className={`
                                absolute
                                inset-3
                                rounded-full
                                border
                                transition-colors
                                ${
                                connected
                                    ? "border-cyan-400/40"
                                    : "border-white/10"
                            }
                            `}
                        />

                        {/* Power icon */}
                        {loading ? (
                            <Loader2
                                className="
                                    relative
                                    z-20
                                    h-10
                                    w-10
                                    animate-spin
                                    text-cyan-400
                                "
                            />
                        ) : (
                            <Power
                                className={`
                                    relative
                                    z-20
                                    h-12
                                    w-12
                                    transition-all
                                    duration-300
                                    ${
                                    connected
                                        ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                        : "text-white/50 group-hover:text-cyan-400"
                                }
                                `}
                            />
                        )}
                    </button>
                </div>

                <div className="mt-7 text-center">
                    <div
                        className={`
                            mx-auto
                            mb-3
                            h-2.5
                            w-2.5
                            rounded-full
                            transition-all
                            ${
                            connected
                                ? "bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-pulse"
                                : "bg-white/20"
                        }
                        `}
                    />

                    <h2 className="text-xl font-semibold">
                        {connected
                            ? "Connected"
                            : "Disconnected"}
                    </h2>

                    <p className="mt-1 text-sm text-white/40">
                        {connected
                            ? "Your connection is active"
                            : "Click to connect"}
                    </p>
                </div>
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Status card                                                                 */
/* -------------------------------------------------------------------------- */

function StatusCard({
    connection,
}: {
    connection: ConnectionStatus;
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <p className="text-sm text-white/40">
                        Connection
                    </p>

                    <h3 className="mt-1 text-xl font-semibold">
                        {connection.connected
                            ? "Online"
                            : "Offline"}
                    </h3>
                </div>

                {connection.connected ? (
                    <CheckCircle2 className="h-7 w-7 text-cyan-400"/>
                ) : (
                    <XCircle className="h-7 w-7 text-white/30"/>
                )}
            </div>

            <div className="space-y-4">
                <MetricRow
                    label="Latency"
                    value={`${connection.latency} ms`}
                />

                <MetricRow
                    label="Packet Loss"
                    value={`${connection.packetLoss}%`}
                />

                <MetricRow
                    label="Server Load"
                    value={`${connection.load}%`}
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* DNS card                                                                    */
/* -------------------------------------------------------------------------- */

function DnsCard({
    primaryDns,
    secondaryDns,
    onCopy,
}: {
    primaryDns: string;
    secondaryDns: string;
    onCopy: (value: string) => void;
}) {
    return (
        <section className="rounded-3xl border border-white/10 bg-black/20 p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2">
                    <Network className="h-5 w-5 text-cyan-400"/>
                </div>

                <div>
                    <p className="text-sm text-white/40">
                        DNS
                    </p>

                    <h3 className="font-semibold">
                        WrapLink DNS
                    </h3>
                </div>
            </div>

            <div className="space-y-3">
                <DnsRow
                    label="Primary"
                    value={primaryDns}
                    onCopy={onCopy}
                />

                <DnsRow
                    label="Secondary"
                    value={secondaryDns}
                    onCopy={onCopy}
                />
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Mode button                                                                 */
/* -------------------------------------------------------------------------- */

function ModeButton({
    mode,
    currentMode,
    loading,
    icon,
    title,
    description,
    onClick,
}: {
    mode: ConnectionMode;
    currentMode: ConnectionMode;
    loading: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: (
        mode: ConnectionMode
    ) => void;
}) {
    const active =
        mode === currentMode;

    return (
        <button
            type="button"
            disabled={loading}
            onClick={() => onClick(mode)}
            className={`
relative rounded-2xl border p-5
text-left transition-all
disabled:cursor-not-allowed
disabled:opacity-60
${
    active
        ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
}
`}
        >
            <div className="flex items-start gap-4">
                <div
                    className={`
rounded-xl p-3
${
    active
        ? "bg-cyan-400/10 text-cyan-400"
        : "bg-white/5 text-white/50"
}
`}
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                            {title}
                        </h3>

                        {active && (
                            <CheckCircle2 className="h-4 w-4 text-cyan-400"/>
                        )}
                    </div>

                    <p className="mt-1 text-sm leading-6 text-white/40">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/* Diagnostic card                                                            */
/* -------------------------------------------------------------------------- */

function DiagnosticCard({
    type,
    icon,
    title,
    description,
    result,
    loading,
    onRun,
}: {
    type: DiagnosticType;
    icon: React.ReactNode;
    title: string;
    description: string;
    result?: DiagnosticResult;
    loading: boolean;
    onRun: (
        type: DiagnosticType
    ) => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-4">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-400">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">
                        {title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-white/40">
                        {description}
                    </p>
                </div>
            </div>

            {result && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                    {result.success ? (
                        <CheckCircle2 className="h-4 w-4 text-cyan-400"/>
                    ) : (
                        <XCircle className="h-4 w-4 text-red-400"/>
                    )}

                    <span className="text-sm text-white/70">
                        {result.value}
                    </span>
                </div>
            )}

            <button
                type="button"
                disabled={loading}
                onClick={() => onRun(type)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:border-cyan-400/30 hover:bg-cyan-400/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        Running...
                    </>
                ) : (
                    <>
                        <RefreshCw className="h-4 w-4"/>
                        Run Test
                    </>
                )}
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Info card                                                                   */
/* -------------------------------------------------------------------------- */

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
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-white/5 p-2 text-cyan-400">
                    {icon}
                </div>

                <span className="text-sm text-white/40">
                    {label}
                </span>
            </div>

            <p className="truncate text-lg font-semibold">
                {value}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Metric row                                                                  */
/* -------------------------------------------------------------------------- */

function MetricRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-white/40">
                {label}
            </span>

            <span className="font-medium">
                {value}
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* DNS row                                                                     */
/* -------------------------------------------------------------------------- */

function DnsRow({
    label,
    value,
    onCopy,
}: {
    label: string;
    value: string;
    onCopy: (value: string) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3">
            <div className="min-w-0">
                <p className="text-xs text-white/40">
                    {label}
                </p>

                <p className="mt-1 truncate font-mono text-sm">
                    {value}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onCopy(value)}
                className="shrink-0 rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-cyan-400"
                aria-label={`Copy ${label} DNS`}
            >
                <Clipboard className="h-4 w-4"/>
            </button>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Event card                                                                  */
/* -------------------------------------------------------------------------- */

function EventCard({
    event,
}: {
    event: ConnectionEvent;
}) {
    const icon =
        event.type === "success"
            ? (
                <CheckCircle2 className="h-5 w-5 text-cyan-400"/>
            )
            : event.type === "warning"
                ? (
                    <XCircle className="h-5 w-5 text-yellow-400"/>
                )
                : (
                    <Activity className="h-5 w-5 text-white/50"/>
                );

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
            <div className="shrink-0">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {event.title}
                </p>

                <p className="mt-1 text-xs text-white/40">
                    {event.time}
                </p>
            </div>
        </div>
    );
}
