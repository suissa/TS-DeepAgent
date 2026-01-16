import { 
  get_openai_function_web_search, 
  get_openai_function_browse_pages,
  google_serper_search,
  google_serper_search_async,
  fetch_page_content
} from '../../src/tools/google_search';

describe('Google Search Tools', () => {
  describe('get_openai_function_web_search', () => {
    it('should return correct function definition', () => {
      const func = get_openai_function_web_search();
      expect(func.type).toBe('function');
      expect(func.function.name).toBe('web_search');
      expect(func.function.description).toContain('Search the web');
      expect(func.function.parameters.properties.query.type).toBe('string');
      expect(func.function.parameters.required).toContain('query');
    });
  });

  describe('get_openai_function_browse_pages', () => {
    it('should return correct function definition', () => {
      const func = get_openai_function_browse_pages();
      expect(func.type).toBe('function');
      expect(func.function.name).toBe('browse_pages');
      expect(func.function.description).toContain('Browse web pages');
      expect(func.function.parameters.properties.urls.type).toBe('array');
      expect(func.function.parameters.required).toContain('urls');
    });
  });

  describe('google_serper_search', () => {
    it('should return search results', async () => {
      const results = google_serper_search('test query', 'fake-api-key');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('url');
      expect(results[0]).toHaveProperty('snippet');
    });
  });

  describe('google_serper_search_async', () => {
    it('should return async search results', async () => {
      const results = await google_serper_search_async('test query', 'fake-api-key');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('fetch_page_content', () => {
    it('should return content for URLs', async () => {
      const results = fetch_page_content(['https://example.com']);
      expect(Object.keys(results)).toHaveLength(1);
      expect(results['https://example.com']).toBeDefined();
    });

    it('should handle empty URLs array', () => {
      const results = fetch_page_content([]);
      expect(Object.keys(results)).toHaveLength(0);
    });
  });
});
