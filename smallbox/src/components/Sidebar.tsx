"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  DollarSign,
  Megaphone,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/website", icon: Globe, label: "Website Builder" },
  { href: "/dashboard/finance", icon: DollarSign, label: "Finance & Budget" },
  { href: "/dashboard/marketing", icon: Megaphone, label: "Marketing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r border-black/8 dark:border-white/8 glass-strong dark:glass bg-white/82 dark:bg-transparent">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-black/8 dark:border-white/8">
        <span className="text-[#1d1d1f] dark:text-white font-bold text-xl tracking-tight">SmallBox</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  active
                    ? "bg-primary/12 dark:bg-primary/15 text-primary border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-black/55 dark:text-white/55 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon
                  size={18}
                  className={cn(
                    "transition-colors",
                    active
                      ? "text-primary"
                      : "text-black/35 dark:text-white/35 group-hover:text-black dark:group-hover:text-white"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-primary" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* IBM Badge */}
      <div className="px-4 py-4 border-t border-black/8 dark:border-white/8">
        <div className="rounded-xl bg-black/4 dark:bg-white/5 border border-black/8 dark:border-white/8 px-3 py-3 backdrop-blur-sm">
          <p className="text-xs text-black/40 dark:text-white/35 mb-1">Powered by</p>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-primary/15 dark:bg-primary/20 flex items-center justify-center">
              <span className="text-[9px] font-bold text-primary">IBM</span>
            </div>
            <span className="text-xs font-semibold text-black/55 dark:text-white/55">
              watsonx.ai + Cloud
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
