import AdminPaymentCardsContent from "@/components/admin/AdminPaymentCardsContent";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <AdminPaymentCardsContent locale={locale}/>;}
