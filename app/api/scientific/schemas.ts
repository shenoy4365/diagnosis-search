// PubMed API Response Types
export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  url: string;
}

export interface PubMedSearchResponse {
  count: number;
  retmax: number;
  retstart: number;
  idlist: string[];
}

export interface PubMedSummaryResponse {
  result: {
    uids: string[];
    [pmid: string]: PubMedSummaryItem | string[];
  };
}

export interface PubMedSummaryItem {
  uid: string;
  pubdate: string;
  epubdate: string;
  source: string;
  authors: Array<{ name: string; authtype: string }>;
  lastauthor: string;
  title: string;
  sorttitle: string;
  volume: string;
  issue: string;
  pages: string;
  lang: string[];
  nlmuniqueid: string;
  issn: string;
  essn: string;
  pubtype: string[];
  recordstatus: string;
  pubstatus: string;
  articleids: Array<{ idtype: string; value: string }>;
  doi?: string;
}

// Semantic Scholar API Response Types
export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: Array<{
    authorId: string;
    name: string;
  }>;
  year: number;
  citationCount: number;
  referenceCount: number;
  venue: string;
  publicationVenue: {
    name: string;
    type: string;
  } | null;
  url: string;
  isOpenAccess: boolean;
  openAccessPdf: {
    url: string;
    status: string;
  } | null;
  fieldsOfStudy: string[];
  publicationDate: string;
  journal: {
    name: string;
    volume: string;
    pages: string;
  } | null;
  externalIds: {
    DOI?: string;
    PubMed?: string;
    ArXiv?: string;
  };
}

export interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  next: number;
  data: SemanticScholarPaper[];
}

// Unified Scientific Source
export interface ScientificSource {
  sourceNumber: number;
  type: "pubmed" | "semantic_scholar";
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  year: string | number;
  doi?: string;
  url: string;
  citationCount?: number;
  summary?: string;
  isOpenAccess?: boolean;
  pdfUrl?: string;
}
