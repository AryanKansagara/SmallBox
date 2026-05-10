"use client";

import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-black/8 dark:border-white/8 flex items-center justify-between px-6 glass sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">{title}</h1>
        {subtitle && <p className="text-xs text-black/45 dark:text-white/45">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-black/35 dark:text-white/35" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-full pl-8 pr-4 py-1.5 text-sm text-[#1d1d1f] dark:text-white placeholder:text-black/35 dark:placeholder:text-white/35 focus:outline-none focus:border-primary/40 w-44 transition-all focus:w-60 backdrop-blur-sm"
          />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 flex items-center justify-center hover:border-primary/40 transition-all"
        >
          <Bell size={16} className="text-black/55 dark:text-white/55" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </motion.button>

        {/* User */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8 cursor-pointer hover:border-primary/40 transition-all"
        >
          <Avatar className="w-6 h-6">
            <AvatarFallback className="bg-primary text-white text-xs font-bold">
              SB
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-[#1d1d1f] dark:text-white hidden sm:block">
            My Business
          </span>
        </motion.div>
      </div>
    </header>
  );
}
