"use client";

import { motion } from "framer-motion";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 glass sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-[#8b9cb6]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-[#4b5e7a]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#1a2235] border border-[#2a3a55] rounded-full pl-8 pr-4 py-1.5 text-sm text-[#8b9cb6] placeholder:text-[#4b5e7a] focus:outline-none focus:border-primary/50 w-48 transition-all focus:w-64"
          />
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl bg-[#1a2235] border border-[#2a3a55] flex items-center justify-center hover:border-primary/40 transition-colors"
        >
          <Bell size={16} className="text-[#8b9cb6]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </motion.button>

        {/* User */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a2235] border border-[#2a3a55] cursor-pointer hover:border-primary/40 transition-colors"
        >
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-primary text-white text-xs font-bold">SB</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-white hidden sm:block">My Business</span>
          <ChevronDown size={12} className="text-[#4b5e7a]" />
        </motion.div>
      </div>
    </header>
  );
}
