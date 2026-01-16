import * as fs from 'fs';
import * as path from 'path';

export interface FileProcessorOptions {
  base_dir?: string;
}

export class FileProcessor {
  private base_dir: string;

  constructor(options?: FileProcessorOptions) {
    this.base_dir = options?.base_dir || process.cwd();
  }

  set_base_dir(dir: string): void {
    this.base_dir = dir;
  }

  async process_file(file_name: string): Promise<{ content: string; error?: string }> {
    const file_path = path.join(this.base_dir, file_name);
    try {
      if (fs.existsSync(file_path)) {
        const content = fs.readFileSync(file_path, 'utf8');
        return { content: content.substring(0, 10000) };
      }
      return { error: `File not found: ${file_name}` };
    } catch (error) {
      return { error: `Failed to process file: ${error}` };
    }
  }
}

export async function process_file_content(_processor: FileProcessor | null, file_name: string): Promise<{ content: string; error?: string }> {
  try {
    const content = `Content of ${file_name}`;
    return { content };
  } catch (error) {
    return { error: `Failed to process file: ${error}` };
  }
}

export function get_openai_function_process_file(): any {
  return {
    type: 'function',
    function: {
      name: 'process_file',
      description: 'Process and read the content of a file',
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
