import {Suspense} from "react";
import VerifyEmailContent from "@/components/auth/VerifyEmailContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function VerifyEmailPage({
                                                  params
                                              }: Props) {

    const {locale} = await params;

    return <Suspense fallback={null}><VerifyEmailContent locale={locale}/></Suspense>;
}