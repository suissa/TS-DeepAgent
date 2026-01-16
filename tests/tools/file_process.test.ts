import {
  get_openai_function_process_file,
  process_file_content,
  FileProcessor
} from '../../src/tools/file_process';

describe('File Process', () => {
  describe('FileProcessor', () => {
    it('should initialize with default base_dir', () => {
      const processor = new FileProcessor();
      expect(processor).toBeDefined();
    });

    it('should set base_dir', () => {
      const processor = new FileProcessor();
      processor.set_base_dir('/custom/path');
    });
  });

  describe('get_openai_function_process_file', () => {
    it('should return correct function definition', () => {
      const func = get_openai_function_process_file();
      expect(func.type).toBe('function');
      expect(func.function.name).toBe('process_file');
      expect(func.function.description).toContain('Process and read');
      expect(func.function.parameters.properties.file_name.type).toBe('string');
      expect(func.function.parameters.required).toContain('file_name');
    });
  });

  describe('process_file_content', () => {
    it('should return content object', async () => {
      const processor = new FileProcessor();
      const result = await process_file_content(processor, 'test.txt');
      expect(result).toHaveProperty('content');
    });
  });
});
