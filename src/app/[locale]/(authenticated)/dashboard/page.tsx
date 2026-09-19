import type {Metadata} from "next";

import DashboardContent from "@/components/dashboard/DashboardContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({
                                           params,
                                       }: Props): Promise<Metadata> {
    const {locale} = await params;

    return {
        title:
            locale === "fa"
                ? "داشبورد"
                : "Dashboard",
    };
}

export default async function DashboardPage({
                                                params,
                                            }: Props) {
    const {locale} = await params;

    return (
        <DashboardContent
            locale={locale}
        />
    );
}