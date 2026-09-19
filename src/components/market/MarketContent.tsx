"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    Crown,
    Search,
    Server,
    ShoppingBag,
    Smartphone,
    Zap,
} from "lucide-react";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

import {addBasketItem} from "@/lib/basket";

type Props = {
    locale: string;
};

type Category =
    | "all"
    | "plans"
    | "services"
    | "addons";

type Product = {
    id: string;
    translationKey:
        | "starter"
        | "pro"
        | "ultimate"
        | "staticIp"
        | "extraDevice";
    category:
        | "plans"
        | "services"
        | "addons";
    monthly: number;
    icon: React.ReactNode;
    popular?: boolean;
};

const products: Product[] = [
    {
        id: "starter",
        translationKey: "starter",
        category: "plans",
        monthly: 5,
        icon: <Zap size={28}/>,
    },
    {
        id: "pro",
        translationKey: "pro",
        category: "plans",
        monthly: 12,
        icon: <Server size={28}/>,
        popular: true,
    },
    {
        id: "ultimate",
        translationKey: "ultimate",
        category: "plans",
        monthly: 25,
        icon: <Crown size={28}/>,
    },
    {
        id: "staticIp",
        translationKey: "staticIp",
        category: "services",
        monthly: 4,
        icon: <Server size={28}/>,
    },
    {
        id: "extraDevice",
        translationKey: "extraDevice",
        category: "addons",
        monthly: 3,
        icon: <Smartphone size={28}/>,
    },
];

export default function MarketContent({
                                          locale,
                                      }: Props) {
    const t = useTranslations("MarketPage");

    const [category, setCategory] =
        useState<Category>("all");

    const [search, setSearch] =
        useState("");

    const [billing, setBilling] =
        useState<"monthly" | "yearly">(
            "monthly"
        );

    const [basketCount, setBasketCount] =
        useState(0);

    const filteredProducts = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                category === "all" ||
                product.category === category;

            if (!query) {
                return matchesCategory;
            }

            const name =
                t(
                    `products.${product.translationKey}.name`
                ).toLowerCase();

            const description =
                t(
                    `products.${product.translationKey}.description`
                ).toLowerCase();

            return (
                matchesCategory &&
                (
                    name.includes(query) ||
                    description.includes(query)
                )
            );
        });
    }, [category, search, t]);

    const formatPrice = (
        monthly: number
    ) => {
        if (billing === "monthly") {
            return locale === "fa"
                ? `${monthly} دلار`
                : `$${monthly}`;
        }

        const yearly = Math.round(
            monthly * 12 * 0.8
        );

        return locale === "fa"
            ? `${yearly} دلار`
            : `$${yearly}`;
    };

    const addToBasket = (
        product: Product
    ) => {
        addBasketItem({
            id: product.id,
            name: t(
                `products.${product.translationKey}.name`
            ),
            category: t(
                `categories.${product.category}`
            ),
            price: product.monthly,
        });

        setBasketCount(
            (current) => current + 1
        );

        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * Replace the local basket implementation with:
         *
         * POST /api/v1/cart/items
         *
         * {
         *     "productId": "...",
         *     "quantity": 1
         * }
         *
         * Then refresh the cart:
         *
         * GET /api/v1/cart
         *
         * ========================================================
         */
    };

    const categories: {
        key: Category;
        label: string;
    }[] = [
        {
            key: "all",
            label: t("categories.all"),
        },
        {
            key: "plans",
            label: t("categories.plans"),
        },
        {
            key: "services",
            label: t("categories.services"),
        },
        {
            key: "addons",
            label: t("categories.addons"),
        },
    ];

    return (
        <section className="min-h-screen px-6 py-12">

            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                    <div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">

                            <ShoppingBag size={16}/>

                            {t("badge")}

                        </div>

                        <h1 className="mt-6 text-4xl font-black lg:text-5xl">
                            {t("title")}
                        </h1>

                        <p className="mt-4 max-w-2xl text-gray-400">
                            {t("subtitle")}
                        </p>

                    </div>

                    <Link
                        href="/basket"
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
                    >
                        <ShoppingBag
                            size={19}
                        />

                        {t("basket")}

                        {basketCount > 0 && (
                            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-cyan-400 px-2 text-xs font-black text-black">
                                {basketCount}
                            </span>
                        )}
                    </Link>

                </div>

                {/* Controls */}

                <div className="mt-10 flex flex-col gap-4">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Search */}

                        <div className="flex w-full items-center rounded-xl border border-white/10 bg-white/5 px-4 lg:max-w-md">

                            <Search
                                size={19}
                                className="shrink-0 text-gray-500"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                type="search"
                                placeholder={t(
                                    "search"
                                )}
                                className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600"
                            />

                        </div>

                        {/* Billing */}

                        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">

                            <button
                                type="button"
                                onClick={() =>
                                    setBilling(
                                        "monthly"
                                    )
                                }
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    billing ===
                                    "monthly"
                                        ? "bg-cyan-400 text-black"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {t(
                                    "monthly"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setBilling(
                                        "yearly"
                                    )
                                }
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    billing ===
                                    "yearly"
                                        ? "bg-cyan-400 text-black"
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                {t("yearly")}

                                <span className="ml-2 text-xs">
                                    -20%
                                </span>
                            </button>

                        </div>

                    </div>

                    {/* Categories */}

                    <div className="flex flex-wrap gap-2">

                        {categories.map(
                            (item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() =>
                                        setCategory(
                                            item.key
                                        )
                                    }
                                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                        category ===
                                        item.key
                                            ? "border-cyan-400 bg-cyan-400 text-black"
                                            : "border-white/10 bg-white/5 text-gray-400 hover:border-cyan-400/40 hover:text-white"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        )}

                    </div>

                </div>

                {/* Products */}

                {filteredProducts.length === 0 ? (

                    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 py-20 text-center">

                        <ShoppingBag
                            size={40}
                            className="mx-auto text-gray-600"
                        />

                        <h2 className="mt-5 text-xl font-bold">
                            {t("noProducts")}
                        </h2>

                        <p className="mt-2 text-gray-500">
                            {t("tryDifferentSearch")}
                        </p>

                    </div>

                ) : (

                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                        {filteredProducts.map(
                            (product) => (
                                <div
                                    key={product.id}
                                    className={`relative flex flex-col rounded-3xl border bg-white/5 p-6 backdrop-blur-xl transition hover:-translate-y-1 ${
                                        product.popular
                                            ? "border-cyan-400/50 shadow-[0_0_35px_rgba(0,229,255,0.08)]"
                                            : "border-white/10 hover:border-cyan-400/30"
                                    }`}
                                >

                                    {/* Popular */}

                                    {product.popular && (
                                        <div className="absolute -top-3 left-6 rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-black">
                                            {t(
                                                "popular"
                                            )}
                                        </div>
                                    )}

                                    {/* Icon */}

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
                                        {product.icon}
                                    </div>

                                    {/* Product */}

                                    <h2 className="mt-6 text-2xl font-bold">
                                        {t(
                                            `products.${product.translationKey}.name`
                                        )}
                                    </h2>

                                    <p className="mt-3 min-h-14 text-sm leading-6 text-gray-400">
                                        {t(
                                            `products.${product.translationKey}.description`
                                        )}
                                    </p>

                                    {/* Price */}

                                    <div className="mt-6">

                                        <span className="text-3xl font-black text-cyan-400">
                                            {formatPrice(
                                                product.monthly
                                            )}
                                        </span>

                                        <span className="ml-2 text-sm text-gray-500">
                                            {billing ===
                                            "monthly"
                                                ? t(
                                                    "perMonth"
                                                )
                                                : t(
                                                    "perYear"
                                                )}
                                        </span>

                                    </div>

                                    {/* Category */}

                                    <div className="mt-4 text-xs uppercase tracking-wider text-gray-600">
                                        {t(
                                            `categories.${product.category}`
                                        )}
                                    </div>

                                    {/* Button */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            addToBasket(
                                                product
                                            )
                                        }
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 font-bold text-black transition hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ShoppingBag
                                            size={18}
                                        />

                                        {t(
                                            "addToBasket"
                                        )}
                                    </button>

                                </div>
                            )
                        )}

                    </div>

                )}

            </div>

        </section>
    );
}