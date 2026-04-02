"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export interface SourceCardProps {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  credibilityScore?: number;
  index?: number;
}

export function SourceCard({
  title,
  url,
  snippet,
  domain,
  credibilityScore,
  index,
}: SourceCardProps) {
  const getTrustLevel = (score?: number) => {
    if (!score) return null;
    if (score >= 90) return { label: "Highly Trusted", variant: "default" as const };
    if (score >= 70) return { label: "Trusted", variant: "secondary" as const };
    return { label: "Verify", variant: "outline" as const };
  };

  const trustLevel = getTrustLevel(credibilityScore);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline group"
    >
      <div className="rounded-lg border border-border/40 bg-card p-3.5 hover:bg-secondary/30 hover:border-border/60 transition-all duration-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            {index !== undefined && (
              <span className="text-xs font-semibold text-primary mr-1.5">
                [{index + 1}]
              </span>
            )}
            <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground line-clamp-2">
              {title}
            </span>
          </div>
          <ExternalLinkIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-2">
          {snippet}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {domain}
          </span>
          {trustLevel && (
            <Badge variant={trustLevel.variant} className="text-[10px] px-2 py-0">
              {trustLevel.label}
            </Badge>
          )}
        </div>
      </div>
    </a>
  );
}
