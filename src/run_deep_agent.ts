import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';
import axios from 'axios';

interface Args {
  config_path: string;
  dataset_name: string;
  subset_num: number;
  enable_tool_search: boolean;
  enable_thought_folding: boolean;
  max_action_limit: number;
  max_fold_limit: number;
  concurrent_limit: number;
  top_k: number;
  eval: boolean;
  seed?: number;
  single_question?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  repetition_penalty?: number;
  top_k_sampling?: number;
  model_name?: string;
  aux_model_name?: string;
  tokenizer_path?: string;
  aux_tokenizer_path?: string;
  api_key?: string;
  base_url?: string;
  aux_api_key?: string;
  aux_base_url?: string;
  vqa_api_key?: string;
  vqa_base_url?: string;
  vqa_model_name?: string;
  tool_retriever_api_base?: string;
  tool_index_cache_dir?: string;
  search_cache_dir?: string;
  url_cache_dir?: string;
  [key: string]: any;
}

export async function parseArgs(): Promise<Args> {
  const args: Args = {
    config_path: './config/base_config.yaml',
    dataset_name: 'toolbench',
    subset_num: -1,
    enable_tool_search: false,
    enable_thought_folding: false,
    max_action_limit: 50,
    max_fold_limit: 3,
    concurrent_limit: 32,
    top_k: 10,
    eval: false,
  };
  return args;
}

export async function loadConfig(configPath: string): Promise<{ [key: string]: any }> {
  const configFile = fs.readFileSync(configPath, 'utf8');
  return yaml.parse(configFile);
}

export async function main_async(): Promise<void> {
  console.log('Process started.');
  const args = await parseArgs();
  const config = await loadConfig(args.config_path);
  for (const [key, value] of Object.entries(config)) {
    (args as any)[key] = value;
  }
  console.log('Configuration loaded.');
  console.log(`Dataset: ${args.dataset_name}`);
  console.log(`Tool Search: ${args.enable_tool_search}`);
  console.log('Process completed.');
}

export async function main(): Promise<void> {
  await main_async();
}

if (require.main === module) {
  main().catch(console.error);
}
