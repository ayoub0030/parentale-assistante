"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParentPage() {
  const router = useRouter();
  
  // Redirect to parent/chat by default
  useEffect(() => {
    router.push("/parent/chat");
  }, [router]);
  
  return null;
}
