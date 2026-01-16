import { extractBetween, formatSearchResults, loadConfig, ensureDirectory, extractBetweenTags } from '../../src/utils/utils';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';

describe('Utils', () => {
  describe('extractBetween', () => {
    it('should extract text between markers', () => {
      const result = extractBetween('Hello <start>World</start>!', '<start>', '</start>');
      expect(result).toBe('World');
    });

    it('should return null when start marker not found', () => {
      const result = extractBetween('Hello World!</start>', '<start>', '</start>');
      expect(result).toBeNull();
    });

    it('should return null when end marker not found', () => {
      const result = extractBetween('Hello <start>World!', '<start>', '</start>');
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = extractBetween('', '<start>', '</start>');
      expect(result).toBeNull();
    });

    it('should handle multiline text', () => {
      const text = 'Start\n<start>\nLine 1\nLine 2\n</start>\nEnd';
      const result = extractBetween(text, '<start>', '</start>');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });

    it('should trim extracted result', () => {
      const result = extractBetween('<start>  spaced  </start>', '<start>', '</start>');
      expect(result).toBe('spaced');
    });
  });

  describe('formatSearchResults', () => {
    it('should format search results correctly', () => {
      const results = [
        {
          title: 'Test Page',
          snippet: 'This is a test',
          url: 'https://example.com'
        }
      ];
      const formatted = formatSearchResults(results);
      expect(formatted).toContain('***Web Page 1:***');
      expect(formatted).toContain('Test Page');
      expect(formatted).toContain('https://example.com');
    });

    it('should remove bold tags from title and snippet', () => {
      const results = [
        {
          title: '<b>Bold Title</b>',
          snippet: '<b>Bold Snippet</b>',
          url: 'https://example.com'
        }
      ];
      const formatted = formatSearchResults(results);
      expect(formatted).not.toContain('<b>');
      expect(formatted).not.toContain('</b>');
    });

    it('should handle multiple results', () => {
      const results = [
        { title: 'Page 1', snippet: 'Snippet 1', url: 'https://a.com' },
        { title: 'Page 2', snippet: 'Snippet 2', url: 'https://b.com' },
        { title: 'Page 3', snippet: 'Snippet 3', url: 'https://c.com' }
      ];
      const formatted = formatSearchResults(results);
      expect(formatted).toContain('***Web Page 1:***');
      expect(formatted).toContain('***Web Page 2:***');
      expect(formatted).toContain('***Web Page 3:***');
    });

    it('should handle empty array', () => {
      const formatted = formatSearchResults([]);
      expect(formatted).toBe('');
    });
  });

  describe('extractBetweenTags', () => {
    it('should extract text between HTML-like tags', () => {
      const result = extractBetweenTags('<div>Content</div>', 'div');
      expect(result).toBe('Content');
    });

    it('should return null for missing tags', () => {
      const result = extractBetweenTags('<div>Content</span>', 'div');
      expect(result).toBeNull();
    });
  });

  describe('loadConfig', () => {
    const testConfigPath = path.join(__dirname, 'test-config.yaml');
    const testConfig = { key: 'value', nested: { deep: 'value' } };

    beforeAll(() => {
      fs.writeFileSync(testConfigPath, yaml.stringify(testConfig));
    });

    afterAll(() => {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
    });

    it('should load and parse YAML config', () => {
      const config = loadConfig(testConfigPath);
      expect(config.key).toBe('value');
      expect(config.nested.deep).toBe('value');
    });

    it('should throw error for non-existent file', () => {
      expect(() => loadConfig('/non/existent/path.yaml')).toThrow();
    });
  });

  describe('ensureDirectory', () => {
    const testDir = path.join(__dirname, 'test-dir-' + Date.now());

    afterAll(() => {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }
    });

    it('should create directory if it does not exist', () => {
      expect(fs.existsSync(testDir)).toBe(false);
      ensureDirectory(testDir);
      expect(fs.existsSync(testDir)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      expect(() => ensureDirectory(testDir)).not.toThrow();
    });
  });
});
