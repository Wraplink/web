import PublicIPManager from "@/components/public-ips/PublicIPManager";

export default async function PublicIPsPage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;
 return <PublicIPManager locale={locale}/>;
}
