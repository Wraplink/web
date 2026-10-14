"use client";

import {
    Activity,
    ArrowUp,
    CalendarDays,
    ChartNoAxesCombined,
    Download,
    Gauge,
    HardDrive,
    Loader2,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {useTranslations} from "next-intl";

import {
    getUsage,
    type UsageSummary,
} from "@/lib/api/usage";

type Range = "7d" | "30d" | "90d";

const rangeDays: Record<Range, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
};

export default function BandwidthContent() {
    const t = useTranslations("BandwidthPage");

    const [range, setRange] =
        useState<Range>("7d");

    const [usage, setUsage] =
        useState<UsageSummary | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await getUsage(
                    rangeDays[range]
                );

                if (!cancelled) {
                    setUsage(result);
                }
            } catch (loadError) {
                console.error(
                    "Failed to load bandwidth usage:",
                    loadError
                );

                if (!cancelled) {
                    setUsage(null);
                    setError(
                        "Usage information is not available. Make sure you have an active subscription."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [range]);

    const used = bytesToGiB(
        usage?.usedBytes ?? 0
    );
    const limit = bytesToGiB(
        usage?.dataLimitBytes ?? 0
    );
    const remaining = bytesToGiB(
        usage?.remainingBytes ?? 0
    );

    const percentage = Math.min(
        100,
        Math.max(
            0,
            Math.round(
                usage?.percentUsed ?? 0
            )
        )
    );

    const download = bytesToGiB(
        usage?.daily.reduce(
            (total, item) =>
                total + item.downloadBytes,
            0
        ) ?? 0
    );

    const upload = bytesToGiB(
        usage?.daily.reduce(
            (total, item) =>
                total + item.uploadBytes,
            0
        ) ?? 0
    );

    const chartData = useMemo(
        () =>
            [...(usage?.daily ?? [])]
                .reverse()
                .map((item) => ({
                    day: formatChartDate(
                        item.date,
                        range
                    ),
                    value: bytesToGiB(
                        item.totalBytes
                    ),
                })),
        [usage, range]
    );

    const maxValue = Math.max(
        0,
        ...chartData.map(
            (item) => item.value
        )
    );

    if (loading && !usage) {
        return (
            <section className="flex min-h-[60vh] items-center justify-center px-6 py-16">
                <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400"/>
                    Loading usage...
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                            <ChartNoAxesCombined size={26}/>
                        </div>

                        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                            {t("badge")}
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold md:text-5xl">
                        {t("title")}
                    </h1>

                    <p className="mt-4 max-w-2xl text-gray-400">
                        {t("subtitle")}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-sm text-amber-200">
                        {error}
                    </div>
                )}

                <div className="mb-6 grid gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Gauge size={17}/>
                                    {t("currentUsage")}
                                </div>

                                <div className="mt-3 flex items-end gap-2">
                                    <span className="text-5xl font-bold text-white">
                                        {formatNumber(used)}
                                    </span>

                                    <span className="mb-1 text-gray-500">
                                        GB
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    {formatNumber(remaining)} GB{" "}
                                    {t("remaining")}
                                </p>
                            </div>

                            <div className="relative flex h-36 w-36 items-center justify-center">
                                <div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background: `conic-gradient(#22d3ee ${percentage}%, rgba(255,255,255,0.06) ${percentage}%)`,
                                    }}
                                />

                                <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-[#071014]">
                                    <span className="text-3xl font-bold text-white">
                                        {percentage}%
                                    </span>

                                    <span className="text-xs text-gray-500">
                                        {t("used")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-7">
                            <div className="mb-2 flex justify-between text-xs text-gray-500">
                                <span>
                                    {formatNumber(used)} GB
                                </span>

                                <span>
                                    {formatNumber(limit)} GB
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-purple-400/10 p-3 text-purple-400">
                                <HardDrive size={22}/>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    {t("currentPlan")}
                                </p>

                                <p className="font-semibold text-white">
                                    {usage?.planCode ?? "-"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7">
                            <p className="text-sm text-gray-500">
                                {t("bandwidthLimit")}
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {formatNumber(limit)} GB
                            </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                            <p className="text-sm text-gray-500">
                                {t("billingCycle")}
                            </p>

                            <p className="mt-1 text-sm text-white">
                                {usage
                                    ? formatPeriod(
                                        usage.startsAt,
                                        usage.expiresAt
                                    )
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid gap-6 md:grid-cols-3">
                    <TrafficCard
                        icon={
                            <Download size={19}/>
                        }
                        iconClass="bg-green-400/10 text-green-400"
                        label={t("download")}
                        value={download}
                        description={t("trafficReceived")}
                    />

                    <TrafficCard
                        icon={
                            <ArrowUp size={19}/>
                        }
                        iconClass="bg-orange-400/10 text-orange-400"
                        label={t("upload")}
                        value={upload}
                        description={t("trafficSent")}
                    />

                    <TrafficCard
                        icon={
                            <Activity size={19}/>
                        }
                        iconClass="bg-cyan-400/10 text-cyan-400"
                        label={t("totalTraffic")}
                        value={download + upload}
                        description={t("downloadUploadCombined")}
                    />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                {t("usageReport")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("usageReportSubtitle")}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
                            <CalendarDays
                                size={16}
                                className="ml-2 text-gray-500"
                            />

                            {(
                                [
                                    "7d",
                                    "30d",
                                    "90d",
                                ] as Range[]
                            ).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        setRange(item)
                                    }
                                    disabled={loading}
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                                        range === item
                                            ? "bg-cyan-400 text-black"
                                            : "text-gray-500 hover:text-white"
                                    } disabled:opacity-50`}
                                >
                                    {t(`ranges.${item}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {chartData.length === 0 ? (
                        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                            No traffic has been reported for this period.
                        </div>
                    ) : (
                        <div className="relative h-72">
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[100, 75, 50, 25, 0].map(
                                    (value) => (
                                        <div
                                            key={value}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="w-8 text-right text-[10px] text-gray-700">
                                                {formatNumber(
                                                    (maxValue * value) /
                                                    100
                                                )}
                                            </span>

                                            <div className="h-px flex-1 bg-white/5"/>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="absolute inset-0 ml-12 flex items-end justify-around gap-2 pb-1 pt-2">
                                {chartData.map((item) => {
                                    const height =
                                        maxValue === 0
                                            ? 0
                                            : (item.value / maxValue) * 100;

                                    return (
                                        <div
                                            key={item.day}
                                            className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                                        >
                                            <div className="relative flex h-full w-full max-w-14 items-end justify-center">
                                                <div
                                                    className="w-full rounded-t-lg bg-cyan-400/70 transition-all duration-500 hover:bg-cyan-400"
                                                    style={{
                                                        height: `${height}%`,
                                                    }}
                                                    title={`${formatNumber(item.value)} GB`}
                                                />
                                            </div>

                                            <span className="text-[11px] text-gray-600">
                                                {item.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">
                    <Activity
                        size={20}
                        className="mt-0.5 shrink-0 text-cyan-400"
                    />

                    <div>
                        <p className="text-sm font-medium text-white">
                            {t("reportInfoTitle")}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                            {t("reportInfo")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrafficCard({
    icon,
    iconClass,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    iconClass: string;
    label: string;
    value: number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${iconClass}`}>
                    {icon}
                </div>

                <span className="text-sm text-gray-500">
                    {label}
                </span>
            </div>

            <p className="mt-4 text-3xl font-bold">
                {formatNumber(value)} GB
            </p>

            <p className="mt-1 text-xs text-gray-600">
                {description}
            </p>
        </div>
    );
}

function bytesToGiB(bytes: number): number {
    return bytes / 1024 / 1024 / 1024;
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
    }).format(value);
}

function formatChartDate(
    value: string,
    range: Range
): string {
    const date = new Date(`${value}T00:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: range === "90d"
            ? "short"
            : undefined,
        day: range === "90d"
            ? undefined
            : "numeric",
        timeZone: "UTC",
    }).format(date);
}

function formatPeriod(
    startsAt: string,
    expiresAt: string
): string {
    const formatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return `${formatter.format(new Date(startsAt))} – ${formatter.format(new Date(expiresAt))}`;
}
