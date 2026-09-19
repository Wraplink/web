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
     * Future API calls:
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
        wallet: "$42.50",
        plan: "Pro",
        connection: t("active"),
        bandwidth: "76 GB / 200 GB"
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

                    <ActionCard
                        icon={<Server/>}
                        title={t("actions.connect")}
                        href="/connection"
                    />

                    <ActionCard
                        icon={<ShoppingCart/>}
                        title={t("actions.buy")}
                        href="/market"
                    />

                    <ActionCard
                        icon={<CreditCard/>}
                        title={t("actions.wallet")}
                        href="/wallet"
                    />

                    <ActionCard
                        icon={<LifeBuoy/>}
                        title={t("actions.ticket")}
                        href="/support"
                    />

                </div>

            </div>

            {/* Connection */}

            <div className="mt-10 grid gap-8 lg:grid-cols-2">

                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

                    <h2 className="text-2xl font-bold">
                        {t("connectionInfo.title")}
                    </h2>

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
                        href
                    }: {
    icon: React.ReactNode;
    title: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30"
        >
            <div className="flex items-center justify-between">

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-400">
                    {icon}
                </div>

                <ArrowRight
                    size={18}
                    className="text-gray-500 transition group-hover:text-cyan-400"
                />

            </div>

            <div className="mt-5 font-bold">
                {title}
            </div>

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

            <span className="font-semibold">
                {value}
            </span>

        </div>
    );
}