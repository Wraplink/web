import type {Metadata} from "next";

import NotificationCenter from "@/components/notifications/NotificationCenter";

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
                ? "اعلان‌ها"
                : "Notifications",
    };
}

export default async function NotificationsPage({
                                                    params,
                                                }: Props) {
    const {locale} = await params;

    return (
        <NotificationCenter locale={locale}/>
    );
}