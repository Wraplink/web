import {Suspense} from "react";

import ResetPasswordContent from "@/components/auth/ResetPasswordContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

function ResetPasswordLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#020509]">
            <div className="text-cyan-400">
                Loading...
            </div>
        </main>
    );
}

export default async function ResetPasswordPage({
                                                    params,
                                                }: Props) {
    const {locale} = await params;

    return (
        <Suspense fallback={<ResetPasswordLoading/>}>
            <ResetPasswordContent locale={locale}/>
        </Suspense>
    );
}