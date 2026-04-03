"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  FileTextIcon,
  GlobeIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon
} from "@radix-ui/react-icons";

export type SearchMode = "scientific" | "healthcare" | "general";

interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

const searchModes = [
  { id: "scientific" as SearchMode, label: "Scientific Research Papers", icon: FileTextIcon },
  { id: "healthcare" as SearchMode, label: "Healthcare Websites", icon: GlobeIcon },
  { id: "general" as SearchMode, label: "General Search", icon: MagnifyingGlassIcon },
];

export function SearchBar({
  onSearch,
  placeholder = "Ask anything about healthcare...",
  isLoading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [selectedMode, setSelectedMode] = React.useState<SearchMode>("healthcare");
  const [isModeMenuOpen, setIsModeMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), selectedMode);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentMode = searchModes.find((m) => m.id === selectedMode);
  const ModeIcon = currentMode?.icon || GlobeIcon;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-3xl mx-auto", className)}
    >
      <div className="relative">
        {/* Main Search Box */}
        <div className="relative flex items-center gap-3 px-5 py-4 border border-border/40 rounded-2xl bg-card/30 backdrop-blur-sm hover:border-border/60 transition-all duration-200 focus-within:border-border focus-within:bg-card/50">

          {/* Plus Button + Mode Selector */}
          <div className="relative flex items-center gap-3" ref={menuRef}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
              className="h-9 w-9 rounded-lg hover:bg-secondary/50 flex-shrink-0"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>

            {/* Current Mode Display */}
            <button
              type="button"
              onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <ModeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground/80">{currentMode?.label.split(" ")[0]}</span>
              <PlusIcon className="h-3 w-3 text-muted-foreground" />
            </button>

            {/* Mode Selection Dropdown */}
            <AnimatePresence>
              {isModeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3">
                    {searchModes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = selectedMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setSelectedMode(mode.id);
                            setIsModeMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/30 transition-colors group"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-sm flex-1 text-left text-foreground/80 group-hover:text-foreground">
                            {mode.label}
                          </span>
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-base focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/50"
            autoFocus
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!query.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl bg-primary/90 hover:bg-primary disabled:opacity-20 flex-shrink-0"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
