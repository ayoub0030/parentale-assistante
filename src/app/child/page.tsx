"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChildPage() {
  const router = useRouter();
  
  // Redirect to child/chat by default
  useEffect(() => {
    router.push("/child/chat");
  }, [router]);
  
  return null;
}
