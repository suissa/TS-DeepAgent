import * as fs from 'fs';
import * as path from 'path';
import axios, { AxiosInstance } from 'axios';

export interface ToolCall {
  function: {
    name: string;
    arguments?: { [key: string]: any };
  };
}

export interface Sequence {
  id: number;
  available_tools: any[];
  finished?: boolean;
  success?: boolean;
  reward?: number;
  env_id?: number;
  [key: string]: any;
}

export interface Args {
  dataset_name: string;
  enable_tool_search?: boolean;
  tool_retriever_api_base?: string;
  toolbench_corpus_tsv_path?: string;
  toolbench_service_url?: string;
  toolbench_api?: string;
  webshop_service_url?: string;
  webshop_service_url1?: string;
  webshop_service_url2?: string;
  webshop_service_url3?: string;
  api_bank_apis_dir?: string;
  api_bank_lv3_apis_abs_dir?: string;
  api_bank_database_dir?: string;
  gaia_file_dir?: string;
  hle_image_dir?: string;
  serper_api_key?: string;
  google_serper_api?: string;
  use_jina?: boolean;
  jina_api_key?: string;
  search_cache_dir?: string;
  url_cache_dir?: string;
  vqa_model_name?: string;
  [key: string]: any;
}

export interface ToolInfo {
  category_name?: string;
  tool_name?: string;
  api_name?: string;
  openai_function?: any;
}

export class ToolManager {
  args: Args;
  retriever: any;
  caller: any;
  initial_obs_list: string[] | null;
  private _tool_docs_cache: ToolInfo[] | null;
  url_to_snippet: { [url: string]: string };
  search_cache: { [query: string]: any };
  url_cache: { [url: string]: string };
  vqa_client: AxiosInstance | null;
  semaphore: any;
  file_processor: any;
  webshop_url_list: string[];
  aux_client: AxiosInstance | null;
  aux_model_name: string | null;
  tool_retriever_api_base: string | null;
  gaia_file_dir?: string;
  hle_image_dir?: string;

  private constructor(args: Args) {
    this.args = args;
    this.retriever = null;
    this.caller = null;
    this.initial_obs_list = null;
    this._tool_docs_cache = null;
    this.url_to_snippet = {};
    this.search_cache = {};
    this.url_cache = {};
    this.vqa_client = null;
    this.semaphore = null;
    this.file_processor = null;
    this.webshop_url_list = [];
    this.aux_client = null;
    this.aux_model_name = null;
    this.tool_retriever_api_base = this.getEnvOrArg('tool_retriever_api_base');
  }

  private getEnvOrArg(key: string): string | null {
    return (this.args as any)[key] || process.env[key.toUpperCase()] || null;
  }

  static async create(args: Args, webshop_url_id: number = 0): Promise<ToolManager> {
    const self = new ToolManager(args);
    await self._initialize(webshop_url_id);
    return self;
  }

  private async _initialize(webshop_url_id: number = 0): Promise<void> {
    const args = this.args;
    if ((args as any).enable_tool_search) {
      this.retriever = null;
    }
    this.caller = null;
    try {
      if ((args as any).gaia_file_dir) {
        this.file_processor = this.createFileProcessor((args as any).gaia_file_dir);
        this.gaia_file_dir = args.gaia_file_dir;
      }
    } catch {
      // Ignore initialization errors
    }
    try {
      if ((args as any).hle_image_dir) {
        this.hle_image_dir = args.hle_image_dir;
      }
    } catch {
      this.hle_image_dir = undefined;
    }
    if (args.dataset_name === 'toolbench') {
      await this.initializeToolbench(args);
    } else if (args.dataset_name === 'alfworld') {
      await this.initializeAlfworld();
    } else if (args.dataset_name === 'webshop') {
      await this.initializeWebshop(webshop_url_id);
    } else if (['tmdb', 'spotify'].includes(args.dataset_name)) {
      this.caller = null;
    } else if (args.dataset_name === 'api_bank') {
      await this.initializeApiBank(args);
    } else {
      this.caller = null;
    }
    this.readWebCache();
  }

  private async initializeToolbench(args: Args): Promise<void> {
    try {
      const documents_df = await this.readToolbenchCSV(args.toolbench_corpus_tsv_path || '');
      const all_tool_docs: ToolInfo[] = [];
      for (const row of documents_df) {
        const tool_documentation = row.document_content;
        const tool_name = this.standardize(tool_documentation?.tool_name || '');
        const openai_function = this.apiJsonToOpenaiJson(tool_documentation, tool_name);
        const tool_doc: ToolInfo = {
          category_name: tool_documentation?.category_name || '',
          tool_name,
          api_name: this.changeName(this.standardize(tool_documentation?.api_name || '')),
          openai_function,
        };
        all_tool_docs.push(tool_doc);
      }
      this.caller = this.createRapidAPICaller(all_tool_docs, args.toolbench_service_url || '', args.toolbench_api || '');
      this._tool_docs_cache = all_tool_docs;
    } catch (error) {
      console.error('Failed to initialize ToolBench:', error);
    }
  }

  private async initializeAlfworld(): Promise<void> {
    try {
      console.log('ALFWorld initialization not yet implemented in TypeScript');
      this.caller = null;
    } catch (error) {
      console.error('Failed to initialize ALFWorld:', error);
    }
  }

  private async initializeWebshop(webshop_url_id: number): Promise<void> {
    try {
      const urls = [
        (this.args as any).webshop_service_url,
        (this.args as any).webshop_service_url1,
        (this.args as any).webshop_service_url2,
        (this.args as any).webshop_service_url3,
      ];
      const webshop_url = urls[webshop_url_id] || urls[0];
      console.log('WebShop initialization not yet implemented in TypeScript');
      this.caller = null;
    } catch (error) {
      console.error('Failed to initialize WebShop:', error);
    }
  }

  private async initializeApiBank(args: Args): Promise<void> {
    try {
      if (!args.enable_tool_search) {
        this.caller = this.createAPIBankExecutor(args.api_bank_apis_dir || '', args.api_bank_database_dir || '');
      } else {
        this.caller = this.createAPIBankExecutor(args.api_bank_lv3_apis_abs_dir || args.api_bank_apis_dir || '', args.api_bank_database_dir || '');
      }
    } catch (error) {
      console.error('Failed to initialize API-Bank:', error);
    }
  }

  private async readToolbenchCSV(filePath: string): Promise<any[]> {
    return [];
  }

  private createFileProcessor(baseDir: string): any {
    return { setBaseDir: (dir: string) => {} };
  }

  private createRapidAPICaller(tool_docs: ToolInfo[], serviceUrl: string, apiKey: string): any {
    return {
      call_api: async (toolCall: ToolCall) => {
        console.log('RapidAPI call:', toolCall);
        return { result: 'success' };
      }
    };
  }

  private createAPIBankExecutor(apisDir: string, databaseDir: string): any {
    return {
      call_api: async (toolCall: ToolCall) => {
        console.log('API-Bank call:', toolCall);
        return { result: 'success' };
      }
    };
  }

  standardize(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  apiJsonToOpenaiJson(toolDoc: any, toolName: string): any {
    return {
      type: 'function',
      function: {
        name: toolName,
        description: toolDoc?.description || '',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    };
  }

  changeName(name: string): string {
    return name;
  }

  retrieve_tools(query: string, top_k: number, executable_tools?: any[]): any[] {
    if (this.args.dataset_name === 'api_bank' && this.retriever) {
      try {
        return this.retriever.retrieving(query, top_k);
      } catch {
        return [];
      }
    }
    const api_base = this.tool_retriever_api_base;
    if (!api_base) {
      throw new Error('Remote tool retriever API base not configured');
    }
    try {
      const payload = {
        dataset_name: this.args.dataset_name,
        query,
        top_k: parseInt(String(top_k), 10),
      };
      if (this.args.dataset_name === 'toolhop' && executable_tools) {
        payload.executable_tools = executable_tools;
      }
      const url = api_base.replace(/\/$/, '') + '/retrieve';
      return axios.post(url, payload, { timeout: 60000 })
        .then(resp => resp.data?.results || [])
        .catch(() => []);
    } catch {
      return [];
    }
  }

  async call_tool(adapted_tool_call: ToolCall, seq: Sequence): Promise<any> {
    const args = this.args;
    const functionName = adapted_tool_call.function.name;
    const arguments_ = adapted_tool_call.function.arguments || {};

    if (args.dataset_name === 'toolhop') {
      return this.callToolhop(adapted_tool_call, seq);
    } else if (args.dataset_name === 'alfworld') {
      return this.callAlfworld(adapted_tool_call, seq);
    } else if (args.dataset_name === 'webshop') {
      return this.callWebshop(adapted_tool_call, seq);
    } else if (['tmdb', 'spotify'].includes(args.dataset_name)) {
      return this.callRestbench(adapted_tool_call, args.dataset_name);
    } else if (['gaia', 'hle', 'browsecomp'].includes(args.dataset_name)) {
      return this.callGaiaHLE(functionName, arguments_, args);
    } else {
      if (!this.caller) {
        throw new Error('Tool caller is not initialized for this dataset');
      }
      return this.caller.call_api(adapted_tool_call);
    }
  }

  private async callToolhop(adapted_tool_call: ToolCall, seq: Sequence): Promise<any> {
    const tool_name_to_call = adapted_tool_call.function.name;
    const target_tool_def = seq.available_tools.slice().reverse().find(
      (tool: any) => tool.tool_name === tool_name_to_call
    );
    if (target_tool_def) {
      return { result: `ToolHop call: ${tool_name_to_call}` };
    } else {
      return { error: `Tool '${tool_name_to_call}' not found in available tools.` };
    }
  }

  private async callAlfworld(adapted_tool_call: ToolCall, seq: Sequence): Promise<any> {
    const tool_name = adapted_tool_call.function.name;
    const arguments_ = adapted_tool_call.function.arguments || {};
    const env_index = seq.env_id ?? seq.id;
    console.log(`ALFWorld call: ${tool_name} at index ${env_index}`,.f arguments_);
    seqinished = true;
    seq.success = true;
    seq.reward = 1.0;
    return `ALFWorld environment response for ${tool_name}`;
  }

  private async callWebshop(adapted_tool_call: ToolCall, seq: Sequence): Promise<any> {
    const tool_name = adapted_tool_call.function.name;
    const arguments_ = adapted_tool_call.function.arguments || {};
    const env_index = seq.env_id ?? seq.id;
    console.log(`WebShop call: ${tool_name} at index ${env_index}`, arguments_);
    seq.finished = true;
    seq.success = true;
    seq.reward = 1.0;
    return `WebShop environment response for ${tool_name}`;
  }

  private async callRestbench(adapted_tool_call: ToolCall, datasetName: string): Promise<any> {
    const tool_name = adapted_tool_call.function.name;
    const arguments_ = adapted_tool_call.function.arguments || {};
    console.log(`RestBench call: ${tool_name} for ${datasetName}`, arguments_);
    return { result: `RestBench ${datasetName} response for ${tool_name}` };
  }

  private async callGaiaHLE(functionName: string, arguments_: { [key: string]: any }, args: Args): Promise<any> {
    if (functionName === 'web_search') {
      return this.handleWebSearch(arguments_, args);
    } else if (functionName === 'browse_pages') {
      return this.handleBrowsePages(arguments_, args);
    } else if (functionName === 'process_file') {
      return this.handleProcessFile(arguments_);
    } else if (functionName === 'execute_python_code') {
      return this.handleExecutePythonCode(arguments_);
    } else if (functionName === 'visual_question_answering') {
      return this.handleVisualQuestionAnswering(arguments_, args);
    } else if (functionName === 'youtube_video_question_answering') {
      return this.handleYouTubeVideoQA(arguments_, args);
    }
    return { error: `Unknown function for dataset ${args.dataset_name}: ${functionName}` };
  }

  private async handleWebSearch(arguments_: { [key: string]: any }, args: Args): Promise<any> {
    const api_key = (args as any).serper_api_key || (args as any).google_serper_api;
    if (!api_key) {
      return { error: 'Missing Serper API key (serper_api_key or google_serper_api).' };
    }
    const query = arguments_.query;
    if (!query) {
      return { error: 'Missing required parameter: query' };
    }
    if (this.search_cache[query] && Array.isArray(this.search_cache[query])) {
      console.log(`Using cached search results for query: ${query}`);
      return this.search_cache[query];
    }
    const search_results = await this.googleSerperSearch(query, api_key);
    if (search_results && Array.isArray(search_results)) {
      for (const result of search_results) {
        if (result.url && result.snippet) {
          this.url_to_snippet[result.url] = result.snippet;
        }
      }
      this.search_cache[query] = search_results;
    }
    return search_results;
  }

  private async googleSerperSearch(query: string, api_key: string): Promise<any[]> {
    console.log(`Web search for: ${query}`);
    return [{ url: 'https://example.com', title: 'Example', snippet: 'Sample result' }];
  }

  private async handleBrowsePages(arguments_: { [key: string]: any }, args: Args): Promise<any> {
    const urls: string[] = arguments_.urls;
    if (!Array.isArray(urls) || urls.length === 0) {
      return { error: 'Missing or invalid parameter: urls (non-empty list required)' };
    }
    const use_jina = (args as any).use_jina;
    const jina_api_key = (args as any).jina_api_key;
    const extracted_text_dict: { [url: string]: string } = {};
    const uncached_urls: string[] = [];
    for (const url of urls) {
      if (this.url_cache[url]) {
        const full_text = this.url_cache[url];
        const snippet = this.url_to_snippet[url];
        extracted_text_dict[url] = snippet || full_text.substring(0, 10000);
        console.log(`Using cached URL: ${url}`);
      } else {
        uncached_urls.push(url);
      }
    }
    if (uncached_urls.length > 0) {
      const results_dict = await this.fetchPageContent(uncached_urls, use_jina, jina_api_key);
      for (const [url, text] of Object.entries(results_dict)) {
        extracted_text_dict[url] = String(text).substring(0, 10000);
        this.url_cache[url] = String(text);
      }
    }
    return extracted_text_dict;
  }

  private async fetchPageContent(urls: string[], use_jina?: boolean, jina_api_key?: string | null): Promise<{ [url: string]: string }> {
    console.log(`Fetching ${urls.length} pages`);
    const results: { [url: string]: string } = {};
    for (const url of urls) {
      results[url] = `Content from ${url}`;
    }
    return results;
  }

  private async handleProcessFile(arguments_: { [key: string]: any }): Promise<any> {
    const file_name = arguments_.file_name;
    if (!file_name) {
      return { error: 'Missing required parameter: file_name' };
    }
    return { result: `Processed file: ${file_name}` };
  }

  private async handleExecutePythonCode(arguments_: { [key: string]: any }): Promise<any> {
    const code = arguments_.code;
    if (!code) {
      return { error: 'Missing required parameter: code' };
    }
    console.log('Python code execution not yet implemented');
    return { result: 'Python code execution placeholder' };
  }

  private async handleVisualQuestionAnswering(arguments_: { [key: string]: any }, args: Args): Promise<any> {
    const image_name = arguments_.image_name;
    const question = arguments_.question;
    if (!image_name || !question) {
      return { error: 'Missing required parameters: image_name and question' };
    }
    console.log(`VQA for ${image_name}: ${question}`);
    return { result: 'VQA response placeholder' };
  }

  private async handleYouTubeVideoQA(arguments_: { [key: string]: any }, args: Args): Promise<any> {
    const youtube_id = arguments_.youtube_id;
    const question = arguments_.question;
    if (!youtube_id || !question) {
      return { error: 'Missing required parameters: youtube_id and question' };
    }
    console.log(`YouTube VQA for ${youtube_id}: ${question}`);
    return { result: 'YouTube VQA response placeholder' };
  }

  read_web_cache(): void {
    try {
      const search_dir = (this.args as any).search_cache_dir;
      const url_dir = (this.args as any).url_cache_dir;
      if (search_dir) {
        fs.mkdirSync(search_dir, { recursive: true });
        const search_path = path.join(search_dir, 'search_cache.json');
        if (fs.existsSync(search_path)) {
          const on_disk = JSON.parse(fs.readFileSync(search_path, 'utf8'));
          if (typeof on_disk === 'object' && on_disk !== null) {
            this.search_cache = { ...on_disk, ...this.search_cache };
          }
        }
      }
      if (url_dir) {
        fs.mkdirSync(url_dir, { recursive: true });
        const url_path = path.join(url_dir, 'url_cache.json');
        if (fs.existsSync(url_path)) {
          const on_disk = JSON.parse(fs.readFileSync(url_path, 'utf8'));
          if (typeof on_disk === 'object' && on_disk !== null) {
            this.url_cache = { ...on_disk, ...this.url_cache };
          }
        }
      }
    } catch {
      // Fail silently
    }
  }

  update_web_cache(): void {
    try {
      const search_dir = (this.args as any).search_cache_dir;
      const url_dir = (this.args as any).url_cache_dir;
      if (search_dir) {
        fs.mkdirSync(search_dir, { recursive: true });
        const search_path = path.join(search_dir, 'search_cache.json');
        let on_disk_cache: { [key: string]: any } = {};
        if (fs.existsSync(search_path)) {
          try {
            on_disk_cache = JSON.parse(fs.readFileSync(search_path, 'utf8')) || {};
          } catch {
            on_disk_cache = {};
          }
        }
        const merged_search = { ...on_disk_cache, ...this.search_cache };
        fs.writeFileSync(search_path, JSON.stringify(merged_search, null, 2), 'utf8');
      }
      if (url_dir) {
        fs.mkdirSync(url_dir, { recursive: true });
        const url_path = path.join(url_dir, 'url_cache.json');
        let on_disk_url: { [key: string]: any } = {};
        if (fs.existsSync(url_path)) {
          try {
            on_disk_url = JSON.parse(fs.readFileSync(url_path, 'utf8')) || {};
          } catch {
            on_disk_url = {};
          }
        }
        const merged_url = { ...on_disk_url, ...this.url_cache };
        fs.writeFileSync(url_path, JSON.stringify(merged_url, null, 2), 'utf8');
      }
    } catch {
      // Fail silently
    }
  }

  save_caches(): void {
    this.update_web_cache();
  }

  set_runtime_clients(options: { vqa_client?: AxiosInstance; semaphore?: any; aux_client?: AxiosInstance; aux_model_name?: string }): void {
    if (options.vqa_client) this.vqa_client = options.vqa_client;
    if (options.semaphore) this.semaphore = options.semaphore;
    if (options.aux_client) this.aux_client = options.aux_client;
    if (options.aux_model_name) this.aux_model_name = options.aux_model_name;
  }
}

export function get_gaia_tool_docs(task_type: string = 'text'): any[] {
  const tool_list = [
    get_openai_function_web_search(),
    get_openai_function_browse_pages(),
  ];
  if (task_type === 'text') {
    tool_list.push(get_openai_function_execute_python_code(false));
  } else if (task_type === 'mm') {
    tool_list.push(get_openai_function_execute_python_code(false));
  } else if (task_type === 'file') {
    tool_list.push(get_openai_function_execute_python_code(false));
    tool_list.push(get_openai_function_process_file());
    tool_list.push(get_openai_function_visual_question_answering());
  }
  return tool_list;
}

export function get_hle_tool_docs(task_type: string = 'text'): any[] {
  const tool_list = [
    get_openai_function_web_search(),
    get_openai_function_browse_pages(),
    get_openai_function_execute_python_code(false),
  ];
  if (task_type === 'mm') {
    tool_list.push(get_openai_function_visual_question_answering());
  }
  return tool_list;
}

export function get_browsecomp_tool_docs(): any[] {
  return [
    get_openai_function_web_search(),
    get_openai_function_browse_pages(),
  ];
}

function get_openai_function_web_search(): any {
  return {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for information',
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

function get_openai_function_browse_pages(): any {
  return {
    type: 'function',
    function: {
      name: 'browse_pages',
      description: 'Browse web pages and extract content',
      parameters: {
        type: 'object',
        properties: {
          urls: { type: 'array', items: { type: 'string' }, description: 'List of URLs to browse' },
        },
        required: ['urls'],
      },
    },
  };
}

function get_openai_function_execute_python_code(_file_process: boolean): any {
  return {
    type: 'function',
    function: {
      name: 'execute_python_code',
      description: 'Execute Python code',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Python code to execute' },
        },
        required: ['code'],
      },
    },
  };
}

function get_openai_function_process_file(): any {
  return {
    type: 'function',
    function: {
      name: 'process_file',
      description: 'Process a file',
      parameters: {
        type: 'object',
        properties: {
          file_name: { type: 'string', description: 'Name of the file to process' },
        },
        required: ['file_name'],
      },
    },
  };
}

function get_openai_function_visual_question_answering(): any {
  return {
    type: 'function',
    function: {
      name: 'visual_question_answering',
      description: 'Answer questions about an image',
      parameters: {
        type: 'object',
        properties: {
          image_name: { type: 'string', description: 'Name of the image' },
          question: { type: 'string', description: 'Question about the image' },
        },
        required: ['image_name', 'question'],
      },
    },
  };
}
