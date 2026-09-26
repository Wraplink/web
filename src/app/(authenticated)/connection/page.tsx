import type {Metadata} from "next";

import ConnectionContent from "@/components/connection/ConnectionContent";

export const metadata: Metadata = {
    title: "Connection",
};

export default function ConnectionPage() {
    return (
        <ConnectionContent locale="fa"/>
    );
}