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
      className={cn("relative w-full animate-slide-up", className)}
    >
      <div className="relative flex items-center">
        <MagnifyingGlassIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full h-14 pl-12 pr-24 text-base border-2 border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 rounded-xl px-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Searching
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PaperPlaneIcon className="h-4 w-4" />
              Search
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
