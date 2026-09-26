"use client";

import {useMemo, useState} from "react";

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
    | "refunded";

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
    date: string;
    status: OrderStatus;
    payment: string;
    total: number;
    items: OrderItem[];
};

const initialOrders: Order[] = [];
    /*[
    {
        id: "#WL-1001",
        date: "2026-09-18",
        status: "delivered",
        payment: "Wallet",
        total: 24,
        items: [
            {
                id: "pro",
                name: "Pro Plan",
                quantity: 1,
                price: 12,
                refundable: true,
                refunded: false,
            },
            {
                id: "static-ip",
                name: "Static IP",
                quantity: 3,
                price: 4,
                refundable: true,
                refunded: false,
            },
        ],
    },
    {
        id: "#WL-1002",
        date: "2026-09-19",
        status: "pending",
        payment: "Crypto",
        total: 25,
        items: [
            {
                id: "ultimate",
                name: "Ultimate Plan",
                quantity: 1,
                price: 25,
                refundable: true,
                refunded: false,
            },
        ],
    },
    {
        id: "#WL-1003",
        date: "2026-09-15",
        status: "confirmed",
        payment: "Card-to-Card",
        total: 8,
        items: [
            {
                id: "extra-device",
                name: "Extra Device",
                quantity: 2,
                price: 4,
                refundable: false,
                refunded: false,
            },
        ],
    },
];*/

export default function OrdersContent({
                                          locale,
                                      }: Props) {
    const t = useTranslations("OrdersPage");

    const [orders, setOrders] =
        useState<Order[]>(initialOrders);

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

        /*
         * BACKEND TODO
         *
         * POST /api/v1/orders/{orderId}/cancel
         *
         * Backend must verify that the order
         * is still cancellable.
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 700)
        );

        setOrders((current) =>
            current.map((order) =>
                order.id === orderId
                    ? {
                        ...order,
                        status: "cancelled",
                    }
                    : order
            )
        );

        setActionLoading(null);
    };

    const refundItem = async (
        orderId: string,
        itemId: string
    ) => {
        const actionId =
            `${orderId}-${itemId}`;

        setActionLoading(actionId);

        /*
         * BACKEND TODO
         *
         * POST
         * /api/v1/orders/{orderId}/items/{itemId}/refund
         *
         * Backend verifies:
         *
         * - item is refundable
         * - item has not already been refunded
         * - refund policy allows refund
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 700)
        );

        setOrders((current) =>
            current.map((order) => {
                if (order.id !== orderId) {
                    return order;
                }

                const items =
                    order.items.map(
                        (item) =>
                            item.id === itemId
                                ? {
                                    ...item,
                                    refunded: true,
                                }
                                : item
                    );

                const allRefunded =
                    items
                        .filter(
                            (item) =>
                                item.refundable
                        )
                        .every(
                            (item) =>
                                item.refunded
                        );

                return {
                    ...order,
                    items,
                    status: allRefunded
                        ? "refunded"
                        : order.status,
                };
            })
        );

        setActionLoading(null);
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
                                    "confirmed" ||
                                    o.status ===
                                    "provisioning"
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

                    <FilterButton
                        active={
                            filter ===
                            "provisioning"
                        }
                        onClick={() =>
                            setFilter(
                                "provisioning"
                            )
                        }
                    >
                        {t(
                            "filters.provisioning"
                        )}
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

                {/* Orders */}

                <div className="space-y-4">

                    {filteredOrders.length ===
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
                                        onRefund={(
                                            itemId
                                        ) =>
                                            refundItem(
                                                order.id,
                                                itemId
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
                       onRefund,
                   }: {
    order: Order;
    expanded: boolean;
    loading: string | null;
    t: ReturnType<typeof useTranslations>;
    onToggle: () => void;
    onCancel: () => void;
    onRefund: (itemId: string) => void;
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
                                {order.id}
                            </div>

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
                            status={
                                order.status
                            }
                            t={t}
                        />

                        <div className="font-bold text-cyan-400">
                            $
                            {order.total.toFixed(
                                2
                            )}
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
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </div>

                                                {item.refundable &&
                                                    !item.refunded && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onRefund(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                loading ===
                                                                `${order.id}-${item.id}`
                                                            }
                                                            className="flex items-center gap-2 rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-xs text-yellow-300 transition hover:bg-yellow-400/10 disabled:opacity-50"
                                                        >
                                                            {loading ===
                                                            `${order.id}-${item.id}` ? (
                                                                <RefreshCcw
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="animate-spin"
                                                                />
                                                            ) : (
                                                                <RefreshCcw
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}

                                                            {t(
                                                                "refund"
                                                            )}
                                                        </button>
                                                    )}

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
                        "pending" && (
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
                     }: {
    status: OrderStatus;
    t: ReturnType<typeof useTranslations>;
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
    };

    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
        >
            {t(`status.${status}`)}
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