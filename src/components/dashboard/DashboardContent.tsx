import {
    Wallet,
    Wifi,
    Server,
    Activity,
    ShoppingCart,
    LifeBuoy,
    CreditCard,
    ArrowRight,
    Globe
} from "lucide-react";

import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

export default async function DashboardContent({locale}: Props) {

    const t = await getTranslations({
        locale,
        namespace: "DashboardPage"
    });

    /*
     * ============================================================
     * BACKEND TODO
     * ============================================================
     *
     * GET /api/v1/dashboard/summary
     * GET /api/v1/connection/current
     * GET /api/v1/wallet/balance
     * GET /api/v1/orders/recent
     *
     * Replace these mock values with API responses.
     * ============================================================
     */

    const summary = {
        wallet: "0",
        plan: "Pro",
        connection: t("active"),
        bandwidth: "0 GB / 0 GB"
    };

    const connection = {
        ip: "192.168.1.25",
        dns1: "10.10.10.10",
        dns2: "10.10.10.11",
        edge: "Frankfurt-01"
    };

    const orders = [
        {
            id: "#WL-1001",
            status: "Completed"
        },
        {
            id: "#WL-1002",
            status: "Pending"
        },
        {
            id: "#WL-1003",
            status: "Completed"
        }
    ];

    return (
        <section className="mx-auto max-w-7xl px-6 py-12">

            {/* Welcome */}

            <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur-xl">

                <h1 className="text-4xl font-black">
                    {t("welcome")}
                </h1>

                <p className="mt-3 text-gray-300">
                    {t("subtitle")}
                </p>

            </div>

            {/* Summary */}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                    icon={<Wallet className="text-cyan-400"/>}
                    title={t("wallet")}
                    value={summary.wallet}
                />

                <SummaryCard
                    icon={<Server className="text-cyan-400"/>}
                    title={t("currentPlan")}
                    value={summary.plan}
                />

                <SummaryCard
                    icon={<Wifi className="text-cyan-400"/>}
                    title={t("connection")}
                    value={summary.connection}
                />

                <SummaryCard
                    icon={<Activity className="text-cyan-400"/>}
                    title={t("bandwidth")}
                    value={summary.bandwidth}
                />

            </div>

            {/* Quick Actions */}

            <div className="mt-10">

                <h2 className="mb-5 text-2xl font-bold">
                    {t("quickActions")}
                </h2>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                    {/* Connect */}

                    <ActionCard
                        icon={<Server/>}
                        title={t("actions.connect")}
                        href="/connection"
                        locale={locale}
                        primary
                        badge={t("active")}
                        buttonText={t("actions.connectNow")}
                    />

                    {/* Buy */}

                    <ActionCard
                        icon={<ShoppingCart/>}
                        title={t("actions.buy")}
                        locale={locale}
                        href="/market"
                    />

                    {/* Wallet */}

                    <ActionCard
                        icon={<CreditCard/>}
                        title={t("actions.wallet")}
                        locale={locale}
                        href="/wallet"
                    />

                    {/* Support */}

                    <ActionCard
                        icon={<LifeBuoy/>}
                        title={t("actions.ticket")}
                        locale={locale}
                        href="/support"
                    />

                </div>

            </div>

            {/* Connection */}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <div className="flex items-center justify-between">

                        <h2 className="text-2xl font-bold">
                            {t("connectionInfo.title")}
                        </h2>

                        <Link
                            href="/connection"
                            className="flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                        >
                            {t("actions.connect")}
                            <ArrowRight size={16}/>
                        </Link>

                    </div>

                    <div className="mt-6 space-y-5">

                        <InfoRow
                            label={t("connectionInfo.userIp")}
                            value={connection.ip}
                        />

                        <InfoRow
                            label={t("connectionInfo.primaryDns")}
                            value={connection.dns1}
                        />

                        <InfoRow
                            label={t("connectionInfo.secondaryDns")}
                            value={connection.dns2}
                        />

                        <InfoRow
                            label={t("connectionInfo.edgeServer")}
                            value={connection.edge}
                        />

                    </div>

                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-2xl font-bold">
                        {t("orders")}
                    </h2>

                    <div className="mt-6 space-y-4">

                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                            >
                                <span>{order.id}</span>

                                <span className="rounded-full bg-green-400/10 px-3 py-1 text-sm text-green-400">
                                    {order.status}
                                </span>

                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}

function SummaryCard({
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

function ActionCard({
                        icon,
                        title,
                        href,
                        locale,
                        primary = false,
                        badge,
                        buttonText
                    }: {
    icon: React.ReactNode;
    title: string;
    href: string;
    locale: string;
    primary?: boolean;
    badge?: string;
    buttonText?: string;
}) {

    return (
        <Link
            href={href}
            locale={locale}
            className={`
                group relative overflow-hidden rounded-3xl border p-6
                backdrop-blur-xl transition duration-300
                hover:-translate-y-1
                ${
                primary
                    ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_30px_rgba(0,229,255,0.08)] hover:border-cyan-400/70 hover:bg-cyan-400/15"
                    : "border-white/10 bg-white/5 hover:border-cyan-400/30"
            }
            `}
        >

            {primary && (
                <div
                    className="
                        absolute -right-10 -top-10
                        h-28 w-28 rounded-full
                        bg-cyan-400/10 blur-3xl
                        transition group-hover:bg-cyan-400/20
                    "
                />
            )}

            <div className="relative flex items-center justify-between">

                <div
                    className={`
                        rounded-2xl border p-3
                        ${
                        primary
                            ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                            : "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                    }
                    `}
                >
                    {icon}
                </div>

                <ArrowRight
                    size={18}
                    className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                />

            </div>

            <div className="relative mt-5 font-bold text-white">
                {title}
            </div>

            {primary && badge && (
                <div className="relative mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"/>
                    {badge}
                </div>
            )}

            {primary && buttonText && (
                <div className="relative mt-5 flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black transition group-hover:bg-cyan-300">
                    <Wifi size={17}/>
                    {buttonText}
                </div>
            )}

        </Link>
    );
}

function InfoRow({
                     label,
                     value
                 }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <span className="text-gray-400">
                {label}
            </span>

            <span className="font-semibold text-white">
                {value}
            </span>

        </div>
    );
}