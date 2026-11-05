import {Suspense} from "react";
import VerifyEmailContent from "@/components/auth/VerifyEmailContent";

export default function VerifyEmailPage() {
    return <Suspense fallback={null}><VerifyEmailContent locale="fa"/></Suspense>;
}