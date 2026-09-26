import type {Metadata} from "next";

import OrdersContent from "@/components/orders/OrdersContent";

export const metadata: Metadata = {
    title: "Orders",
};

export default function OrdersPage() {
    return (
        <OrdersContent locale="fa"/>
    );
}