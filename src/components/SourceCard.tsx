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
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {index !== undefined && (
                <span className="text-xs font-bold text-muted-foreground mr-2">
                  [{index + 1}]
                </span>
              )}
              <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {title}
              </CardTitle>
            </div>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {snippet}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {domain}
            </span>
            {trustLevel && (
              <Badge variant={trustLevel.variant} className="text-xs">
                {trustLevel.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
