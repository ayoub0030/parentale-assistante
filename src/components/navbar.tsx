"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isParentMode, setIsParentMode] = useState(true);

  // Check current path to set the correct mode
  useEffect(() => {
    if (pathname.includes("/child")) {
      setIsParentMode(false);
    } else {
      setIsParentMode(true);
    }
  }, [pathname]);

  // Handle mode switch
  const handleModeToggle = (checked: boolean) => {
    setIsParentMode(checked);
    if (checked) {
      router.push("/parent");
    } else {
      router.push("/child");
    }
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-md overflow-hidden">
            <span 
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors", 
                isParentMode 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-700"
              )}
            >
              parent
            </span>
            <span 
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors", 
                !isParentMode 
                  ? "bg-green-500 text-white" 
                  : "bg-white text-gray-700"
              )}
            >
              child
            </span>
          </div>
          <Switch 
            checked={isParentMode}
            onCheckedChange={handleModeToggle}
            className={cn(
              isParentMode ? "bg-blue-500" : "bg-green-500"
            )}
          />
        </div>

        <div className="flex space-x-4">
          {isParentMode ? (
            <>
              <Link href="/parent/chat" className="text-gray-700 hover:text-blue-500 font-medium">
                Chat
              </Link>
              <Link href="/parent/child" className="text-gray-700 hover:text-blue-500 font-medium">
                Child
              </Link>
              <Link href="/parent/task" className="text-gray-700 hover:text-blue-500 font-medium">
                Task
              </Link>
              <Link href="/parent/report" className="text-gray-700 hover:text-blue-500 font-medium">
                Report
              </Link>
            </>
          ) : (
            <>
              <Link href="/child/chat" className="text-gray-700 hover:text-green-500 font-medium">
                Chat
              </Link>
              <Link href="/child/progress" className="text-gray-700 hover:text-green-500 font-medium">
                Progress
              </Link>
              <Link href="/child/tasks" className="text-gray-700 hover:text-green-500 font-medium">
                Tasks
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
