import {
  get_openai_function_execute_python_code,
  execute_python_code
} from '../../src/tools/python_executor';

describe('Python Executor', () => {
  describe('get_openai_function_execute_python_code', () => {
    it('should return correct function definition', () => {
      const func = get_openai_function_execute_python_code();
      expect(func.type).toBe('function');
      expect(func.function.name).toBe('execute_python_code');
      expect(func.function.description).toContain('Execute Python');
      expect(func.function.parameters.properties.code.type).toBe('string');
      expect(func.function.parameters.required).toContain('code');
    });

    it('should work with file_process parameter', () => {
      const func = get_openai_function_execute_python_code(true);
      expect(func.function.name).toBe('execute_python_code');
    });
  });

  describe('execute_python_code', () => {
    it('should return result object', async () => {
      const result = await execute_python_code('print("hello")');
      expect(result).toHaveProperty('result');
      expect(typeof result.result).toBe('string');
    });

    it('should handle empty code', async () => {
      const result = await execute_python_code('');
      expect(result).toHaveProperty('result');
    });
  });
});
