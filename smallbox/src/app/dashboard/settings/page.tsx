"use client";

import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/DashboardHeader";
import { User, Building2, Bell, Shield, Database, Zap, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "profile",
    icon: User,
    label: "Profile & Account",
    desc: "Manage your personal info and login credentials",
    fields: [
      { label: "Full Name", value: "Maria Chen" },
      { label: "Email", value: "maria@sweetcrumbs.ca" },
      { label: "Phone", value: "+1 (905) 555-0123" },
    ],
  },
  {
    id: "business",
    icon: Building2,
    label: "Business Details",
    desc: "Info used to personalize AI-generated content",
    fields: [
      { label: "Business Name", value: "Sweet Crumbs Bakery" },
      { label: "Industry", value: "Food & Beverage" },
      { label: "Location", value: "Mississauga, ON, Canada" },
      { label: "Website", value: "sweetcrumbs.smallbox.app" },
    ],
  },
];

const ibmServices = [
  { name: "watsonx.ai", status: "Connected", usage: "Trial active", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "IBM Cloudant", status: "Connected", usage: "0.2 GB / 1 GB", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "IBM Cloud SQL", status: "Connected", usage: "2.1 GB / 30 GB/day", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "IBM Verify", status: "Connected", usage: "SSO active", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "Watson NLU", status: "Connected", usage: "Free tier", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "IBM Instana", status: "Trial", usage: "14-day trial", color: "text-amber-500", bg: "bg-amber-500/10" },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader title="Settings" subtitle="Manage your account, business details, and IBM services" />

      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        {sections.map((section, si) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
            className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <section.icon size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white">{section.label}</h3>
                <p className="text-xs text-black/40 dark:text-white/40">{section.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              {section.fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between py-2.5 border-b border-black/6 dark:border-white/6 last:border-0"
                >
                  <span className="text-sm text-black/50 dark:text-white/50">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1d1d1f] dark:text-white font-medium">{field.value}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* IBM Services Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Database size={16} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white">IBM Services Status</h3>
              <p className="text-xs text-black/40 dark:text-white/40">Connected IBM Cloud services powering your SmallBox</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ibmServices.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ borderColor: "rgba(123,47,255,0.3)" }}
                className="flex items-center justify-between p-3 rounded-xl border border-black/6 dark:border-white/6 bg-black/3 dark:bg-white/4 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">IBM</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f] dark:text-white">{svc.name}</p>
                    <p className="text-[10px] text-black/40 dark:text-white/40">{svc.usage}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${svc.bg} ${svc.color}`}>
                  {svc.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell size={16} className="text-primary" />
            </div>
            <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Notifications</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Budget alerts (when nearing limit)", enabled: true },
              { label: "Website uptime notifications", enabled: true },
              { label: "Monthly finance summary", enabled: true },
              { label: "Marketing campaign performance", enabled: false },
              { label: "IBM service status updates", enabled: false },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-black/6 dark:border-white/6 last:border-0"
              >
                <span className="text-sm text-black/55 dark:text-white/55">{n.label}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${n.enabled ? "bg-primary" : "bg-black/12 dark:bg-white/12"}`}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: n.enabled ? "calc(100% - 18px)" : "2px" }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-black/8 dark:border-white/8 glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield size={16} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Security (IBM Verify)</h3>
              <p className="text-xs text-black/40 dark:text-white/40">Managed by IBM Verify — SSO, MFA, session management</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Multi-Factor Authentication", badge: "Enabled", color: "text-emerald-500 bg-emerald-500/10" },
              { label: "SSO via IBM Verify", badge: "Active", color: "text-emerald-500 bg-emerald-500/10" },
              { label: "Session Management", badge: "Managed", color: "text-primary bg-primary/10" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between py-2 border-b border-black/6 dark:border-white/6 last:border-0"
              >
                <span className="text-sm text-black/55 dark:text-white/55">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color}`}>{s.badge}</span>
                  <ChevronRight size={14} className="text-black/30 dark:text-white/30" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_16px_rgba(123,47,255,0.4)]">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1d1d1f] dark:text-white">Free Plan — IBM Free Tier</h3>
                <p className="text-xs text-black/40 dark:text-white/40">All features included · IBM Cloudant 1GB · watsonx.ai trial</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Free Forever
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
