"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  credibilityScore?: number;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp?: Date;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  sources,
  timestamp,
  isStreaming = false,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-4 animate-slide-up",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
            AI
          </div>
        </div>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[80%]")}>
        <Card
          className={cn(
            "p-4",
            role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50"
          )}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="mb-0 whitespace-pre-wrap">{content}</p>
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        </Card>

        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Sources:</span>
            {sources.map((source, index) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  <span className="mr-1">[{index + 1}]</span>
                  {source.domain}
                </Badge>
              </a>
            ))}
          </div>
        )}

        {timestamp && (
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {role === "user" && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
            JS
          </div>
        </div>
      )}
    </div>
  );
}
