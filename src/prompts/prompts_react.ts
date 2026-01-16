export function get_react_system_prompt(): string {
  return `You are a helpful assistant that follows the ReAct pattern (Reason + Act).
  
You have access to tools to help answer questions. For each step:
1. Think about what to do
2. Take an action using a tool
3. Observe the result
4. Continue until you have enough information

Think: <your reasoning>
Act: <tool_call>
Obs: <observation>

Please help the user with their question.`;
}

export function get_react_user_prompt(question: string): string {
  return `Question: ${question}

Please help answer this question using the ReAct pattern.`;
}

export function extract_think_from_response(response: string): string {
  const think_match = response.match(/Think:\s*([\s\S]*?)(?:\nAct:|$)/);
  if (think_match) {
    return think_match[1].trim();
  }
  return '';
}

export function extract_act_from_response(response: string): string {
  const act_match = response.match(/Act:\s*([\s\S]*?)(?:\nObs:|$)/);
  if (act_match) {
    return act_match[1].trim();
  }
  return '';
}

export function extract_obs_from_response(response: string): string {
  const obs_match = response.match(/Obs:\s*([\s\S]*?)$/);
  if (obs_match) {
    return obs_match[1].trim();
  }
  return '';
}
