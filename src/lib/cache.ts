import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Cache utility functions for Supabase
 */

/**
 * Generate a hash for cache key
 */
export function generateCacheHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Get Supabase client for caching operations
 * Uses service role key for bypassing RLS
 */
function getCacheClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration missing for cache operations");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Query cache interface
 */
export interface QueryCacheData {
  response_data: any;
  sources: any[];
  image_sources: any[];
}

/**
 * Get cached query result
 */
export async function getQueryCache(
  query: string
): Promise<QueryCacheData | null> {
  try {
    const queryHash = generateCacheHash(query.toLowerCase().trim());
    const supabase = getCacheClient();

    const { data, error } = await supabase.rpc("get_query_cache", {
      p_query_hash: queryHash,
    });

    if (error) {
      console.error("Cache fetch error:", error);
      return null;
    }

    if (!data || data.length === 0) {
      // Track cache miss
      await trackCacheAnalytics("query", "miss", queryHash);
      return null;
    }

    // Track cache hit
    await trackCacheAnalytics("query", "hit", queryHash);

    return data[0];
  } catch (error) {
    console.error("Cache error:", error);
    return null;
  }
}

/**
 * Set query cache
 */
export async function setQueryCache(
  query: string,
  responseData: any,
  sources: any[],
  imageSources: any[],
  ttlMinutes: number = 60
): Promise<boolean> {
  try {
    const queryHash = generateCacheHash(query.toLowerCase().trim());
    const supabase = getCacheClient();

    const { error } = await supabase.rpc("set_query_cache", {
      p_query_hash: queryHash,
      p_query_text: query,
      p_response_data: responseData,
      p_sources: sources,
      p_image_sources: imageSources,
      p_ttl_minutes: ttlMinutes,
    });

    if (error) {
      console.error("Cache set error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Cache error:", error);
    return false;
  }
}

/**
 * Source cache interface
 */
export interface SourceCacheData {
  title: string;
  content: string;
  markdown: string;
  summary: string;
}

/**
 * Get cached source content
 */
export async function getSourceCache(url: string): Promise<SourceCacheData | null> {
  try {
    const urlHash = generateCacheHash(url);
    const supabase = getCacheClient();

    const { data, error } = await supabase.rpc("get_source_cache", {
      p_url_hash: urlHash,
    });

    if (error) {
      console.error("Source cache fetch error:", error);
      return null;
    }

    if (!data || data.length === 0) {
      await trackCacheAnalytics("source", "miss", urlHash);
      return null;
    }

    await trackCacheAnalytics("source", "hit", urlHash);

    return data[0];
  } catch (error) {
    console.error("Source cache error:", error);
    return null;
  }
}

/**
 * Set source cache
 */
export async function setSourceCache(
  url: string,
  title: string,
  content: string,
  markdown: string,
  summary: string,
  ttlMinutes: number = 1440 // 24 hours default
): Promise<boolean> {
  try {
    const urlHash = generateCacheHash(url);
    const supabase = getCacheClient();

    const { error } = await supabase.from("source_cache").upsert(
      {
        url,
        url_hash: urlHash,
        title,
        content,
        markdown,
        summary,
        expires_at: new Date(Date.now() + ttlMinutes * 60000).toISOString(),
      },
      {
        onConflict: "url_hash",
      }
    );

    if (error) {
      console.error("Source cache set error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Source cache error:", error);
    return false;
  }
}

/**
 * Track cache analytics
 */
async function trackCacheAnalytics(
  cacheType: "query" | "source",
  action: "hit" | "miss" | "invalidate",
  identifier: string
): Promise<void> {
  try {
    const supabase = getCacheClient();

    await supabase.from("cache_analytics").insert({
      cache_type: cacheType,
      action,
      identifier,
    });
  } catch (error) {
    // Don't throw - analytics failures shouldn't break the app
    console.error("Analytics tracking error:", error);
  }
}

/**
 * Invalidate query cache by query text
 */
export async function invalidateQueryCache(query: string): Promise<boolean> {
  try {
    const queryHash = generateCacheHash(query.toLowerCase().trim());
    const supabase = getCacheClient();

    const { error } = await supabase
      .from("query_cache")
      .delete()
      .eq("query_hash", queryHash);

    if (!error) {
      await trackCacheAnalytics("query", "invalidate", queryHash);
    }

    return !error;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return false;
  }
}

/**
 * Invalidate source cache by URL
 */
export async function invalidateSourceCache(url: string): Promise<boolean> {
  try {
    const urlHash = generateCacheHash(url);
    const supabase = getCacheClient();

    const { error } = await supabase
      .from("source_cache")
      .delete()
      .eq("url_hash", urlHash);

    if (!error) {
      await trackCacheAnalytics("source", "invalidate", urlHash);
    }

    return !error;
  } catch (error) {
    console.error("Source cache invalidation error:", error);
    return false;
  }
}

/**
 * Clean up expired cache entries
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredCache(): Promise<boolean> {
  try {
    const supabase = getCacheClient();

    const { error } = await supabase.rpc("cleanup_expired_cache");

    if (error) {
      console.error("Cache cleanup error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Cache cleanup error:", error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(
  hours: number = 24
): Promise<{
  queryHits: number;
  queryMisses: number;
  sourceHits: number;
  sourceMisses: number;
  hitRate: number;
}> {
  try {
    const supabase = getCacheClient();
    const since = new Date(Date.now() - hours * 3600000).toISOString();

    const { data, error } = await supabase
      .from("cache_analytics")
      .select("cache_type, action")
      .gte("created_at", since);

    if (error || !data) {
      throw error;
    }

    const stats = {
      queryHits: 0,
      queryMisses: 0,
      sourceHits: 0,
      sourceMisses: 0,
      hitRate: 0,
    };

    data.forEach((row) => {
      if (row.cache_type === "query" && row.action === "hit") stats.queryHits++;
      if (row.cache_type === "query" && row.action === "miss") stats.queryMisses++;
      if (row.cache_type === "source" && row.action === "hit") stats.sourceHits++;
      if (row.cache_type === "source" && row.action === "miss") stats.sourceMisses++;
    });

    const totalHits = stats.queryHits + stats.sourceHits;
    const totalMisses = stats.queryMisses + stats.sourceMisses;
    const total = totalHits + totalMisses;

    stats.hitRate = total > 0 ? (totalHits / total) * 100 : 0;

    return stats;
  } catch (error) {
    console.error("Stats error:", error);
    return {
      queryHits: 0,
      queryMisses: 0,
      sourceHits: 0,
      sourceMisses: 0,
      hitRate: 0,
    };
  }
}
