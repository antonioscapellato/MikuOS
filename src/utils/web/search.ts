// Tavily
import { tavily } from '@tavily/core';

// Initialize the Tavily client
const client = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyImage {
  url: string;
  [key: string]: any;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  [key: string]: any;
}

export interface SearchResponse {
  results: SearchResult[];
  images: TavilyImage[];
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
}

/**
 * Perform a search using Tavily API
 * @param options Search options including query and maxResults
 * @returns Promise with search results
 */
export async function performSearch({ query, maxResults = 10, includeDomains = [], excludeDomains = [] }: SearchOptions): Promise<SearchResponse> {
  try {

    console.log("\n[PERFORMING SEARCH]\n", query, maxResults, includeDomains, excludeDomains);

    const response = await client.search(query, {
      search_depth: "advanced",
      max_results: maxResults,
      include_images: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains
    });

    // Make sure images is properly typed as TavilyImage[] or default to empty array
    const images = Array.isArray(response.images) 
      ? response.images.map((image: any) => ({ url: image.url, ...image }))
      : [];
      
    //console.log("\n[SEARCH RESPONSE]\n", response);
    //console.log("\n[END SEARCH RESPONSE]\n");

    return {
      results: response.results.map((result: TavilyResult) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score
      })),
      images
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to perform search');
  }
}