"use client";

import {
    Ban,
    CheckCircle2,
    ChevronDown,
    Clock3,
    CreditCard,
    Package,
    RefreshCcw,
    ShoppingBag,
    XCircle,
} from "lucide-react";
import {useState} from "react";
import {useTranslations} from "next-intl";

type OrderStatus =
    | "pending"
    | "confirmed"
    | "delivered"
    | "cancelled";

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

const initialOrders: Order[] = [
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
];

/*
 * ========================================================
 * BACKEND TODO
 * ========================================================
 *
 * Future Go API:
 *
 * GET    /api/v1/orders
 * GET    /api/v1/orders/{id}
 * POST   /api/v1/orders/{id}/cancel
 * POST   /api/v1/orders/{id}/items/{itemId}/refund
 *
 * Replace initialOrders with API data.
 * ========================================================
 */

export default function OrdersContent() {
    const t = useTranslations("OrdersPage");

    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggleOrder = (id: string) => {
        setExpanded((current) =>
            current === id ? null : id
        );
    };

    const cancelOrder = (orderId: string) => {
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

        /*
         * BACKEND TODO:
         *
         * POST /api/v1/orders/{orderId}/cancel
         */
    };

    const refundItem = (
        orderId: string,
        itemId: string
    ) => {
        setOrders((current) =>
            current.map((order) => {
                if (order.id !== orderId) {
                    return order;
                }

                return {
                    ...order,
                    items: order.items.map((item) =>
                        item.id === itemId
                            ? {
                                ...item,
                                refunded: true,
                            }
                            : item
                    ),
                };
            })
        );

        /*
         * BACKEND TODO:
         *
         * POST
         * /api/v1/orders/{orderId}/items/{itemId}/refund
         */
    };

    const statusIcon = (status: OrderStatus) => {
        switch (status) {
            case "delivered":
                return <CheckCircle2 size={16}/>;

            case "confirmed":
                return <Package size={16}/>;

            case "pending":
                return <Clock3 size={16}/>;

            case "cancelled":
                return <XCircle size={16}/>;
        }
    };

    const statusClass = (status: OrderStatus) => {
        switch (status) {
            case "delivered":
                return "border-green-400/30 bg-green-400/10 text-green-400";

            case "confirmed":
                return "border-blue-400/30 bg-blue-400/10 text-blue-400";

            case "pending":
                return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";

            case "cancelled":
                return "border-red-400/30 bg-red-400/10 text-red-400";
        }
    };

    const canCancel = (status: OrderStatus) =>
        status === "pending";

    return (
        <section className="min-h-screen px-6 py-16">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-10">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-400">
                            <ShoppingBag size={26}/>
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

                {/* Orders */}
                <div className="space-y-5">
                    {orders.map((order) => {
                        const isOpen =
                            expanded === order.id;

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
                            >
                                {/* Order summary */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleOrder(order.id)
                                    }
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.04]"
                                >
                                    <div className="flex min-w-0 items-center gap-4">

                                        <div className="hidden rounded-xl bg-cyan-400/10 p-3 text-cyan-400 sm:block">
                                            <Package size={22}/>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="font-semibold text-white">
                                                    {order.id}
                                                </h2>

                                                <span
                                                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${statusClass(order.status)}`}
                                                >
                                                    {statusIcon(order.status)}
                                                    {t(
                                                        `status.${order.status}`
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {order.date}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <div className="hidden text-right sm:block">
                                            <p className="text-xs text-gray-500">
                                                {t("total")}
                                            </p>

                                            <p className="font-bold text-cyan-400">
                                                ${order.total.toFixed(2)}
                                            </p>
                                        </div>

                                        <ChevronDown
                                            size={20}
                                            className={`text-gray-500 transition ${
                                                isOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                </button>

                                {/* Details */}
                                {isOpen && (
                                    <div className="border-t border-white/10 p-5">

                                        {/* Payment */}
                                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                                            <CreditCard
                                                size={19}
                                                className="text-cyan-400"
                                            />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    {t("paymentMethod")}
                                                </p>

                                                <p className="text-sm font-medium text-white">
                                                    {order.payment}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-3">
                                            {order.items.map(
                                                (item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-white">
                                                                {item.name}
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-500">
                                                                {t("quantity")}:{" "}
                                                                {item.quantity}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                                                            <p className="font-semibold text-cyan-400">
                                                                $
                                                                {(
                                                                    item.price *
                                                                    item.quantity
                                                                ).toFixed(2)}
                                                            </p>

                                                            {item.refundable &&
                                                                !item.refunded &&
                                                                order.status !==
                                                                "cancelled" && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            refundItem(
                                                                                order.id,
                                                                                item.id
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-2 rounded-lg border border-yellow-400/30 px-3 py-2 text-xs font-medium text-yellow-400 transition hover:bg-yellow-400/10"
                                                                    >
                                                                        <RefreshCcw
                                                                            size={14}
                                                                        />

                                                                        {t(
                                                                            "refund"
                                                                        )}
                                                                    </button>
                                                                )}

                                                            {item.refunded && (
                                                                <span className="rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2 text-xs text-green-400">
                                                                    {t(
                                                                        "refunded"
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    {t("orderTotal")}
                                                </p>

                                                <p className="text-2xl font-bold text-white">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                            </div>

                                            {canCancel(
                                                order.status
                                            ) && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cancelOrder(
                                                            order.id
                                                        )
                                                    }
                                                    className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/5 px-5 py-3 font-medium text-red-400 transition hover:bg-red-400/10"
                                                >
                                                    <Ban size={17}/>

                                                    {t("cancelOrder")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {orders.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-16 text-center">
                        <Package
                            size={48}
                            className="mx-auto text-gray-600"
                        />

                        <h2 className="mt-5 text-xl font-semibold">
                            {t("empty.title")}
                        </h2>

                        <p className="mt-2 text-gray-500">
                            {t("empty.description")}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}