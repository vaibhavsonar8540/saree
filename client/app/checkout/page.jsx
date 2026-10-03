"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/order");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-zinc-500 font-medium">Redirecting to Order page...</p>
    </div>
  );
}
