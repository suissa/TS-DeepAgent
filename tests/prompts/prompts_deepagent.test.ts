import {
  main_reasoning_prompt_openset_general_qa,
  main_reasoning_prompt_closeset_general_qa,
  main_reasoning_prompt_closeset_embodied_task,
  main_reasoning_prompt_closeset_web_navigation,
  BEGIN_TOOL_SEARCH,
  END_TOOL_SEARCH,
  BEGIN_TOOL_CALL,
  END_TOOL_CALL,
  FOLD_THOUGHT,
  get_tool_search_intent_instruction,
  get_helpful_tools_prompt,
  get_tool_call_intent_instruction,
  tool_response_analysis_prompt,
  get_episode_memory_instruction,
  get_working_memory_instruction,
  get_tool_memory_instruction,
  extract_json_from_response,
  get_toolhop_prompt
} from '../../src/prompts/prompts_deepagent';

describe('Prompts DeepAgent', () => {
  describe('Prompt Templates', () => {
    it('should generate openset general QA prompt', () => {
      const prompt = main_reasoning_prompt_openset_general_qa('What is TypeScript?');
      expect(prompt).toContain('What is TypeScript?');
      expect(prompt).toContain(BEGIN_TOOL_SEARCH);
      expect(prompt).toContain(END_TOOL_SEARCH);
      expect(prompt).toContain(BEGIN_TOOL_CALL);
      expect(prompt).toContain(END_TOOL_CALL);
    });

    it('should generate closeset general QA prompt with tools', () => {
      const toolsBlock = JSON.stringify([{ name: 'search', description: 'Search tool' }]);
      const prompt = main_reasoning_prompt_closeset_general_qa('Find information', toolsBlock);
      expect(prompt).toContain('Find information');
      expect(prompt).toContain('search');
      expect(prompt).toContain('Available Tools');
    });

    it('should generate embodied task prompt', () => {
      const toolsBlock = JSON.stringify([{ name: 'goto', description: 'Go to location' }]);
      const prompt = main_reasoning_prompt_closeset_embodied_task('Navigate to kitchen', toolsBlock);
      expect(prompt).toContain('Navigate to kitchen');
      expect(prompt).toContain('embodied AI agent');
      expect(prompt).toContain('Available Actions');
    });

    it('should generate web navigation prompt', () => {
      const toolsBlock = JSON.stringify([{ name: 'click', description: 'Click element' }]);
      const prompt = main_reasoning_prompt_closeset_web_navigation('Buy product X', toolsBlock);
      expect(prompt).toContain('Buy product X');
      expect(prompt).toContain('web navigation');
      expect(prompt).toContain('Available Actions');
    });

    it('should include extra tools info when provided', () => {
      const prompt = main_reasoning_prompt_openset_general_qa('Question', 'Special tool info');
      expect(prompt).toContain('Additional Tool Information');
      expect(prompt).toContain('Special tool info');
    });
  });

  describe('Marker Constants', () => {
    it('should have correct marker values', () => {
      expect(BEGIN_TOOL_SEARCH).toBe('<tool_search>');
      expect(END_TOOL_SEARCH).toBe('</tool_search>');
      expect(BEGIN_TOOL_CALL).toBe('<tool_call>');
      expect(END_TOOL_CALL).toBe('</tool_call>');
      expect(FOLD_THOUGHT).toBe('<fold_thought>');
    });
  });

  describe('Instruction Functions', () => {
    it('should generate tool search intent instruction', () => {
      const instruction = get_tool_search_intent_instruction('Previous step 1\nPrevious step 2');
      expect(instruction).toContain('Previous Thoughts');
      expect(instruction).toContain('search intent');
    });

    it('should generate helpful tools prompt', () => {
      const prompt = get_helpful_tools_prompt(
        'Find recipes',
        'Looking for cooking instructions',
        '[{"name": "search"}]'
      );
      expect(prompt).toContain('Find recipes');
      expect(prompt).toContain('Looking for cooking instructions');
      expect(prompt).toContain('Available Tools');
    });

    it('should generate tool call intent instruction', () => {
      const instruction = get_tool_call_intent_instruction('Thinking about search');
      expect(instruction).toContain('Previous Thoughts');
      expect(instruction).toContain('purpose of the tool call');
    });

    it('should generate tool response analysis prompt', () => {
      const prompt = tool_response_analysis_prompt(
        '{"name": "search"}',
        'Get results',
        '{"results": []}'
      );
      expect(prompt).toContain('Tool Call');
      expect(prompt).toContain('Tool Call Intent');
      expect(prompt).toContain('Tool Response');
    });

    it('should generate episode memory instruction', () => {
      const instruction = get_episode_memory_instruction(
        'Task question',
        'Previous actions',
        '[{"name": "tool"}]'
      );
      expect(instruction).toContain('Question');
      expect(instruction).toContain('Previous Thoughts');
      expect(instruction).toContain('episodic memory');
    });

    it('should generate working memory instruction', () => {
      const instruction = get_working_memory_instruction(
        'Task question',
        'Previous steps',
        '[{"name": "tool"}]'
      );
      expect(instruction).toContain('Question');
      expect(instruction).toContain('current goal');
    });

    it('should generate tool memory instruction', () => {
      const instruction = get_tool_memory_instruction(
        'Task question',
        'Previous steps',
        '[{"tool": "call"}]',
        '[{"name": "tool"}]'
      );
      expect(instruction).toContain('Tool Call History');
      expect(instruction).toContain('tools have been used');
    });
  });

  describe('extract_json_from_response', () => {
    it('should extract JSON from response', () => {
      const response = 'Some text {"key": "value"} more text';
      const result = extract_json_from_response(response);
      expect(result).toBe('{"key": "value"}');
    });

    it('should return original text if no JSON found', () => {
      const response = 'No JSON here';
      const result = extract_json_from_response(response);
      expect(result).toBe('No JSON here');
    });

    it('should handle multiline JSON', () => {
      const response = 'Start\n{\n  "key": "value"\n}\nEnd';
      const result = extract_json_from_response(response);
      expect(result).toContain('"key"');
      expect(result).toContain('"value"');
    });
  });

  describe('get_toolhop_prompt', () => {
    it('should return toolhop-specific instructions', () => {
      const prompt = get_toolhop_prompt();
      expect(prompt).toContain('ToolHop');
      expect(prompt).toContain('tools that are provided');
    });
  });
});
