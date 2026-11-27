import AdminLayoutGate from "@/components/admin/AdminLayoutGate";
import DnsDomainManagement from "@/components/admin/DnsDomainManagement";

export default function Page() {
  return <AdminLayoutGate><DnsDomainManagement /></AdminLayoutGate>;
}
