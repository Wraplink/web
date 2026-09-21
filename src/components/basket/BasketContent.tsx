"use client";

import {useEffect, useMemo, useState} from "react";

import {
    ShoppingBag,
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    CreditCard,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

import {
    getBasket,
    updateBasketQuantity,
    removeBasketItem,
    clearBasket,
    type BasketItem,
} from "@/lib/basket";

type Props = {
    locale: string;
};

export default function BasketContent({
                                          locale,
                                      }: Props) {
    const t = useTranslations("BasketPage");

    const [items, setItems] =
        useState<BasketItem[]>([]);

    const [loaded, setLoaded] =
        useState(false);

    useEffect(() => {
        setItems(getBasket());
        setLoaded(true);
    }, []);

    const refreshBasket = () => {
        setItems(getBasket());
    };

    const subtotal = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum +
                    item.price *
                    item.quantity,
                0
            ),
        [items]
    );

    const totalItems = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            ),
        [items]
    );

    /*
     * ========================================================
     * BACKEND TODO
     * ========================================================
     *
     * GET /api/v1/cart
     *
     * Response:
     *
     * {
     *   "items": [...],
     *   "subtotal": 0,
     *   "discount": 0,
     *   "total": 0
     * }
     *
     * PATCH /api/v1/cart/items/{id}
     * DELETE /api/v1/cart/items/{id}
     * DELETE /api/v1/cart
     *
     * ========================================================
     */

    if (!loaded) {
        return (
            <section className="min-h-screen px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-pulse text-gray-500">
                        Loading basket...
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen px-6 py-12">

            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-10 flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                        <ShoppingBag
                            size={28}
                            className="text-cyan-400"
                        />
                    </div>

                    <div>

                        <h1 className="text-4xl font-black">
                            {t("title")}
                        </h1>

                        <p className="mt-2 text-gray-400">
                            {t("subtitle")}
                        </p>

                    </div>

                </div>

                {items.length === 0 ? (

                    <div className="rounded-3xl border border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">

                        <ShoppingBag
                            size={44}
                            className="mx-auto text-gray-500"
                        />

                        <h2 className="mt-6 text-2xl font-bold">
                            {t("empty.title")}
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-gray-400">
                            {t("empty.description")}
                        </p>

                        <Link
                            href="/market"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-105"
                        >
                            {t("empty.button")}

                            <ArrowRight
                                size={18}
                            />
                        </Link>

                    </div>

                ) : (

                    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

                        {/* Basket Items */}

                        <div className="space-y-4">

                            <div className="flex items-center justify-between">

                                <span className="text-sm text-gray-400">
                                    {totalItems} {t("items")}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        clearBasket();
                                        refreshBasket();
                                    }}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    {t("clear")}
                                </button>

                            </div>

                            {items.map((item) => (

                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                                >

                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="flex items-center gap-4">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                                                <ShoppingBag
                                                    className="text-cyan-400"
                                                    size={22}
                                                />
                                            </div>

                                            <div>

                                                <h3 className="font-bold">
                                                    {item.name}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {item.category}
                                                </p>

                                                <p className="mt-1 text-sm text-cyan-400">
                                                    ${item.price}/month
                                                </p>

                                            </div>

                                        </div>

                                        <div className="flex items-center gap-4">

                                            <div className="flex items-center rounded-xl border border-white/10 bg-black/20">

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateBasketQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        );
                                                        refreshBasket();
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-cyan-400"
                                                >
                                                    <Minus size={16}/>
                                                </button>

                                                <span className="w-10 text-center font-bold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateBasketQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        );
                                                        refreshBasket();
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-cyan-400"
                                                >
                                                    <Plus size={16}/>
                                                </button>

                                            </div>

                                            <div className="min-w-20 text-right font-bold">
                                                $
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    removeBasketItem(item.id);
                                                    refreshBasket();
                                                }}
                                                className="rounded-lg p-2 text-gray-500 hover:bg-red-400/10 hover:text-red-400"
                                            >
                                                <Trash2 size={18}/>
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                        {/* Summary */}

                        <div className="h-fit rounded-3xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-xl">

                            <h2 className="text-xl font-bold">
                                {t("summary.title")}
                            </h2>

                            <div className="mt-6 space-y-4">

                                <div className="flex justify-between text-gray-400">
                                    <span>{t("summary.subtotal")}</span>

                                    <span className="text-white">
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-400">
                                    <span>{t("summary.discount")}</span>

                                    <span>$0.00</span>
                                </div>

                                <div className="border-t border-white/10 pt-4">

                                    <div className="flex justify-between">

                                        <span className="font-semibold">
                                            {t("summary.total")}
                                        </span>

                                        <span className="text-2xl font-black text-cyan-400">
                                            ${subtotal.toFixed(2)}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            <Link
                                href="/checkout"
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02]"
                            >
                                <CreditCard size={19}/>

                                {t("checkout")}
                            </Link>

                            <Link
                                href="/market"
                                className="mt-3 flex w-full justify-center rounded-xl border border-white/10 py-3 text-sm text-gray-300 transition hover:border-cyan-400 hover:text-cyan-400"
                            >
                                {t("continueShopping")}
                            </Link>

                        </div>

                    </div>

                )}

            </div>

        </section>
    );
}