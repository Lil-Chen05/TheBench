import TopNavbar from "@/components/top-navbar";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopNavbar />
      <Sidebar />
      {children}
    </div>
  );
} 