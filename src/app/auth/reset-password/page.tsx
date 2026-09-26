import {Suspense} from "react";

import ResetPasswordContent from "@/components/auth/ResetPasswordContent";

function ResetPasswordLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#020509]">
            <div className="text-cyan-400">
                Loading...
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordLoading/>}>
            <ResetPasswordContent locale="fa"/>
        </Suspense>
    );
}