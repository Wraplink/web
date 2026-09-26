import type {Metadata} from "next";

import CheckoutContent from "@/components/checkout/CheckoutContent";

export const metadata: Metadata = {
    title: "Checkout",
};

export default function CheckoutPage() {
    return (
        <CheckoutContent locale="fa"/>
    );
}