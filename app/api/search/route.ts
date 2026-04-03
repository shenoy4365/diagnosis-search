import { NextResponse } from "next/server";
import {
  webscrape,
  optimizeRawSearchQuery,
  detailedWebsiteSummary,
  getStreamedFinalAnswer,
} from "./actions";
import { SearchRequest, WebSource } from "./schemas";
import { braveWebSearch, braveImageSearch } from "../brave/actions";
import { searchScientificSources } from "../scientific/actions";
import { optimizeRawImageSearchQuery, describeImage } from "../image/actions";
import { ImageSource } from "../image/schemas";

/**
 * Enhanced POST endpoint for comprehensive search
 * 1. Optimizes query for web, images, and scientific search
 * 2. Searches multiple sources in parallel:
 *    - General web (Brave Search)
 *    - Scientific papers (PubMed + Semantic Scholar)
 *    - Medical images (Brave Image Search + Vision AI)
 * 3. Scrapes, summarizes, and analyzes all content
 * 4. Streams back a comprehensive synthesized answer
 */
export async function POST(req: Request) {
  // Extract search query from request body
  const { query } = (await req.json()) as SearchRequest;

  // PHASE 1: Optimize queries for different search types (parallel)
  const [webQueryResponse, imageQueryResponse] = await Promise.all([
    optimizeRawSearchQuery(query),
    optimizeRawImageSearchQuery(query),
  ]);

  if (!webQueryResponse) {
    return NextResponse.json(
      { error: "Failed to optimize query" },
      { status: 500 }
    );
  }

  // PHASE 2: Search all sources in parallel
  const [braveWebResults, scientificSources, braveImageResults] = await Promise.all([
    braveWebSearch(webQueryResponse.queries[0]),
    searchScientificSources(query, 2), // 2 results from each scientific source
    imageQueryResponse
      ? braveImageSearch(imageQueryResponse.queries[0], 3) // 3 images
      : Promise.resolve({ results: [] }),
  ]);

  // PHASE 3: Process all sources in parallel
  const [webSources, imageSources] = await Promise.all([
    // Process web results
    Promise.all(
      braveWebResults.web.results
        .slice(0, 2) // Reduced to 2 to make room for scientific sources
        .map(async (result, idx): Promise<WebSource | null> => {
          try {
            const scrapeResponse = await webscrape(result.url);
            const summaryResponse = await detailedWebsiteSummary(
              query,
              scrapeResponse || ""
            );

            return {
              url: result.url,
              title: result.title,
              favicon: result.profile.img,
              sourceNumber: idx + 1,
              summary: summaryResponse || "",
            };
          } catch (error) {
            console.error(`Error processing ${result.url}:`, error);
            return null;
          }
        })
    ),
    // Process image results
    Promise.all(
      braveImageResults.results.map(async (result, idx): Promise<ImageSource | null> => {
        try {
          const description = await describeImage(result.title, result.properties.url);

          return {
            title: result.title,
            imgUrl: result.properties.url,
            thumbnailUrl: result.thumbnail.src,
            webUrl: result.url,
            summary: description || "",
            sourceNumber: idx + 1,
          };
        } catch (error) {
          console.error(`Error processing image ${result.title}:`, error);
          return null;
        }
      })
    ),
  ]);

  // Filter out failed results
  const validWebSources = webSources.filter((r) => r !== null);
  const validImageSources = imageSources.filter((r) => r !== null);

  // Add scientific sources as web sources (they have abstracts which are summaries)
  let currentSourceNumber = validWebSources.length + 1;
  const scientificWebSources: WebSource[] = scientificSources.map((source) => ({
    url: source.url,
    title: `${source.title} (${source.journal}, ${source.year})`,
    favicon: source.type === "pubmed"
      ? "https://pubmed.ncbi.nlm.nih.gov/favicon.ico"
      : "https://www.semanticscholar.org/favicon.ico",
    sourceNumber: currentSourceNumber++,
    summary: `**Authors:** ${source.authors.slice(0, 3).join(", ")}${source.authors.length > 3 ? " et al." : ""}\n\n${source.abstract}${source.citationCount ? `\n\n*Cited by ${source.citationCount} papers*` : ""}${source.isOpenAccess && source.pdfUrl ? `\n\n[Open Access PDF](${source.pdfUrl})` : ""}`,
  }));

  const allWebSources = [...validWebSources, ...scientificWebSources];

  // Generate streaming response using all processed sources
  const stream = await getStreamedFinalAnswer({
    query,
    sources: allWebSources,
    imageSources: validImageSources,
  });

  // Set up streaming response with appropriate headers
  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        // Stream each chunk of the answer as it's generated
        for await (const chunk of stream) {
          if (chunk) controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
