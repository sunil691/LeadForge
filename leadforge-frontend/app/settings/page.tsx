"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Profile forms
  const [name, setName] = useState("Sunil Meena");
  const [email, setEmail] = useState("sunil@leadforge.ai");
  const [password, setPassword] = useState("••••••••");

  // Preference forms
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // System forms
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Load configurations from local storage
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name");
      const storedEmail = localStorage.getItem("user_email");
      const storedNotifications = localStorage.getItem("user_notifications");
      
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedNotifications) setNotifications(storedNotifications === "true");
      
      setApiUrl(getApiUrl());
    }
  }, [router]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("user_name", name);
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_notifications", String(notifications));
        localStorage.setItem("leadforge_api_url", apiUrl);
      }
      setSaving(false);
      setMessage("Settings saved successfully!");
      
      // Auto-hide alert after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-void text-white">
      <Sidebar />

      <main className="flex-1 px-8 py-9 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 max-w-4xl"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1.5 text-sm text-ash">
              Manage your profile, adjust dashboard interfaces, and configure system endpoints.
            </p>
          </div>

          {/* Success toast alerts */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-400 font-semibold"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* 1. Profile Panel */}
            <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                Profile Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Full Name</span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/50 focus:outline-none focus:border-forge/50"
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Email Address</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/50 focus:outline-none focus:border-forge/50"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Change Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/50 focus:outline-none focus:border-forge/50"
                  />
                </label>
              </div>
            </div>

            {/* 2. Preferences Panel */}
            <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                Application Preferences
              </h2>

              <div className="space-y-4">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-white">Default Dark Mode</span>
                    <span className="block text-xs text-ash mt-0.5">
                      Enable premium glassmorphic dark interface layouts.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-forge rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-void after:border-surface-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge" />
                  </label>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-line/40">
                  <div>
                    <span className="block text-sm font-semibold text-white">Push Notifications</span>
                    <span className="block text-xs text-ash mt-0.5">
                      Get real-time updates when a discovery scrape completes.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface-raised rounded-full peer peer-focus:ring-0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-void after:border-surface-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forge" />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. System Configuration */}
            <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                System Configurations
              </h2>

              <label className="block">
                <span className="block text-xs font-semibold text-ash mb-1.5">Backend API Endpoint Connection</span>
                <input
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/50 focus:outline-none focus:border-forge/50 font-mono"
                />
                <span className="block text-[11px] text-ash/80 mt-1.5 leading-relaxed">
                  Modify the target API connection host. Defaults to <code>http://localhost:8000</code> or your environment configs.
                </span>
              </label>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-forge px-6 py-2.5 text-sm font-bold text-void shadow-ember transition-opacity hover:opacity-90 disabled:opacity-55 active:scale-[0.98]"
              >
                {saving ? "Saving Changes..." : "Save Configs"}
              </button>
            </div>

          </form>
        </motion.div>
      </main>
    </div>
  );
}
