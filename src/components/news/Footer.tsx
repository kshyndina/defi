"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

export function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Verify the code before making the API call
      if (code !== 'c2xpLSbW0dHgPc6v65Q4') {
        toast({
          title: "Error",
          description: "Invalid refresh code",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/refresh", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Articles refreshed successfully",
        });
        setIsOpen(false);
        setCode("");
        
        // Force a page refresh to show the updated content
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to refresh articles",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 DUF. All rights reserved.</p>
          <p className="mt-2">DUF is not responsible for the content of external sites.</p>
          
          <div className="mt-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Articles
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-black border border-gray-800 hover:border-gray-600 transition-colors">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg font-medium">Refresh Articles</DialogTitle>
                  <DialogDescription className="text-gray-400 text-sm">
                    Enter the refresh code to fetch the latest articles from Google Sheets.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      id="code"
                      type="password"
                      placeholder="Enter refresh code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleRefresh}
                    disabled={isLoading || !code}
                    className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-700"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Refresh
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </footer>
  );
}