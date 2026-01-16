import axios from 'axios';

export interface RapidAPITool {
  category_name: string;
  tool_name: string;
  api_name: string;
  openai_function: any;
}

export interface RapidAPICallerOptions {
  tool_docs: RapidAPITool[];
  service_url: string;
  toolbench_key: string;
}

export class RapidAPICaller {
  private tool_docs: RapidAPITool[];
  private service_url: string;
  private toolbench_key: string;

  constructor(options: RapidAPICallerOptions) {
    this.tool_docs = options.tool_docs;
    this.service_url = options.service_url;
    this.toolbench_key = options.toolbench_key;
  }

  async call_api(tool_call: { function: { name: string; arguments?: { [key: string]: any } } }): Promise<any> {
    const tool_name = tool_call.function.name;
    const arguments_ = tool_call.function.arguments || {};
    console.log(`RapidAPI call: ${tool_name}`, arguments_);
    return { result: `Response from ${tool_name}` };
  }
}

export function standardize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export function change_name(name: string): string {
  return name;
}

export function api_json_to_openai_json(tool_documentation: any, tool_name: string): any {
  return {
    type: 'function',
    function: {
      name: tool_name,
      description: tool_documentation?.description || '',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  };
}
