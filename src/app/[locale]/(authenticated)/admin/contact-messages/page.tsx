import AdminContactMessagesContent from "@/components/admin/AdminContactMessagesContent";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <AdminContactMessagesContent locale={locale}/>;}
