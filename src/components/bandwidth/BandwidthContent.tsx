"use client";

import {
    Activity,
    ArrowDown,
    ArrowUp,
    CalendarDays,
    ChartNoAxesCombined,
    Download,
    Gauge,
    HardDrive,
} from "lucide-react";
import {useState} from "react";
import {useTranslations} from "next-intl";

type Range = "7d" | "30d" | "90d";

const usageData = {
    "7d": [
        {day: "Mon", value: 8},
        {day: "Tue", value: 14},
        {day: "Wed", value: 11},
        {day: "Thu", value: 19},
        {day: "Fri", value: 24},
        {day: "Sat", value: 31},
        {day: "Sun", value: 18},
    ],
    "30d": [
        {day: "1", value: 12},
        {day: "5", value: 22},
        {day: "10", value: 18},
        {day: "15", value: 35},
        {day: "20", value: 28},
        {day: "25", value: 42},
        {day: "30", value: 31},
    ],
    "90d": [
        {day: "Jun", value: 180},
        {day: "Jul", value: 220},
        {day: "Aug", value: 265},
        {day: "Sep", value: 145},
    ],
};

/*
 * ========================================================
 * BACKEND TODO
 * ========================================================
 *
 * Future Go API:
 *
 * GET /api/v1/bandwidth/current
 * GET /api/v1/bandwidth/usage?range=7d
 * GET /api/v1/bandwidth/daily
 * GET /api/v1/bandwidth/monthly
 *
 * Expected backend response:
 *
 * {
 *   "used": 76,
 *   "limit": 200,
 *   "download": 52,
 *   "upload": 24,
 *   "unit": "GB"
 * }
 *
 * ========================================================
 */

export default function BandwidthContent() {
    const t = useTranslations("BandwidthPage");

    const [range, setRange] =
        useState<Range>("7d");

    const used = 76;
    const limit = 200;
    const remaining = limit - used;

    const percentage =
        Math.round((used / limit) * 100);

    const download = 52;
    const upload = 24;

    const chartData = usageData[range];

    const maxValue = Math.max(
        ...chartData.map((item) => item.value)
    );

    return (
        <section className="min-h-screen px-6 py-16">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                            <ChartNoAxesCombined
                                size={26}
                            />
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

                {/* Main usage card */}
                <div className="mb-6 grid gap-6 lg:grid-cols-3">

                    {/* Usage */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Gauge size={17}/>
                                    {t("currentUsage")}
                                </div>

                                <div className="mt-3 flex items-end gap-2">
                                    <span className="text-5xl font-bold text-white">
                                        {used}
                                    </span>

                                    <span className="mb-1 text-gray-500">
                                        GB
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-500">
                                    {remaining} GB{" "}
                                    {t("remaining")}
                                </p>
                            </div>

                            {/* Circle */}
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

                        {/* Progress */}
                        <div className="mt-7">
                            <div className="mb-2 flex justify-between text-xs text-gray-500">
                                <span>
                                    {used} GB
                                </span>

                                <span>
                                    {limit} GB
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

                    {/* Plan */}
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
                                    Pro
                                </p>
                            </div>
                        </div>

                        <div className="mt-7">
                            <p className="text-sm text-gray-500">
                                {t("bandwidthLimit")}
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {limit} GB
                            </p>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                            <p className="text-sm text-gray-500">
                                {t("billingCycle")}
                            </p>

                            <p className="mt-1 text-sm text-white">
                                {t("monthly")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Traffic cards */}
                <div className="mb-6 grid gap-6 md:grid-cols-3">

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-400/10 p-2 text-green-400">
                                <Download size={19}/>
                            </div>

                            <span className="text-sm text-gray-500">
                                {t("download")}
                            </span>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            {download} GB
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                            {t("trafficReceived")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-400/10 p-2 text-orange-400">
                                <ArrowUp size={19}/>
                            </div>

                            <span className="text-sm text-gray-500">
                                {t("upload")}
                            </span>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            {upload} GB
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                            {t("trafficSent")}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-400">
                                <Activity size={19}/>
                            </div>

                            <span className="text-sm text-gray-500">
                                {t("totalTraffic")}
                            </span>
                        </div>

                        <p className="mt-4 text-3xl font-bold">
                            {used} GB
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                            {t("downloadUploadCombined")}
                        </p>
                    </div>
                </div>

                {/* Chart */}
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
                                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                                        range === item
                                            ? "bg-cyan-400 text-black"
                                            : "text-gray-500 hover:text-white"
                                    }`}
                                >
                                    {t(`ranges.${item}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-72">

                        {/* Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[100, 75, 50, 25, 0].map(
                                (value) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-8 text-right text-[10px] text-gray-700">
                                            {Math.round(
                                                (maxValue *
                                                    value) /
                                                100
                                            )}
                                        </span>

                                        <div className="h-px flex-1 bg-white/5"/>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Bars */}
                        <div className="absolute inset-0 ml-12 flex items-end justify-around gap-2 pb-1 pt-2">
                            {chartData.map((item) => {
                                const height =
                                    maxValue === 0
                                        ? 0
                                        : (item.value /
                                            maxValue) *
                                        100;

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
                                                title={`${item.value} GB`}
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
                </div>

                {/* Report footer */}
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