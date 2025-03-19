"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { User, LockKeyhole, Users, AlertCircle } from "lucide-react";
import { ChildSelectionDialog } from "./child-selection-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ModeSwitcher() {
  const [showDialog, setShowDialog] = useState(false);
  const [showChildSelection, setShowChildSelection] = useState(false);
  const [showParentAuth, setShowParentAuth] = useState(false);
  const [parentPin, setParentPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleModeSwitch = () => {
    setShowDialog(true);
  };

  const handleSelectMode = (mode: "parent" | "child") => {
    if (mode === "parent") {
      // For parent mode, show the authentication dialog
      setShowDialog(false);
      setShowParentAuth(true);
    } else {
      // For child mode, show the child selection dialog
      setShowDialog(false);
      setShowChildSelection(true);
    }
  };

  const handleParentAuth = () => {
    // Get the stored PIN from localStorage or use a default if not set
    const storedPin = localStorage.getItem("parentPin") || "1234";
    
    if (parentPin === storedPin) {
      // Set a cookie to indicate parent mode
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 1); // Shorter expiration for parent mode
      document.cookie = `parentMode=true; path=/; expires=${expirationDate.toUTCString()}`;
      
      router.push("/parent");
      setShowParentAuth(false);
      setParentPin("");
      setError("");
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleModeSwitch}
        className="gap-2"
      >
        <Users className="h-4 w-4" />
        Switch Mode
      </Button>

      {/* Mode selection dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Switch Mode</DialogTitle>
            <DialogDescription>
              Choose which mode you want to use the application in.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleSelectMode("parent")}
            >
              <LockKeyhole className="h-8 w-8" />
              <span>Parent Mode</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleSelectMode("child")}
            >
              <User className="h-8 w-8" />
              <span>Child Mode</span>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Parent authentication dialog */}
      <Dialog open={showParentAuth} onOpenChange={setShowParentAuth}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Parent Authentication</DialogTitle>
            <DialogDescription>
              Please enter your PIN to access parent mode.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Input
              type="password"
              placeholder="Enter PIN"
              value={parentPin}
              onChange={(e) => setParentPin(e.target.value)}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleParentAuth();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Default PIN is 1234 if you haven't set one
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParentAuth(false)}>
              Cancel
            </Button>
            <Button onClick={handleParentAuth}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Child selection dialog */}
      <ChildSelectionDialog 
        open={showChildSelection} 
        onOpenChange={setShowChildSelection} 
      />
    </>
  );
}
