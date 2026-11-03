import {redirect} from "next/navigation";

// Legacy unprefixed route: send visitors to the public Persian storefront.
// User-zone navigation uses /fa/user/market and retains the sidebar.
export default function LegacyMarketPage() {
    redirect("/fa/market");
}
