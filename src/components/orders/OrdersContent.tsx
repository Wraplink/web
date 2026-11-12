"use client";

import {useEffect, useMemo, useState} from "react";
import {getCardReceipt} from "@/lib/api/checkout";
import {cancelPendingSubscription, listSubscriptions, type UserSubscription} from "@/lib/api/subscriptions";

import {
    Activity,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    CreditCard,
    Package,
    RefreshCcw,
    ShieldCheck,
    X,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

type Props = {
    locale: string;
};

type OrderStatus =
    | "pending"
    | "confirmed"
    | "provisioning"
    | "active"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "rejected"
    | "expired";

type OrderItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    refundable: boolean;
    refunded: boolean;
};

type Order = {
    id: string;
    orderNumber: number;
    date: string;
    status: OrderStatus;
    payment: string;
    receiptStatus?: string;
    total: number;
    currency: string;
    items: OrderItem[];
    durationDays: number;
    dataLimitBytes?: number;
    usedBytes?: number;
    remainingBytes?: number;
    subscriptionStatus: UserSubscription["status"];
    startsAt?: string | null;
    expiresAt?: string | null;
};

const initialOrders: Order[] = [];

function toOrder(subscription: UserSubscription): Order {
    const status: OrderStatus = subscription.status === "pending_payment" ? "pending" :
        subscription.status === "confirmed" ? "confirmed" :
        subscription.status === "active" ? "active" :
        subscription.status === "cancelled" ? "cancelled" :
        subscription.status === "expired" ? "expired" : "delivered";
    return {
        id: subscription.id,
        durationDays: subscription.durationDays,
        dataLimitBytes: subscription.dataLimitBytes,
        usedBytes: subscription.usedBytes,
        remainingBytes: subscription.remainingBytes,
        subscriptionStatus: subscription.status,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        orderNumber: subscription.orderNumber,
        date: subscription.createdAt,
        status,
        payment: subscription.priceMinor === 0 ? "Free" : subscription.status === "pending_payment" ? "Unpaid" : subscription.status === "confirmed" ? "Paid — reserved for next activation" : "Subscription",
        total: subscription.priceMinor,
        currency: subscription.currency,
        items: [{id: subscription.planCode, name: subscription.planName, quantity: 1,
            price: subscription.priceMinor, refundable: false, refunded: false}],
    };
}

function formatBytes(bytes: number, locale: string): string {
    if (!Number.isFinite(bytes) || bytes < 0) return "—";
    if (bytes < 1024) return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(bytes) + " B";
    const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
    const unit = ["B", "KiB", "MiB", "GiB", "TiB"][power];
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {maximumFractionDigits: 2}).format(bytes / Math.pow(1024, power)) + " " + unit;
}

function formatMoney(amount: number, currency: string, locale: string): string {
    if (amount === 0) return locale === "fa" ? "رایگان" : "Free";
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency", currency,
    }).format(amount / (currency === "IRR" ? 1 : 100));
}

export default function OrdersContent({
                                          locale,
                                      }: Props) {
    const t = useTranslations("OrdersPage");

    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [fetching, setFetching] = useState(true);
    const [apiError, setApiError] = useState("");

    const reload = async () => {
        setFetching(true);
        setApiError("");
        try {
            const subscriptions = await listSubscriptions();
            const enriched = await Promise.all(subscriptions.map(async subscription => {
                const order = toOrder(subscription);
                if (subscription.priceMinor === 0) return order;
                try {
                    const receipt = await getCardReceipt(subscription.id);
                    if (receipt) {
                        order.receiptStatus = receipt.status;
                        if (receipt.status === "rejected") order.status = "rejected";
                        else if (subscription.status === "confirmed") order.status = "confirmed";
                        order.payment = receipt.status === "pending_review" ? "Card transfer — awaiting review" :
                            receipt.status === "approved" ? "Card transfer — approved" : "Card transfer — rejected";
                        order.total = receipt.payableMinor;
                        order.items = order.items.map(item => ({...item, price: receipt.payableMinor}));
                    }
                } catch {
                    // Keep subscription history available when receipt lookup fails.
                }
                return order;
            }));
            setOrders(enriched);
        }
        catch { setApiError("Unable to load subscriptions. Please retry."); }
        finally { setFetching(false); }
    };

    useEffect(() => { void reload(); }, []);

    const [expandedOrder, setExpandedOrder] =
        useState<string | null>(null);

    const [filter, setFilter] =
        useState<"all" | OrderStatus>("all");

    const [actionLoading, setActionLoading] =
        useState<string | null>(null);

    const filteredOrders = useMemo(() => {
        if (filter === "all") {
            return orders;
        }

        return orders.filter(
            (order) =>
                order.status === filter
        );
    }, [orders, filter]);

    const cancelOrder = async (
        orderId: string
    ) => {
        setActionLoading(orderId);

        try {
            await cancelPendingSubscription(orderId);
            await reload();
        } catch {
            setApiError("Could not cancel this subscription. It may no longer be pending.");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <section className="min-h-screen px-6 py-12">

            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-10">

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-400">
                        <Package size={16}/>
                        {t("badge")}
                    </div>

                    <h1 className="text-4xl font-black">
                        {t("title")}
                    </h1>

                    <p className="mt-3 max-w-2xl text-gray-400">
                        {t("subtitle")}
                    </p>

                </div>

                {/* Status Overview */}

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatusCard
                        icon={
                            <Clock
                                size={20}
                            />
                        }
                        label={t(
                            "stats.pending"
                        )}
                        value={
                            orders.filter(
                                (o) =>
                                    o.status ===
                                    "pending"
                            ).length
                        }
                    />

                    <StatusCard
                        icon={
                            <Check
                                size={20}
                            />
                        }
                        label={t(
                            "stats.confirmed"
                        )}
                        value={
                            orders.filter(
                                (o) =>
                                    o.status ===
                                    "confirmed"
                            ).length
                        }
                    />

                    <StatusCard
                        icon={
                            <Activity
                                size={20}
                            />
                        }
                        label={t(
                            "stats.active"
                        )}
                        value={
                            orders.filter(
                                (o) =>
                                    o.status ===
                                    "active" ||
                                    o.status ===
                                    "delivered"
                            ).length
                        }
                    />

                    <StatusCard
                        icon={
                            <RefreshCcw
                                size={20}
                            />
                        }
                        label={t(
                            "stats.refunded"
                        )}
                        value={
                            orders.filter(
                                (o) =>
                                    o.status ===
                                    "refunded"
                            ).length
                        }
                    />

                </div>

                {/* Filter */}

                <div className="mb-6 flex flex-wrap gap-2">

                    <FilterButton
                        active={
                            filter === "all"
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >
                        {t("filters.all")}
                    </FilterButton>

                    <FilterButton
                        active={
                            filter === "pending"
                        }
                        onClick={() =>
                            setFilter("pending")
                        }
                    >
                        {t(
                            "filters.pending"
                        )}
                    </FilterButton>

                    <FilterButton
                        active={
                            filter === "confirmed"
                        }
                        onClick={() =>
                            setFilter(
                                "confirmed"
                            )
                        }
                    >
                        {t(
                            "filters.confirmed"
                        )}
                    </FilterButton>

                    <FilterButton active={filter === "active"} onClick={() => setFilter("active")}>
                        {t("status.active")}
                    </FilterButton>

                    <FilterButton
                        active={
                            filter === "delivered"
                        }
                        onClick={() =>
                            setFilter(
                                "delivered"
                            )
                        }
                    >
                        {t(
                            "filters.delivered"
                        )}
                    </FilterButton>

                    <FilterButton active={filter === "rejected"} onClick={() => setFilter("rejected")}>
                        {locale === "fa" ? "رد شده" : "Rejected"}
                    </FilterButton>

                    <FilterButton
                        active={
                            filter === "cancelled"
                        }
                        onClick={() =>
                            setFilter(
                                "cancelled"
                            )
                        }
                    >
                        {t(
                            "filters.cancelled"
                        )}
                    </FilterButton>

                </div>

                {apiError && <div role="alert" className="mb-5 rounded-xl border border-red-400/30 p-4 text-red-300">{apiError} <button type="button" className="ml-3 underline" onClick={() => void reload()}>Retry</button></div>}
                {fetching && <p role="status" className="mb-5 text-gray-400">Loading orders…</p>}
                {/* Orders */}

                <div className="space-y-4">

                    {!fetching && !apiError && filteredOrders.length ===
                    0 ? (
                        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">

                            <Package
                                size={40}
                                className="mx-auto text-gray-600"
                            />

                            <h2 className="mt-5 text-xl font-bold">
                                {t(
                                    "empty.title"
                                )}
                            </h2>

                            <p className="mt-2 text-gray-500">
                                {t(
                                    "empty.description"
                                )}
                            </p>

                            <Link
                                href="/market"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black"
                            >
                                {t(
                                    "empty.button"
                                )}

                                <ArrowRight
                                    size={17}
                                />
                            </Link>

                        </div>
                    ) : (
                        filteredOrders.map(
                            (order) => {
                                const expanded =
                                    expandedOrder ===
                                    order.id;

                                return (
                                    <OrderCard
                                        key={
                                            order.id
                                        }
                                        order={
                                            order
                                        }
                                        expanded={
                                            expanded
                                        }
                                        loading={
                                            actionLoading
                                        }
                                        t={t}
                                        locale={locale}
                                        onToggle={() =>
                                            setExpandedOrder(
                                                expanded
                                                    ? null
                                                    : order.id
                                            )
                                        }
                                        onCancel={() =>
                                            cancelOrder(
                                                order.id
                                            )
                                        }

                                    />
                                );
                            }
                        )
                    )}

                </div>

            </div>

        </section>
    );
}

/* ============================================================
 * Order Card
 * ============================================================ */

function OrderCard({
                       order,
                       expanded,
                       loading,
                       t,
                       onToggle,
                       onCancel,
                       locale,
                   }: {
    order: Order;
    expanded: boolean;
    loading: string | null;
    t: ReturnType<typeof useTranslations>;
    onToggle: () => void;
    onCancel: () => void;
    locale: string;
}) {
    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

            {/* Main */}

            <button
                type="button"
                onClick={onToggle}
                className="w-full p-5 text-left transition hover:bg-white/[0.03]"
            >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                            <Package size={22}/>
                        </div>

                        <div>

                            <div className="font-bold">
                                {locale === "fa" ? "شماره سفارش" : "Order"} #WL-{order.orderNumber}
                            </div>

                            <div className="mt-2 text-sm font-semibold text-gray-200">{order.items.map(item => item.name).join("، ")}</div>
                            <div className="mt-1 text-xs text-gray-500">{order.id}</div>
                            <div className="mt-1 text-sm text-gray-500">
                                {order.date}
                            </div>

                        </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-5">

                        <div className="text-sm text-gray-500">
                            {order.items.length}{" "}
                            {t("items")}
                        </div>

                        <StatusBadge
                            locale={locale}
                            status={
                                order.status
                            }
                            t={t}
                        />

                        <div className="font-bold text-cyan-400">
                            {formatMoney(order.total, order.currency, locale)}
                        </div>

                        {expanded ? (
                            <ChevronUp
                                size={19}
                                className="text-gray-500"
                            />
                        ) : (
                            <ChevronDown
                                size={19}
                                className="text-gray-500"
                            />
                        )}

                    </div>

                </div>

            </button>

            {/* Details */}

            {expanded && (
                <div className="border-t border-white/10 p-5">

                    {/* Timeline */}

                    <OrderTimeline
                        status={
                            order.status
                        }
                        t={t}
                    />

                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
                        <h3 className="mb-3 font-bold">{locale === "fa" ? "مشخصات طرح خریداری‌شده" : "Purchased plan details"}</h3>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div><dt className="text-gray-400">{locale === "fa" ? "نام طرح" : "Plan"}</dt><dd className="mt-1 font-semibold">{order.items.map(item => item.name).join("، ")}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "حجم طرح" : "Data allowance"}</dt><dd className="mt-1 font-semibold">{order.dataLimitBytes === undefined ? "—" : order.dataLimitBytes === 0 ? (locale === "fa" ? "نامحدود" : "Unlimited") : formatBytes(order.dataLimitBytes, locale)}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "مصرف‌شده" : "Used data"}</dt><dd className="mt-1 font-semibold">{order.usedBytes === undefined ? "—" : formatBytes(order.usedBytes, locale)}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "حجم باقی‌مانده" : "Remaining data"}</dt><dd className="mt-1 font-semibold">{order.dataLimitBytes === 0 ? (locale === "fa" ? "نامحدود" : "Unlimited") : order.remainingBytes === undefined ? "—" : formatBytes(order.remainingBytes, locale)}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "مدت اعتبار" : "Duration"}</dt><dd className="mt-1 font-semibold">{order.durationDays} {locale === "fa" ? "روز" : "days"}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "وضعیت اشتراک" : "Subscription status"}</dt><dd className="mt-1 font-semibold">{order.subscriptionStatus === "confirmed" ? (locale === "fa" ? "رزرو شده" : "Reserved") : order.subscriptionStatus === "active" ? (locale === "fa" ? "فعال" : "Active") : order.subscriptionStatus === "expired" ? (locale === "fa" ? "منقضی" : "Expired") : order.subscriptionStatus === "pending_payment" ? (locale === "fa" ? "در انتظار پرداخت" : "Pending payment") : (locale === "fa" ? "لغو شده" : "Cancelled")}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "شروع اعتبار" : "Starts"}</dt><dd className="mt-1 font-semibold">{order.startsAt ? new Date(order.startsAt).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US") : "—"}</dd></div>
                            <div><dt className="text-gray-400">{locale === "fa" ? "پایان اعتبار" : "Expires"}</dt><dd className="mt-1 font-semibold">{order.expiresAt ? new Date(order.expiresAt).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US") : "—"}</dd></div>
                        </dl>
                    </div>

                    {order.dataLimitBytes !== undefined && order.dataLimitBytes > 0 && order.usedBytes !== undefined && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                                <span className="font-semibold">{locale === "fa" ? "میزان مصرف حجم" : "Bandwidth usage"}</span>
                                <span className="text-gray-400" dir="ltr">
                                    {formatBytes(order.usedBytes, locale)} / {formatBytes(order.dataLimitBytes, locale)}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar"
                                 aria-label={locale === "fa" ? "میزان مصرف حجم" : "Bandwidth usage"}
                                 aria-valuemin={0} aria-valuemax={100}
                                 aria-valuenow={Math.round(Math.min(100, Math.max(0, order.usedBytes / order.dataLimitBytes * 100)))}>
                                <div className="h-full rounded-full bg-cyan-400 transition-all"
                                     style={{width: `${Math.min(100, Math.max(0, order.usedBytes / order.dataLimitBytes * 100))}%`}} />
                            </div>
                        </div>
                    )}

                    {/* Payment */}

                    <div className="mt-6 flex flex-wrap gap-4">

                        <InfoBox
                            icon={
                                <CreditCard
                                    size={17}
                                />
                            }
                            label={t(
                                "payment"
                            )}
                            value={
                                order.payment
                            }
                        />

                        <InfoBox
                            icon={
                                <Package
                                    size={17}
                                />
                            }
                            label={t(
                                "itemCount"
                            )}
                            value={String(
                                order.items.reduce(
                                    (
                                        sum,
                                        item
                                    ) =>
                                        sum +
                                        item.quantity,
                                    0
                                )
                            )}
                        />

                    </div>

                    {/* Items */}

                    <div className="mt-6">

                        <h3 className="mb-3 font-bold">
                            {t(
                                "itemsTitle"
                            )}
                        </h3>

                        <div className="space-y-3">

                            {order.items.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="rounded-2xl border border-white/10 bg-black/10 p-4"
                                    >

                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                            <div>

                                                <div className="font-semibold">
                                                    {
                                                        item.name
                                                    }
                                                </div>

                                                <div className="mt-1 text-sm text-gray-500">
                                                    {t(
                                                        "quantity"
                                                    )}:{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </div>

                                            </div>

                                            <div className="flex items-center gap-5">

                                                <div className="font-bold">
                                                    {formatMoney(item.price * item.quantity, order.currency, locale)}
                                                </div>

                                                {item.refunded && (
                                                    <span className="flex items-center gap-1 text-xs text-green-400">
                                                        <Check
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {t(
                                                            "refunded"
                                                        )}
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                    {/* Cancel */}

                    {order.status ===
                        "pending" && order.receiptStatus !== "pending_review" && (
                            <div className="mt-6 border-t border-white/10 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        onCancel
                                    }
                                    disabled={
                                        loading ===
                                        order.id
                                    }
                                    className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                                >

                                    {loading ===
                                    order.id ? (
                                        <RefreshCcw
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <X
                                            size={17}
                                        />
                                    )}

                                    {t(
                                        "cancelOrder"
                                    )}

                                </button>

                            </div>
                        )}

                </div>
            )}

        </div>
    );
}

/* ============================================================
 * Timeline
 * ============================================================ */

function OrderTimeline({
                           status,
                           t,
                       }: {
    status: OrderStatus;
    t: ReturnType<typeof useTranslations>;
}) {
    const steps: {
        key:
            | "pending"
            | "confirmed"
            | "provisioning"
            | "active";
        icon: React.ReactNode;
    }[] = [
        {
            key: "pending",
            icon: <Clock size={16}/>,
        },
        {
            key: "confirmed",
            icon: <Check size={16}/>,
        },
        {
            key: "provisioning",
            icon: <Activity size={16}/>,
        },
        {
            key: "active",
            icon: <ShieldCheck size={16}/>,
        },
    ];

    const order = [
        "pending",
        "confirmed",
        "provisioning",
        "active",
    ];

    const currentIndex =
        order.indexOf(status);

    return (
        <div className="overflow-x-auto">

            <div className="flex min-w-[650px] items-center">

                {steps.map(
                    (step, index) => {
                        const completed =
                            currentIndex >=
                            index;

                        return (
                            <div
                                key={
                                    step.key
                                }
                                className="flex flex-1 items-center"
                            >

                                <div className="flex flex-col items-center">

                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                                            completed
                                                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                                                : "border-white/10 bg-white/5 text-gray-600"
                                        }`}
                                    >
                                        {
                                            step.icon
                                        }
                                    </div>

                                    <span
                                        className={`mt-2 text-xs ${
                                            completed
                                                ? "text-cyan-400"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {t(
                                            `status.${step.key}`
                                        )}
                                    </span>

                                </div>

                                {index <
                                    steps.length -
                                    1 && (
                                        <div
                                            className={`mx-3 h-px flex-1 ${
                                                currentIndex >
                                                index
                                                    ? "bg-cyan-400/50"
                                                    : "bg-white/10"
                                            }`}
                                        />
                                    )}

                            </div>
                        );
                    }
                )}

            </div>

        </div>
    );
}

/* ============================================================
 * Small Components
 * ============================================================ */

function StatusCard({
                        icon,
                        label,
                        value,
                    }: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="flex items-center justify-between">

                <div className="text-cyan-400">
                    {icon}
                </div>

                <span className="text-2xl font-black">
                    {value}
                </span>

            </div>

            <div className="mt-3 text-sm text-gray-500">
                {label}
            </div>

        </div>
    );
}

function FilterButton({
                          active,
                          onClick,
                          children,
                      }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                active
                    ? "bg-cyan-400 text-black"
                    : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
        >
            {children}
        </button>
    );
}

function StatusBadge({
                         status,
                         t,
                         locale,
                     }: {
    status: OrderStatus;
    t: ReturnType<typeof useTranslations>;
    locale: string;
}) {
    const styles: Record<
        OrderStatus,
        string
    > = {
        pending:
            "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
        confirmed:
            "border-blue-400/20 bg-blue-400/10 text-blue-300",
        provisioning:
            "border-purple-400/20 bg-purple-400/10 text-purple-300",
        active:
            "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        delivered:
            "border-green-400/20 bg-green-400/10 text-green-300",
        cancelled:
            "border-red-400/20 bg-red-400/10 text-red-300",
        refunded:
            "border-gray-400/20 bg-gray-400/10 text-gray-300",
        rejected:
            "border-red-400/20 bg-red-400/10 text-red-300",
        expired:
            "border-gray-400/20 bg-gray-400/10 text-gray-300",
    };

    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
        >
            {status === "expired" ? (locale === "fa" ? "منقضی شده" : "Expired") : status === "rejected" ? (locale === "fa" ? "رد شده" : "Rejected") : t(`status.${status}`)}
        </span>
    );
}

function InfoBox({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-[180px] items-center gap-3 rounded-xl border border-white/10 bg-black/10 px-4 py-3">

            <div className="text-cyan-400">
                {icon}
            </div>

            <div>

                <div className="text-xs text-gray-500">
                    {label}
                </div>

                <div className="mt-1 text-sm font-semibold">
                    {value}
                </div>

            </div>

        </div>
    );
}