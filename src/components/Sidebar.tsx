"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChatBubbleIcon,
  PersonIcon,
  FileTextIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

interface SidebarProps {
  className?: string;
  onNewChat?: () => void;
}

export function Sidebar({ className, onNewChat }: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState("talk");

  const navItems = [
    { id: "talk", label: "Talk", icon: ChatBubbleIcon },
    { id: "physicians", label: "Physicians", icon: PersonIcon },
    { id: "knowledge", label: "Knowledge", icon: FileTextIcon },
  ];

  return (
    <div
      className={cn(
        "flex flex-col w-64 border-r bg-background h-screen",
        className
      )}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            diagnosis
          </h1>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 mb-1",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          <p>Healthcare AI Search v1.0</p>
        </div>
      </div>
    </div>
  );
}
