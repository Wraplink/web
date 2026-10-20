import type {ReactNode} from "react";
import AdminLayoutGate from "@/components/admin/AdminLayoutGate";
export default function Layout({children}:{children:ReactNode}){return <AdminLayoutGate>{children}</AdminLayoutGate>;}
