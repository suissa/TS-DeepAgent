import axios from 'axios';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface GoogleSearchOptions {
  api_key?: string;
  serper_api_key?: string;
}

export async function google_serper_search_async(query: string, api_key: string): Promise<SearchResult[]> {
  console.log(`Searching for: ${query}`);
  return [
    { title: 'Example Result', url: 'https://example.com', snippet: 'This is an example search result' }
  ];
}

export function google_serper_search(query: string, api_key: string): SearchResult[] {
  console.log(`Searching for: ${query}`);
  return [
    { title: 'Example Result', url: 'https://example.com', snippet: 'This is an example search result' }
  ];
}

export async function fetch_page_content_async(urls: string[], use_jina: boolean = false, jina_api_key?: string, snippets: { [url: string]: string } = {}): Promise<{ [url: string]: string }> {
  const results: { [url: string]: string } = {};
  for (const url of urls) {
    try {
      const response = await axios.get(url);
      results[url] = response.data.substring(0, 10000);
    } catch {
      results[url] = `Failed to fetch ${url}`;
    }
  }
  return results;
}

export function fetch_page_content(urls: string[], use_jina: boolean = false, jina_api_key?: string | null, snippets: { [url: string]: string } = {}): { [url: string]: [string, string] } {
  const results: { [url: string]: [string, string] } = {};
  for (const url of urls) {
    results[url] = [`Content from ${url}`, `Full content from ${url}`];
  }
  return results;
}

export function extract_snippet_with_context(_full_text: string, _snippet: string): [boolean, string] {
  return [true, 'Context'];
}

export function get_openai_function_web_search(): any {
  return {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information using Google',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  };
}

export function get_openai_function_browse_pages(): any {
  return {
    type: 'function',
    function: {
      name: 'browse_pages',
      description: 'Browse web pages and extract their content',
      parameters: {
        type: 'object',
        properties: {
          urls: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of URLs to browse',
          },
        },
        required: ['urls'],
      },
    },
  };
}
