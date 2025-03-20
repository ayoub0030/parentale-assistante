"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import { ModeSwitcher } from "@/components/mode-switcher";
import { useKidProfiles } from "@/lib/hooks/use-kid-profiles";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isParentMode, setIsParentMode] = useState(true);
  const { selectedProfile } = useKidProfiles();

  // Check current path to set the correct mode
  useEffect(() => {
    // Only check the first segment of the path to determine mode
    const pathSegments = pathname.split('/').filter(Boolean);
    const rootSegment = pathSegments[0] || '';
    
    if (rootSegment === "child") {
      setIsParentMode(false);
    } else if (rootSegment === "parent") {
      setIsParentMode(true);
    }
  }, [pathname]);

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4 px-4 md:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mode indicator */}
          <div className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-full",
            isParentMode 
              ? "bg-blue-100 text-blue-700" 
              : "bg-green-100 text-green-700"
          )}>
            {isParentMode ? "Parent Mode" : "Child Mode"}
            {!isParentMode && selectedProfile && `: ${selectedProfile.name}`}
          </div>
          
          {/* Mode switcher */}
          <ModeSwitcher />
        </div>

        <div className="flex space-x-6">
          {isParentMode ? (
            <>
           
              <Link href="/parent/child" className="text-gray-700 hover:text-blue-500 font-medium">
                Child
              </Link>
              <Link href="/parent/tasks" className="text-gray-700 hover:text-blue-500 font-medium">
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
          
          {/* Settings link for both modes */}
          <Link 
            href={isParentMode ? "/parent/settings" : "/child/settings"} 
            className={cn(
              "text-gray-700 font-medium flex items-center gap-1",
              isParentMode ? "hover:text-blue-500" : "hover:text-green-500"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
