"use server";

import { TavilyClient } from "tavily";
import { TavilySearchResponse, TavilySearchRequest } from "./schemas";

/**
 * Performs a web search using Tavily API
 * @param request Search request parameters
 * @returns Tavily search response with results
 */
export async function tavilyWebSearch(
  request: TavilySearchRequest
): Promise<TavilySearchResponse> {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  try {
    const client = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });

    const response = await client.search({
      query: request.query,
      search_depth: request.search_depth || "basic",
      max_results: request.max_results || 5,
      include_images: request.include_images || false,
      include_answer: request.include_answer || false,
      include_raw_content: request.include_raw_content || false,
      include_domains: request.include_domains || [],
      exclude_domains: request.exclude_domains || [],
    });

    return {
      query: request.query,
      results: response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: parseFloat(result.score),
        raw_content: result.raw_content,
      })),
      answer: response.answer,
      images: response.images,
      response_time: parseFloat(response.response_time),
    };
  } catch (error) {
    console.error("Tavily search error:", error);
    throw new Error("Failed to perform Tavily search");
  }
}

/**
 * Performs an image search using Tavily API
 * @param query Search query
 * @param maxResults Maximum number of images to return
 * @returns Array of image URLs
 */
export async function tavilyImageSearch(
  query: string,
  maxResults: number = 5
): Promise<string[]> {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set");
  }

  try {
    const client = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });

    const response = await client.search({
      query,
      search_depth: "basic",
      max_results: 1, // Just need images, not full results
      include_images: true,
    });

    return response.images?.slice(0, maxResults) || [];
  } catch (error) {
    console.error("Tavily image search error:", error);
    return [];
  }
}

/**
 * Performs a health-focused web search using Tavily API
 * Includes trusted medical domains and excludes unreliable sources
 * @param query Search query
 * @param maxResults Maximum number of results
 * @returns Tavily search response
 */
export async function tavilyHealthSearch(
  query: string,
  maxResults: number = 5
): Promise<TavilySearchResponse> {
  const trustedDomains = [
    "mayoclinic.org",
    "nih.gov",
    "cdc.gov",
    "who.int",
    "webmd.com",
    "healthline.com",
    "medlineplus.gov",
    "ncbi.nlm.nih.gov",
  ];

  return tavilyWebSearch({
    query,
    search_depth: "advanced",
    topic: "general",
    max_results: maxResults,
    include_answer: true,
    include_raw_content: true,
    include_domains: trustedDomains,
  });
}
