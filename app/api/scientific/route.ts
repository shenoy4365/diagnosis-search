import { NextRequest, NextResponse } from "next/server";
import { searchScientificSources } from "./actions";

/**
 * POST endpoint for searching scientific sources
 * Searches PubMed and Semantic Scholar for academic papers
 * No API keys required - both services are free
 */
export async function POST(req: NextRequest) {
  try {
    const { query, maxPerSource = 3 } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    const sources = await searchScientificSources(query, maxPerSource);

    return NextResponse.json({
      count: sources.length,
      sources,
    });
  } catch (error) {
    console.error("Scientific search error:", error);
    return NextResponse.json(
      { error: "Failed to search scientific sources" },
      { status: 500 }
    );
  }
}
