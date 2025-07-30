import TopNavbar from "@/components/top-navbar";
import Sidebar from "@/components/sidebar";
import { ParlayCartProvider } from "@/components/parlay/parlay-context";
import { ToastProvider } from "@/components/ui/toast";
import ParlayCart from "@/components/parlay/parlay-cart";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ParlayCartProvider>
        <div>
          <TopNavbar />
          <Sidebar />
          {children}
          <ParlayCart />
        </div>
      </ParlayCartProvider>
    </ToastProvider>
  );
} 