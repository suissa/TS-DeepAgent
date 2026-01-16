import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';

export interface Config {
  [key: string]: any;
}

export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  page_info?: string;
  [key: string]: any;
}

export function extractBetween(text: string, startMarker: string, endMarker: string): string | null {
  try {
    const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `${escapedStart}(.*?)${escapedEnd}`;
    const regex = new RegExp(pattern, 's');
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  } catch (e) {
    console.error(`---Error:---\n${e}`);
    console.error('-------------------');
    return null;
  }
}

export function formatSearchResults(relevantInfo: SearchResult[]): string {
  let formattedDocuments = '';
  for (let i = 0; i < relevantInfo.length; i++) {
    const docInfo = relevantInfo[i];
    docInfo.title = docInfo.title.replace(/<b>/g, '').replace(/<\/b>/g, '');
    docInfo.snippet = docInfo.snippet.replace(/<b>/g, '').replace(/<\/b>/g, '');
    formattedDocuments += `***Web Page ${i + 1}:***\n`;
    formattedDocuments += JSON.stringify(docInfo, null, 2) + '\n';
  }
  return formattedDocuments;
}

export function loadConfig(configPath: string): Config {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(configFile) as Config;
  } catch (error) {
    console.error(`Error loading config from ${configPath}:`, error);
    throw error;
  }
}

export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function extractBetweenTags(text: string, tag: string): string | null {
  const startMarker = `<${tag}>`;
  const endMarker = `</${tag}>`;
  return extractBetween(text, startMarker, endMarker);
}
