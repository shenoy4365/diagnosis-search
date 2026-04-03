"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChatBubbleIcon,
  LightningBoltIcon,
  ClockIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

interface SidebarProps {
  className?: string;
  onNewChat?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, onNewChat, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [activeTab, setActiveTab] = React.useState("chats");

  const navItems = [
    { id: "chats", label: "User Chats", icon: ChatBubbleIcon },
    { id: "functionality", label: "Use Cases & Functionality", icon: LightningBoltIcon },
    { id: "history", label: "History", icon: ClockIcon },
  ];

  return (
    <motion.div
      animate={{
        width: isCollapsed ? 0 : 256,
        opacity: isCollapsed ? 0 : 1
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "flex flex-col border-r border-border/40 bg-card h-screen overflow-hidden",
        className
      )}
    >
      {/* Logo/Header */}
      <div className="px-4 py-5 min-w-[256px]">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">D</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
            Diagnosis
          </h1>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-3 min-w-[256px]">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground border-0"
          variant="outline"
        >
          <PlusIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">New chat</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 min-w-[256px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 text-sm",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 min-w-[256px]">
        <div className="text-xs text-muted-foreground">
          <p className="whitespace-nowrap">Healthcare AI Search</p>
        </div>
      </div>
    </motion.div>
  );
}
