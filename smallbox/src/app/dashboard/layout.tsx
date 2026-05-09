import { Sidebar } from "@/components/Sidebar";
import { WatsonChat } from "@/components/WatsonChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f5f7] dark:bg-[#080810] grid-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      <WatsonChat />
    </div>
  );
}
