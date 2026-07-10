"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem("sidebar_collapsed", String(nextState));
  };

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      name: "Lead Discovery",
      path: "/discovery",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
    },
    {
      name: "Leads",
      path: "/leads",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      name: "Settings",
      path: "/settings",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  if (!mounted) {
    return <div className="h-screen w-60 bg-surface border-r border-surface-line shrink-0" />;
  }

  return (
    <aside
      className={`flex h-screen flex-col justify-between border-r border-surface-line bg-surface py-6 transition-all duration-300 ${
        collapsed ? "w-20 px-3" : "w-60 px-5"
      } shrink-0`}
    >
      <div>
        {/* Header / Logo */}
        <div className={`mb-10 flex items-center justify-between ${collapsed ? "flex-col gap-4" : ""}`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-forge/15 text-forge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L2 5V11L8 15L14 11V5L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M8 5V11M5 6.5L11 9.5M11 6.5L5 9.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
            {!collapsed && (
              <span className="font-display text-lg font-bold tracking-tight text-white animate-fadeIn">
                LeadForge <span className="text-forge">AI</span>
              </span>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-md p-1.5 text-ash hover:bg-surface-raised hover:text-white transition-colors"
          >
            <svg
              className={`h-4.5 w-4.5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-surface-raised text-forge border-l-2 border-forge shadow-[inset_1px_0_0_0_rgba(255,107,44,0.1)]"
                    : "text-ash hover:bg-surface-raised/40 hover:text-white"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <span className={`shrink-0 ${isActive ? "text-forge" : "text-ash group-hover:text-white"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout / Bottom Action */}
      <button
        onClick={handleLogout}
        className={`flex w-full items-center gap-3.5 rounded-lg border border-surface-line px-3 py-2.5 text-left text-sm text-ash transition-all hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-400`}
        title={collapsed ? "Sign out" : undefined}
      >
        <span className="shrink-0 text-ash hover:text-rose-400">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        {!collapsed && <span className="truncate">Sign out</span>}
      </button>
    </aside>
  );
}
