import {redirect} from "next/navigation";

// Legacy unprefixed route: send visitors to the public Persian storefront.
// User-zone navigation uses /fa/user/basket and retains the sidebar.
export default function LegacyBasketPage() {
    redirect("/fa/basket");
}
