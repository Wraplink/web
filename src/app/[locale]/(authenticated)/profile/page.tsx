import type {Metadata} from "next";

import ProfileContent from "@/components/profile/ProfileContent";

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
                ? "حساب کاربری"
                : "Profile",
    };
}

export default async function ProfilePage({
                                              params,
                                          }: Props) {
    const {locale} = await params;

    return (
        <ProfileContent locale={locale}/>
    );
}