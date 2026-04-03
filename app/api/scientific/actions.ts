"use server";

import {
  PubMedSearchResponse,
  PubMedSummaryResponse,
  PubMedArticle,
  SemanticScholarSearchResponse,
  ScientificSource,
} from "./schemas";

/**
 * Search PubMed for scientific articles
 * Uses NCBI E-utilities API (free, no API key required for <3 req/s)
 * @param query Search query
 * @param maxResults Maximum number of results to return (default: 5)
 * @returns Array of PubMed articles
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 5
): Promise<PubMedArticle[]> {
  try {
    // Step 1: Search for PMIDs
    const searchUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
    searchUrl.searchParams.append("db", "pubmed");
    searchUrl.searchParams.append("term", query);
    searchUrl.searchParams.append("retmax", maxResults.toString());
    searchUrl.searchParams.append("retmode", "json");
    searchUrl.searchParams.append("sort", "relevance");

    const searchResponse = await fetch(searchUrl.toString());
    const searchData: { esearchresult: PubMedSearchResponse } = await searchResponse.json();

    const pmids = searchData.esearchresult.idlist;

    if (!pmids || pmids.length === 0) {
      return [];
    }

    // Step 2: Fetch article summaries
    const summaryUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi");
    summaryUrl.searchParams.append("db", "pubmed");
    summaryUrl.searchParams.append("id", pmids.join(","));
    summaryUrl.searchParams.append("retmode", "json");

    const summaryResponse = await fetch(summaryUrl.toString());
    const summaryData: PubMedSummaryResponse = await summaryResponse.json();

    // Step 3: Fetch abstracts
    const abstractUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
    abstractUrl.searchParams.append("db", "pubmed");
    abstractUrl.searchParams.append("id", pmids.join(","));
    abstractUrl.searchParams.append("retmode", "xml");

    const abstractResponse = await fetch(abstractUrl.toString());
    const abstractXml = await abstractResponse.text();

    // Parse abstracts from XML (simple regex parsing)
    const abstracts = parseAbstractsFromXml(abstractXml, pmids);

    // Combine data into article objects
    const articles: PubMedArticle[] = pmids.map((pmid) => {
      const summary = summaryData.result[pmid];

      // Type guard to ensure we have PubMedSummaryItem
      if (Array.isArray(summary)) {
        return {
          pmid,
          title: "",
          abstract: abstracts[pmid] || "",
          authors: [],
          journal: "",
          pubDate: "",
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        };
      }

      const doi = summary.articleids?.find((id: { idtype: string; value: string }) => id.idtype === "doi")?.value;

      return {
        pmid,
        title: summary.title || "",
        abstract: abstracts[pmid] || "",
        authors: summary.authors?.map((a: { name: string }) => a.name) || [],
        journal: summary.source || "",
        pubDate: summary.pubdate || "",
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    return articles;
  } catch (error) {
    console.error("Error searching PubMed:", error);
    return [];
  }
}

/**
 * Simple XML parser to extract abstracts from PubMed efetch response
 * @param xml XML string from efetch
 * @param pmids Array of PMIDs to extract
 * @returns Object mapping PMID to abstract text
 */
function parseAbstractsFromXml(xml: string, pmids: string[]): Record<string, string> {
  const abstracts: Record<string, string> = {};

  pmids.forEach((pmid) => {
    // Find the PubmedArticle block for this PMID
    const pmidPattern = new RegExp(
      `<PMID[^>]*>${pmid}</PMID>[\\s\\S]*?<AbstractText[^>]*>([\\s\\S]*?)</AbstractText>`,
      "i"
    );
    const match = xml.match(pmidPattern);

    if (match && match[1]) {
      // Clean up HTML entities and tags
      let abstract = match[1]
        .replace(/<[^>]+>/g, "") // Remove XML tags
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&")
        .trim();

      abstracts[pmid] = abstract;
    }
  });

  return abstracts;
}

/**
 * Search Semantic Scholar for academic papers
 * Free API, no key required for reasonable rate limits
 * @param query Search query
 * @param maxResults Maximum number of results (default: 5)
 * @param fields Fields to include in response
 * @returns Semantic Scholar search response
 */
export async function searchSemanticScholar(
  query: string,
  maxResults: number = 5,
  fields: string = "paperId,title,abstract,authors,year,citationCount,venue,publicationDate,journal,externalIds,isOpenAccess,openAccessPdf,fieldsOfStudy,url"
): Promise<SemanticScholarSearchResponse | null> {
  try {
    const url = new URL("https://api.semanticscholar.org/graph/v1/paper/search");
    url.searchParams.append("query", query);
    url.searchParams.append("limit", maxResults.toString());
    url.searchParams.append("fields", fields);
    url.searchParams.append("fieldsOfStudy", "Medicine,Biology"); // Focus on medical/health papers

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Semantic Scholar API error: ${response.status}`);
      return null;
    }

    const data: SemanticScholarSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching Semantic Scholar:", error);
    return null;
  }
}

/**
 * Unified function to search scientific sources
 * Searches both PubMed and Semantic Scholar in parallel
 * @param query Search query
 * @param maxPerSource Maximum results per source (default: 3)
 * @returns Array of unified scientific sources
 */
export async function searchScientificSources(
  query: string,
  maxPerSource: number = 3
): Promise<ScientificSource[]> {
  try {
    // Search both sources in parallel
    const [pubmedResults, semanticResults] = await Promise.all([
      searchPubMed(query, maxPerSource),
      searchSemanticScholar(query, maxPerSource),
    ]);

    const sources: ScientificSource[] = [];
    let sourceNumber = 1;

    // Add PubMed results
    pubmedResults.forEach((article) => {
      sources.push({
        sourceNumber: sourceNumber++,
        type: "pubmed",
        id: article.pmid,
        title: article.title,
        abstract: article.abstract,
        authors: article.authors,
        journal: article.journal,
        year: article.pubDate,
        doi: article.doi,
        url: article.url,
      });
    });

    // Add Semantic Scholar results
    if (semanticResults?.data) {
      semanticResults.data.forEach((paper) => {
        sources.push({
          sourceNumber: sourceNumber++,
          type: "semantic_scholar",
          id: paper.paperId,
          title: paper.title,
          abstract: paper.abstract || "",
          authors: paper.authors.map((a) => a.name),
          journal: paper.journal?.name || paper.venue || "",
          year: paper.year,
          doi: paper.externalIds?.DOI,
          url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
          citationCount: paper.citationCount,
          isOpenAccess: paper.isOpenAccess,
          pdfUrl: paper.openAccessPdf?.url,
        });
      });
    }

    return sources;
  } catch (error) {
    console.error("Error searching scientific sources:", error);
    return [];
  }
}
