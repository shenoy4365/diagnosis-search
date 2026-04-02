"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SourceCard, type SourceCardProps } from "@/components/SourceCard";
import { cn } from "@/lib/utils";

interface ResponseCardProps {
  content: string;
  sources?: SourceCardProps[];
  isStreaming?: boolean;
  className?: string;
}

export function ResponseCard({
  content,
  sources,
  isStreaming = false,
  className,
}: ResponseCardProps) {
  return (
    <div className={cn("space-y-5 animate-slide-up", className)}>
      {/* Main Response */}
      <div className="rounded-xl border border-border/40 bg-card p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-semibold text-sm">
              D
            </div>
          </div>
          <div className="flex-1">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="mb-0 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {content}
              </p>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sources.map((source, index) => (
              <SourceCard key={source.url} {...source} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3.5">
        <p className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="font-semibold">Medical Disclaimer:</strong> This information is for
          educational purposes only and should not replace professional
          medical advice. Always consult with a qualified healthcare provider
          for medical concerns.
        </p>
      </div>
    </div>
  );
}
