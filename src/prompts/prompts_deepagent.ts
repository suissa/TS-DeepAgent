export const BEGIN_TOOL_SEARCH = '<tool_search>';
export const END_TOOL_SEARCH = '</tool_search>';
export const BEGIN_TOOL_CALL = '<tool_call>';
export const END_TOOL_CALL = '</tool_call>';
export const BEGIN_TOOL_SEARCH_RESULT = '<tool_search_result>';
export const END_TOOL_SEARCH_RESULT = '</tool_search_result>';
export const BEGIN_TOOL_RESPONSE = '<tool_response>';
export const END_TOOL_RESPONSE = '</tool_response>';
export const FOLD_THOUGHT = '<fold_thought>';

export function main_reasoning_prompt_openset_general_qa(question: string, extra_tools_info?: string): string {
  return `You are a helpful assistant that can use various tools to answer questions.

## System Message
You are a capable assistant with access to a diverse set of tools. You can search for and use tools to help answer questions accurately.

## User Question
${question}

${extra_tools_info ? `## Additional Tool Information\n${extra_tools_info}` : ''}

## Your Process
1. Analyze the question and identify what information or actions are needed
2. Search for appropriate tools if needed
3. Use tools to gather information or perform actions
4. Synthesize your findings into a comprehensive answer

When you need to search for tools, use:
${BEGIN_TOOL_SEARCH}<tool_name_description>${END_TOOL_SEARCH}

When you want to call a tool, use:
${BEGIN_TOOL_CALL}${JSON.stringify({ name: "tool_name", arguments: {} })}${END_TOOL_CALL}

When you want to fold your thoughts and continue reasoning:
${FOLD_THOUGHT}

Please begin your reasoning for the question above.`;
}

export function main_reasoning_prompt_closeset_general_qa(question: string, tools_block: string): string {
  return `You are a helpful assistant that can use tools to answer questions.

## User Question
${question}

## Available Tools
${tools_block}

## Your Process
1. Analyze the question and determine which tools to use
2. Call the appropriate tools to gather information
3. Synthesize your findings into a comprehensive answer

When you want to call a tool, use:
${BEGIN_TOOL_CALL}${JSON.stringify({ name: "tool_name", arguments: {} })}${END_TOOL_CALL}

Please begin your reasoning for the question above.`;
}

export function main_reasoning_prompt_closeset_embodied_task(question: string, tools_block: string): string {
  return `You are an embodied AI agent that can interact with environments.

## Task
${question}

## Available Actions
${tools_block}

## Your Process
1. Understand the task and environment
2. Execute appropriate actions to complete the task
3. Observe the results and continue until the task is complete

When you want to execute an action, use:
${BEGIN_TOOL_CALL}${JSON.stringify({ name: "action_name", arguments: {} })}${END_TOOL_CALL}

Please begin your task.`;
}

export function main_reasoning_prompt_closeset_web_navigation(question: string, tools_block: string): string {
  return `You are a web navigation assistant.

## Task
${question}

## Available Actions
${tools_block}

## Your Process
1. Understand the web navigation task
2. Use available actions to navigate and interact with the web
3. Complete the task by finding and/or purchasing the required items

When you want to execute an action, use:
${BEGIN_TOOL_CALL}${JSON.stringify({ name: "action_name", arguments: {} })}${END_TOOL_CALL}

Please begin your task.`;
}

export function get_tool_search_intent_instruction(previous_thoughts: string): string {
  return `Given the conversation history, identify what the user is trying to accomplish.

## Previous Thoughts
${previous_thoughts}

What is the user's search intent? Provide a brief description of what they're looking for.`;
}

export function get_helpful_tools_prompt(query: string, search_intent: string, tool_search_result: string): string {
  return `Based on the user's query and search intent, select the most helpful tools.

## User Query
${query}

## Search Intent
${search_intent}

## Available Tools
${tool_search_result}

Select the tools that would be most helpful for this task.`;
}

export function get_tool_call_intent_instruction(previous_thoughts: string): string {
  return `Given the conversation history, explain what the tool call is trying to accomplish.

## Previous Thoughts
${previous_thoughts}

What is the purpose of the tool call?`;
}

export function tool_response_analysis_prompt(tool_call: string, tool_call_intent: string, tool_response: string): string {
  return `Analyze the tool response and extract relevant information.

## Tool Call
${tool_call}

## Tool Call Intent
${tool_call_intent}

## Tool Response
${tool_response}

What relevant information can be extracted from this tool response?`;
}

export function get_episode_memory_instruction(question: string, previous_thoughts: string, available_tools: string): string {
  return `Generate an episodic memory summary.

## Question
${question}

## Previous Thoughts
${previous_thoughts}

## Available Tools
${available_tools}

Summarize the key events and decisions so far.`;
}

export function get_working_memory_instruction(question: string, previous_thoughts: string, available_tools: string): string {
  return `Generate working memory for the current task.

## Question
${question}

## Previous Thoughts
${previous_thoughts}

## Available Tools
${available_tools}

What is the current goal and what information is most relevant?`;
}

export function get_tool_memory_instruction(question: string, previous_thoughts: string, tool_call_history: string, available_tools: string): string {
  return `Generate tool memory based on the tool usage history.

## Question
${question}

## Previous Thoughts
${previous_thoughts}

## Tool Call History
${tool_call_history}

## Available Tools
${available_tools}

What tools have been used and what was learned from them?`;
}

export function extract_json_from_response(response: string): string {
  try {
    const json_match = response.match(/\{[\s\S]*\}/);
    if (json_match) {
      return json_match[0];
    }
    return response;
  } catch {
    return response;
  }
}

export function get_toolhop_prompt(): string {
  return `For ToolHop tasks, you can only use tools that are provided in the available tools list. Each tool has a specific name and set of parameters.`;
}
