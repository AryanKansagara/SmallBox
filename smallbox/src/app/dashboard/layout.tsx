"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WatsonChat } from "@/components/WatsonChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      {showChat && <WatsonChat />}
      {!showChat && (
        <button
          type="button"
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-[1.02]"
        >
          Open AI Assistant
        </button>
      )}
    </div>
  );
}
