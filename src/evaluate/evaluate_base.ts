export interface EvaluationResult {
  question: string;
  answer: string;
  predicted_answer: string;
  correct: boolean;
  metrics: { [key: string]: number };
}

export interface EvaluationOptions {
  extract_answer?: boolean;
  use_llm?: boolean;
  domain_fields?: string[];
}

export async function run_evaluation(
  data: any[],
  input_list: string[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string,
  options: EvaluationOptions = {}
): Promise<void> {
  console.log('Running evaluation...');
  console.log(`Processed ${data.length} samples`);
}

export async function evaluate_predictions_toolhop(
  data: any[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string
): Promise<void> {
  console.log('Evaluating ToolHop predictions...');
}

export async function compute_toolbench_metrics(
  data: any[],
  _client: any,
  _model_name: string,
  _max_eval_threads: number,
  _evaluate_times: number,
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string
): Promise<void> {
  console.log('Computing ToolBench metrics...');
}

export function evaluate_predictions_alfworld(
  data: any[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string
): void {
  console.log('Evaluating ALFWorld predictions...');
}

export function evaluate_predictions_webshop(
  data: any[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string
): void {
  console.log('Evaluating WebShop predictions...');
}

export function evaluate_restbench_predictions(
  data: any[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string
): void {
  console.log('Evaluating RestBench predictions...');
}

export function evaluate_api_bank_predictions(
  data: any[],
  output_list: string[],
  output_dir: string,
  output_metrics_path: string,
  output_metrics_overall_path: string,
  _args: any
): void {
  console.log('Evaluating API-Bank predictions...');
}
