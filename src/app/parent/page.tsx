"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParentPage() {
  const router = useRouter();
  
  // Redirect to parent/child by default
  useEffect(() => {
    router.push("/parent/child");
  }, [router]);
  
  return null;
}
