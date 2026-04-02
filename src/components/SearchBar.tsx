"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagnifyingGlassIcon, PaperPlaneIcon } from "@radix-ui/react-icons";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Ask anything about healthcare...",
  isLoading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full h-12 px-4 pr-12 text-sm border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-card disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          size="icon"
          className="absolute right-1.5 h-9 w-9 rounded-lg"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PaperPlaneIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
