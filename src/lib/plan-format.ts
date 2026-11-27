import type {MarketPlan} from "@/lib/api/plans";

export function formatPlanPrice(plan: MarketPlan, locale: string) {
    const currency = plan.currency.toUpperCase();
    const amount = plan.priceMinor / (currency === "IRR" ? 1 : 100);
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "IRR" ? 0 : 2,
    }).format(amount);
}

export function formatPlanData(bytes: number, locale: string) {
    const fa = locale === "fa";
    if (bytes === 0) return fa ? "نامشخص" : "Unknown";
    if (!Number.isFinite(bytes) || bytes < 0) return fa ? "نامشخص" : "Unknown";
    const localeTag = fa ? "fa-IR" : "en-US";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let amount = bytes;
    let unit = 0;
    while (amount >= 1024 && unit < units.length - 1) { amount /= 1024; unit++; }
    return `${new Intl.NumberFormat(localeTag, {maximumFractionDigits: amount < 10 ? 2 : 1}).format(amount)} ${units[unit]}`;
}
