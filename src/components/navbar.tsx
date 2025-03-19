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
        <div className="flex items-center">
          <div 
            className="flex items-center border rounded-full overflow-hidden cursor-pointer"
            onClick={() => handleModeToggle(!isParentMode)}
          >
            <div 
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                isParentMode 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-gray-500 hover:text-gray-700"
              )}
            >
              <span>parent</span>
              {isParentMode && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              )}
            </div>
            <div 
              className={cn(
                "px-4 py-1.5 text-sm font-medium transition-colors flex items-center gap-2",
                !isParentMode 
                  ? "bg-green-500 text-white" 
                  : "bg-white text-gray-500 hover:text-gray-700"
              )}
            >
              <span>child</span>
              {!isParentMode && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              )}
            </div>
          </div>
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
