import * as fs from 'fs';
import * as path from 'path';
import JSON from 'json5';
import { ToolRetriever, ToolDoc } from './tool_search';

interface ToolHopData {
  id: string;
  functions: string[];
  tools: { [sub_question: string]: any };
  [key: string]: any;
}

function readToolhopFile(filePath: string): ToolHopData[] {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

export class ToolHopRetriever extends ToolRetriever {
  private corpus_json_path: string;

  constructor(corpus_json_path: string, model_path: string, cache_dir: string, load_cache: boolean = true) {
    console.log('Initializing ToolHopRetriever...');
    const { corpus, corpus2tool } = this.buildCorpus(corpus_json_path);
    super(corpus, corpus2tool, model_path, cache_dir, load_cache, corpus_json_path);
    this.corpus_json_path = corpus_json_path;
    console.log('ToolHopRetriever initialized.');
  }

  private buildCorpus(corpus_json_path: string): { corpus: string[]; corpus2tool: { [key: string]: ToolDoc } } {
    const data = readToolhopFile(corpus_json_path);
    const corpus: string[] = [];
    const corpus2tool: { [key: string]: ToolDoc } = {};
    console.log(`Building corpus from ${data.length} samples in ${corpus_json_path}...`);
    for (const sample of data) {
      const functions_in_sample = sample.functions || [];
      for (const [sub_question, tool_spec] of Object.entries(sample.tools || {})) {
        const original_tool_name = tool_spec.name || '';
        if (!original_tool_name) continue;
        const description = tool_spec.description || '';
        const parameters = JSON.stringify(tool_spec.parameters || {});
        const index_content = `${original_tool_name}\nDescription: ${description}\nParameters: ${parameters}`;
        if (corpus2tool[index_content]) continue;
        corpus.push(index_content);
        corpus2tool[index_content] = {
          tool_name: original_tool_name,
          openai_function: tool_spec,
          all_functions: functions_in_sample,
        };
      }
    }
    console.log(`Corpus built with ${corpus.length} unique tool entries.`);
    return { corpus, corpus2tool };
  }

  retrieving(query: string, top_k: number = 5, executable_tools: any[] | null = null): ToolDoc[] {
    console.log(`Retrieving top ${top_k} tools for query: '${query}'`);
    const candidate_docs = super.retrieving(query, top_k * 20);
    if (!executable_tools) executable_tools = [];
    const executable_tool_docs_map: { [key: string]: ToolDoc } = {};
    const executable_tool_docs_map_name: { [key: string]: ToolDoc } = {};
    for (const lt of executable_tools) {
      const name = lt.name || '';
      if (!name) continue;
      const desc = lt.description || '';
      const params = JSON.stringify(lt.parameters || {});
      const index_content = `${name}\nDescription: ${desc}\nParameters: ${params}`;
      const match_key = `${name} ${desc}`;
      if (this.corpus2tool[index_content]) {
        executable_tool_docs_map[match_key] = this.corpus2tool[index_content];
      }
      if (this.corpus2tool[index_content]) {
        executable_tool_docs_map_name[name] = this.corpus2tool[index_content];
      }
    }
    const unique_tools: ToolDoc[] = [];
    const seen_tool_names = new Set<string>();
    for (const doc of candidate_docs) {
      if (unique_tools.length >= top_k) break;
      const tool_name = doc.tool_name;
      if (!tool_name || seen_tool_names.has(tool_name)) continue;
      let tool_to_consider = doc;
      if (executable_tool_docs_map_name[tool_name]) {
        tool_to_consider = executable_tool_docs_map_name[tool_name];
      }
      unique_tools.push(tool_to_consider);
      seen_tool_names.add(tool_name);
    }
    return unique_tools;
  }
}

export class ToolHopCaller {
  functions: string[];
  scope: { [key: string]: any };

  constructor(functions: string[], scope?: { [key: string]: any }) {
    if (!Array.isArray(functions)) {
      throw new Error('`functions` must be a list of strings.');
    }
    this.functions = functions;
    this.scope = scope || this.prepareScope();
  }

  static async create(functions: string[]): Promise<ToolHopCaller> {
    const scope = await this.prepareScopeAsync(functions);
    return new ToolHopCaller(functions, scope);
  }

  private prepareScope(): { [key: string]: any } {
    const scope: { [key: string]: any } = {};
    for (const func_str of this.functions) {
      try {
        this.execSync(func_str, scope);
      } catch (e) {
        console.warn(`Warning: Could not execute function string: ${e}`);
      }
    }
    return scope;
  }

  private static async prepareScopeAsync(functions: string[]): Promise<{ [key: string]: any }> {
    const scope: { [key: string]: any } = {};
    return scope;
  }

  private execSync(func_str: string, scope: { [key: string]: any }): void {
    try {
      const func = new Function(func_str);
      func.call(scope);
    } catch (e) {
      console.warn(`Warning: Could not execute function: ${e}`);
    }
  }

  call_api(tool_call: { function: { name: string; arguments?: { [key: string]: any } } }): { response?: any; error?: string } {
    try {
      const tool_name = tool_call.function.name;
      const tool_args = tool_call.function.arguments || {};
      if (!this.scope[tool_name]) {
        return { error: `Tool '${tool_name}' not found in the current execution scope.` };
      }
      try {
        const result = this.scope[tool_name](tool_args);
        return { response: result };
      } catch (e) {
        return { error: `Error executing tool ${tool_name}: ${e}` };
      }
    } catch (e) {
      return { error: `Invalid tool call format: ${e}` };
    }
  }
}

export async function demo(): Promise<void> {
  console.log('ToolHop demo not implemented in TypeScript');
}
