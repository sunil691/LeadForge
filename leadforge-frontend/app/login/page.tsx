"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser } from "@/lib/api";
import { setToken } from "@/lib/auth";
import EmberField from "@/components/EmberField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      setToken(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-grain relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(232,98,42,0.08),transparent_60%)]" />
      <EmberField count={20} />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-surface-line bg-surface/90 p-8 shadow-ember-lg backdrop-blur-sm"
      >
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forge/15 text-forge">
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L2 5V11L8 15L14 11V5L8 1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 5V11M5 6.5L11 9.5M11 6.5L5 9.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="font-display text-xl font-medium tracking-tight">LeadForge</span>
        </div>

        <h1 className="font-display text-2xl font-medium text-warm">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ash">Sign in to your forge floor.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-ash">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-surface-line bg-surface-raised px-3.5 py-2.5 text-sm text-warm placeholder:text-ash focus:border-forge/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-ash">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-surface-line bg-surface-raised px-3.5 py-2.5 text-sm text-warm placeholder:text-ash focus:border-forge/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-forge">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-forge py-2.5 text-sm font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ash">
          New here?{" "}
          <Link href="/register" className="text-forge hover:opacity-80">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
