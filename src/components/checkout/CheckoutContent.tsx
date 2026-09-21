"use client";

import {useEffect, useMemo, useState} from "react";

import {
    ArrowLeft,
    ArrowRight,
    Bitcoin,
    Check,
    ChevronDown,
    CircleAlert,
    CircleCheck,
    Copy,
    CreditCard,
    ExternalLink,
    Landmark,
    Loader2,
    ShieldCheck,
    Wallet,
} from "lucide-react";

import {useTranslations, useLocale} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";

import {
    clearBasket,
    getBasket,
    type BasketItem,
} from "@/lib/basket";

type Props = {
    locale: string;
};

type PaymentMethod =
    | "wallet"
    | "card"
    | "crypto"
    | "isp";

type CryptoNetwork =
    | "TRC20"
    | "ERC20"
    | "BEP20";

type IspProvider =
    | "mci"
    | "irancell"
    | "shatel"
    | "asiatech";

export default function CheckoutContent({
                                            locale,
                                        }: Props) {
    const t = useTranslations("CheckoutPage");
    const currentLocale = useLocale();
    const router = useRouter();

    const isRtl = currentLocale === "fa";

    const [items, setItems] =
        useState<BasketItem[]>([]);

    const [loaded, setLoaded] =
        useState(false);

    const [method, setMethod] =
        useState<PaymentMethod>("wallet");

    const [cryptoNetwork, setCryptoNetwork] =
        useState<CryptoNetwork>("TRC20");

    const [ispProvider, setIspProvider] =
        useState<IspProvider>("mci");

    const [copied, setCopied] =
        useState<string | null>(null);

    const [receiptFile, setReceiptFile] =
        useState<File | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        setItems(getBasket());
        setLoaded(true);
    }, []);

    const totalItems = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            ),
        [items]
    );

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

    const discount = 0;

    const total = subtotal - discount;

    const walletBalance = 126.75;

    const walletCanPay =
        walletBalance >= total;

    const cryptoAddress =
        cryptoNetwork === "TRC20"
            ? "TQxWrapLink7X9K2CryptoWallet"
            : cryptoNetwork === "ERC20"
                ? "0xWrapLink7X9K2CryptoWallet"
                : "0xWrapLinkBEP20CryptoWallet";

    const copyValue = async (
        value: string,
        key: string
    ) => {
        try {
            await navigator.clipboard.writeText(
                value
            );

            setCopied(key);

            setTimeout(
                () => setCopied(null),
                2000
            );
        } catch {
            // Clipboard API may be unavailable.
        }
    };

    const handleReceiptChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0] ?? null;

        setReceiptFile(file);
        setError("");
    };

    const validatePayment = () => {
        if (items.length === 0) {
            return t("errors.emptyBasket");
        }

        if (
            method === "wallet" &&
            !walletCanPay
        ) {
            return t("errors.insufficientBalance");
        }

        if (
            method === "card" &&
            !receiptFile
        ) {
            return t("errors.receiptRequired");
        }

        return "";
    };

    const handlePayment = async () => {
        const validationError =
            validatePayment();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setLoading(true);

        /*
         * ========================================================
         * BACKEND TODO
         * ========================================================
         *
         * Step 1:
         *
         * POST /api/v1/orders
         *
         * {
         *   items: [...],
         *   paymentMethod: method,
         *   total: total
         * }
         *
         * Backend creates the order and returns:
         *
         * {
         *   id: "WL-1004",
         *   status: "pending",
         *   paymentId: "PAY-..."
         * }
         *
         * --------------------------------------------------------
         *
         * Wallet:
         *
         * POST /api/v1/payments/wallet
         *
         * {
         *   orderId,
         *   amount
         * }
         *
         * --------------------------------------------------------
         *
         * Card-to-card:
         *
         * POST /api/v1/payments/card-to-card
         *
         * multipart/form-data:
         *   orderId
         *   receipt
         *
         * --------------------------------------------------------
         *
         * Crypto:
         *
         * POST /api/v1/payments/crypto
         *
         * {
         *   orderId,
         *   network,
         *   amount
         * }
         *
         * --------------------------------------------------------
         *
         * ISP:
         *
         * POST /api/v1/payments/isp
         *
         * {
         *   orderId,
         *   provider
         * }
         *
         * ========================================================
         */

        await new Promise((resolve) =>
            setTimeout(resolve, 1800)
        );

        clearBasket();

        setLoading(false);

        router.push("/orders");
    };

    if (!loaded) {
        return (
            <section className="min-h-screen px-6 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-pulse text-gray-500">
                        {t("loading")}
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="min-h-screen px-6 py-12">
                <div className="mx-auto max-w-4xl">

                    <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center backdrop-blur-xl">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10">
                            <CreditCard
                                size={36}
                                className="text-cyan-400"
                            />
                        </div>

                        <h1 className="mt-6 text-3xl font-black">
                            {t("empty.title")}
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-gray-400">
                            {t("empty.description")}
                        </p>

                        <Link
                            href="/market"
                            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-black transition hover:scale-105"
                        >
                            {t("empty.button")}

                            {isRtl ? (
                                <ArrowLeft size={18}/>
                            ) : (
                                <ArrowRight size={18}/>
                            )}
                        </Link>

                    </div>

                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen px-6 py-12">

            <div className="mx-auto max-w-7xl">

                {/* Header */}

                <div className="mb-10">

                    <Link
                        href="/basket"
                        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-400"
                    >
                        {isRtl ? (
                            <ArrowRight size={16}/>
                        ) : (
                            <ArrowLeft size={16}/>
                        )}

                        {t("backToBasket")}
                    </Link>

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                            <ShieldCheck
                                size={28}
                                className="text-cyan-400"
                            />
                        </div>

                        <div>

                            <div className="mb-2 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                                {t("badge")}
                            </div>

                            <h1 className="text-3xl font-black lg:text-4xl">
                                {t("title")}
                            </h1>

                            <p className="mt-2 text-gray-400">
                                {t("subtitle")}
                            </p>

                        </div>

                    </div>

                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

                    {/* LEFT */}

                    <div className="space-y-6">

                        {/* Payment methods */}

                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

                            <h2 className="text-xl font-bold">
                                {t("paymentMethod")}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {t("paymentMethodDescription")}
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                                <PaymentMethodCard
                                    selected={
                                        method === "wallet"
                                    }
                                    onClick={() =>
                                        setMethod("wallet")
                                    }
                                    icon={
                                        <Wallet
                                            size={22}
                                        />
                                    }
                                    title={t(
                                        "methods.wallet"
                                    )}
                                    description={t(
                                        "methods.walletDesc"
                                    )}
                                />

                                <PaymentMethodCard
                                    selected={
                                        method === "card"
                                    }
                                    onClick={() =>
                                        setMethod("card")
                                    }
                                    icon={
                                        <Landmark
                                            size={22}
                                        />
                                    }
                                    title={t(
                                        "methods.card"
                                    )}
                                    description={t(
                                        "methods.cardDesc"
                                    )}
                                />

                                <PaymentMethodCard
                                    selected={
                                        method === "crypto"
                                    }
                                    onClick={() =>
                                        setMethod("crypto")
                                    }
                                    icon={
                                        <Bitcoin
                                            size={22}
                                        />
                                    }
                                    title={t(
                                        "methods.crypto"
                                    )}
                                    description={t(
                                        "methods.cryptoDesc"
                                    )}
                                />

                                <PaymentMethodCard
                                    selected={
                                        method === "isp"
                                    }
                                    onClick={() =>
                                        setMethod("isp")
                                    }
                                    icon={
                                        <CreditCard
                                            size={22}
                                        />
                                    }
                                    title={t(
                                        "methods.isp"
                                    )}
                                    description={t(
                                        "methods.ispDesc"
                                    )}
                                />

                            </div>

                        </div>

                        {/* Payment details */}

                        {method === "wallet" && (
                            <WalletPayment
                                t={t}
                                balance={
                                    walletBalance
                                }
                                total={total}
                                canPay={
                                    walletCanPay
                                }
                            />
                        )}

                        {method === "card" && (
                            <CardPayment
                                t={t}
                                receiptFile={
                                    receiptFile
                                }
                                onReceiptChange={
                                    handleReceiptChange
                                }
                                copied={copied}
                                onCopy={() =>
                                    copyValue(
                                        "6037997700001234",
                                        "card"
                                    )
                                }
                            />
                        )}

                        {method === "crypto" && (
                            <CryptoPayment
                                t={t}
                                network={
                                    cryptoNetwork
                                }
                                setNetwork={
                                    setCryptoNetwork
                                }
                                address={
                                    cryptoAddress
                                }
                                copied={copied}
                                onCopy={() =>
                                    copyValue(
                                        cryptoAddress,
                                        "crypto"
                                    )
                                }
                            />
                        )}

                        {method === "isp" && (
                            <IspPayment
                                t={t}
                                provider={
                                    ispProvider
                                }
                                setProvider={
                                    setIspProvider
                                }
                            />
                        )}

                        {/* Error */}

                        {error && (
                            <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">

                                <CircleAlert
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}

                    </div>

                    {/* RIGHT */}

                    <div className="h-fit rounded-3xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur-xl lg:sticky lg:top-6">

                        <div className="flex items-center justify-between">

                            <h2 className="text-xl font-bold">
                                {t("summary.title")}
                            </h2>

                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                                {totalItems} {t("summary.items")}
                            </span>

                        </div>

                        <div className="mt-6 space-y-4">

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4"
                                >
                                    <div className="min-w-0">

                                        <div className="truncate text-sm font-medium">
                                            {item.name}
                                        </div>

                                        <div className="mt-1 text-xs text-gray-500">
                                            {t(
                                                "summary.quantity"
                                            )}:{" "}
                                            {item.quantity}
                                        </div>

                                    </div>

                                    <div className="shrink-0 text-sm font-semibold">
                                        $
                                        {(
                                            item.price *
                                            item.quantity
                                        ).toFixed(2)}
                                    </div>

                                </div>
                            ))}

                        </div>

                        <div className="my-6 border-t border-white/10"/>

                        <div className="space-y-3">

                            <SummaryRow
                                label={t(
                                    "summary.subtotal"
                                )}
                                value={`$${subtotal.toFixed(
                                    2
                                )}`}
                            />

                            <SummaryRow
                                label={t(
                                    "summary.discount"
                                )}
                                value={`-$${discount.toFixed(
                                    2
                                )}`}
                            />

                        </div>

                        <div className="my-6 border-t border-white/10"/>

                        <div className="flex items-center justify-between">

                            <span className="font-bold">
                                {t("summary.total")}
                            </span>

                            <span className="text-3xl font-black text-cyan-400">
                                ${total.toFixed(2)}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={handlePayment}
                            disabled={loading}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-4 font-bold text-black transition hover:scale-[1.02] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={19}
                                        className="animate-spin"
                                    />

                                    {t("processing")}
                                </>
                            ) : (
                                <>
                                    <ShieldCheck
                                        size={19}
                                    />

                                    {t("payNow")}
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <ShieldCheck
                                size={14}
                            />

                            {t("securePayment")}
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

/* ============================================================
 * Payment Method Card
 * ============================================================ */

function PaymentMethodCard({
                               selected,
                               onClick,
                               icon,
                               title,
                               description,
                           }: {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full rounded-2xl border p-4 text-left transition ${
                selected
                    ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_25px_rgba(0,229,255,0.06)]"
                    : "border-white/10 bg-black/10 hover:border-cyan-400/30 hover:bg-white/5"
            }`}
        >

            <div className="flex items-start gap-3">

                <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        selected
                            ? "bg-cyan-400 text-black"
                            : "bg-white/5 text-cyan-400"
                    }`}
                >
                    {icon}
                </div>

                <div className="min-w-0">

                    <div className="font-semibold text-white">
                        {title}
                    </div>

                    <div className="mt-1 text-xs leading-5 text-gray-500">
                        {description}
                    </div>

                </div>

            </div>

        </button>
    );
}

/* ============================================================
 * Wallet
 * ============================================================ */

function WalletPayment({
                           t,
                           balance,
                           total,
                           canPay,
                       }: {
    t: ReturnType<
        typeof useTranslations
    >;
    balance: number;
    total: number;
    canPay: boolean;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-400/10 text-green-400">
                    <Wallet size={22}/>
                </div>

                <div>
                    <h3 className="font-bold">
                        {t("wallet.title")}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {t("wallet.description")}
                    </p>
                </div>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <BalanceBox
                    label={t("wallet.balance")}
                    value={`$${balance.toFixed(2)}`}
                />

                <BalanceBox
                    label={t("wallet.required")}
                    value={`$${total.toFixed(2)}`}
                />

            </div>

            {canPay ? (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-400/20 bg-green-400/5 p-4 text-sm text-green-300">

                    <CircleCheck size={19}/>

                    {t("wallet.sufficient")}
                </div>
            ) : (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">

                    <CircleAlert size={19}/>

                    {t("wallet.insufficient")}
                </div>
            )}

        </div>
    );
}

function BalanceBox({
                        label,
                        value,
                    }: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

            <div className="text-xs text-gray-500">
                {label}
            </div>

            <div className="mt-2 text-xl font-bold">
                {value}
            </div>

        </div>
    );
}

/* ============================================================
 * Card-to-Card
 * ============================================================ */

function CardPayment({
                         t,
                         receiptFile,
                         onReceiptChange,
                         copied,
                         onCopy,
                     }: {
    t: ReturnType<
        typeof useTranslations
    >;
    receiptFile: File | null;
    onReceiptChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    copied: string | null;
    onCopy: () => void;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
                    <Landmark size={22}/>
                </div>

                <div>
                    <h3 className="font-bold">
                        {t("card.title")}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {t("card.description")}
                    </p>
                </div>

            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                <div className="text-xs text-gray-500">
                    {t("card.cardHolder")}
                </div>

                <div className="mt-1 font-semibold">
                    {t("card.cardHolderName")}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    {t("card.cardNumber")}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">

                    <code className="text-lg font-bold tracking-wider text-cyan-400">
                        6037 9977 0000 1234
                    </code>

                    <button
                        type="button"
                        onClick={onCopy}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition hover:bg-cyan-400/10 hover:text-cyan-400"
                    >
                        {copied === "card" ? (
                            <Check size={17}/>
                        ) : (
                            <Copy size={17}/>
                        )}
                    </button>

                </div>

            </div>

            <div className="mt-6">

                <label className="text-sm font-semibold">
                    {t("card.receipt")}
                </label>

                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/10 px-6 py-10 text-center transition hover:border-cyan-400/40">

                    <CreditCard
                        size={30}
                        className="text-gray-500"
                    />

                    <span className="mt-3 text-sm text-gray-300">
                        {t("card.upload")}
                    </span>

                    <span className="mt-1 text-xs text-gray-600">
                        {t("card.fileTypes")}
                    </span>

                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={
                            onReceiptChange
                        }
                        className="hidden"
                    />

                </label>

                {receiptFile && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 p-3 text-sm text-green-300">

                        <CircleCheck
                            size={17}
                        />

                        <span className="truncate">
                            {receiptFile.name}
                        </span>

                    </div>
                )}

            </div>

        </div>
    );
}

/* ============================================================
 * Crypto
 * ============================================================ */

function CryptoPayment({
                           t,
                           network,
                           setNetwork,
                           address,
                           copied,
                           onCopy,
                       }: {
    t: ReturnType<
        typeof useTranslations
    >;
    network: CryptoNetwork;
    setNetwork: (
        network: CryptoNetwork
    ) => void;
    address: string;
    copied: string | null;
    onCopy: () => void;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400">
                    <Bitcoin size={22}/>
                </div>

                <div>
                    <h3 className="font-bold">
                        {t("crypto.title")}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {t("crypto.description")}
                    </p>
                </div>

            </div>

            <div className="mt-6">

                <label className="text-sm font-semibold">
                    {t("crypto.network")}
                </label>

                <div className="relative mt-2">

                    <select
                        value={network}
                        onChange={(event) =>
                            setNetwork(
                                event.target
                                    .value as CryptoNetwork
                            )
                        }
                        className="w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-10 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                        <option value="TRC20">
                            USDT — TRC20
                        </option>

                        <option value="ERC20">
                            USDT — ERC20
                        </option>

                        <option value="BEP20">
                            USDT — BEP20
                        </option>
                    </select>

                    <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                </div>

            </div>

            {/* QR placeholder */}

            <div className="mt-6 flex justify-center">

                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-white/10 bg-white p-4">

                    <div className="grid h-full w-full grid-cols-8 gap-1">

                        {Array.from({
                            length: 64,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className={
                                    (
                                        index * 17 +
                                        index * index
                                    ) %
                                    7 <
                                    3
                                        ? "bg-black"
                                        : "bg-white"
                                }
                            />
                        ))}

                    </div>

                </div>

            </div>

            <div className="mt-6">

                <div className="text-xs text-gray-500">
                    {t("crypto.address")}
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3">

                    <code className="min-w-0 flex-1 truncate text-xs text-cyan-400">
                        {address}
                    </code>

                    <button
                        type="button"
                        onClick={onCopy}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-cyan-400"
                    >
                        {copied === "crypto" ? (
                            <Check size={17}/>
                        ) : (
                            <Copy size={17}/>
                        )}
                    </button>

                </div>

            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-xs leading-5 text-yellow-300">

                <CircleAlert
                    size={16}
                    className="mt-0.5 shrink-0"
                />

                {t("crypto.warning")}

            </div>

        </div>
    );
}

/* ============================================================
 * ISP
 * ============================================================ */

function IspPayment({
                        t,
                        provider,
                        setProvider,
                    }: {
    t: ReturnType<
        typeof useTranslations
    >;
    provider: IspProvider;
    setProvider: (
        provider: IspProvider
    ) => void;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                    <ExternalLink
                        size={22}
                    />
                </div>

                <div>
                    <h3 className="font-bold">
                        {t("isp.title")}
                    </h3>

                    <p className="text-sm text-gray-500">
                        {t("isp.description")}
                    </p>
                </div>

            </div>

            <div className="mt-6">

                <label className="text-sm font-semibold">
                    {t("isp.provider")}
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">

                    <IspOption
                        selected={
                            provider === "mci"
                        }
                        onClick={() =>
                            setProvider("mci")
                        }
                        title="MCI"
                    />

                    <IspOption
                        selected={
                            provider === "irancell"
                        }
                        onClick={() =>
                            setProvider(
                                "irancell"
                            )
                        }
                        title="Irancell"
                    />

                    <IspOption
                        selected={
                            provider === "shatel"
                        }
                        onClick={() =>
                            setProvider(
                                "shatel"
                            )
                        }
                        title="Shatel"
                    />

                    <IspOption
                        selected={
                            provider === "asiatech"
                        }
                        onClick={() =>
                            setProvider(
                                "asiatech"
                            )
                        }
                        title="Asiatech"
                    />

                </div>

            </div>

            <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-yellow-300">
                {t("isp.note")}
            </div>

        </div>
    );
}

function IspOption({
                       selected,
                       onClick,
                       title,
                   }: {
    selected: boolean;
    onClick: () => void;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border p-4 text-left font-semibold transition ${
                selected
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                    : "border-white/10 bg-black/10 text-gray-300 hover:border-cyan-400/30"
            }`}
        >
            {title}
        </button>
    );
}

/* ============================================================
 * Summary
 * ============================================================ */

function SummaryRow({
                        label,
                        value,
                    }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between text-sm">

            <span className="text-gray-400">
                {label}
            </span>

            <span>
                {value}
            </span>

        </div>
    );
}