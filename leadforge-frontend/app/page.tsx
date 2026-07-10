"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-surface-line border-t-forge" />
    </div>
  );
}
