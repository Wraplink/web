import AdminHome from "@/components/admin/AdminHome";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <AdminHome locale={locale}/>;}
