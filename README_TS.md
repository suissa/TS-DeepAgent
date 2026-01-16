# ts-deepagent

TypeScript port of DeepAgent - A General Reasoning Agent with Scalable Toolsets

## Description

This is a TypeScript implementation of the DeepAgent project, which is an end-to-end deep reasoning agent that performs autonomous thinking, tool discovery, and action execution within a single, coherent reasoning process.

## Features

- Unified Agentic Reasoning
- Autonomous Memory Folding & Brain-Inspired Memory
- Support for multiple tool sets (ToolBench, API-Bank, RestBench, ToolHop, GAIA, HLE, etc.)
- Tool search and retrieval
- Multiple environment support (ALFWorld, WebShop)

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Running

```bash
npm run start
```

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── run_deep_agent.ts        # Main agent execution script
├── run_tool_search_server.ts # Tool search server
├── tools/                   # Tool implementations
│   ├── tool_manager.ts      # Central tool manager
│   ├── tool_search.ts       # Tool retrieval
│   ├── toolhop.ts           # ToolHop dataset tools
│   ├── restbench_api.ts     # RestBench API tools (TMDB, Spotify)
│   ├── rapid_api.ts         # RapidAPI tools
│   ├── python_executor.ts   # Python code execution
│   ├── multimodal_tools.ts  # VQA tools
│   ├── google_search.ts     # Web search tools
│   ├── file_process.ts      # File processing
│   └── api_bank.ts          # API-Bank tools
├── prompts/                 # Prompt templates
│   ├── prompts_deepagent.ts # DeepAgent prompts
│   └── prompts_react.ts     # ReAct prompts
├── evaluate/                # Evaluation scripts
│   └── evaluate_base.ts     # Base evaluation
├── envs/                    # Environment wrappers
│   ├── alfworld.ts          # ALFWorld environment
│   └── webshop.ts           # WebShop environment
└── utils/                   # Utilities
    ├── utils.ts             # General utilities
    ├── oas_utils.ts         # OpenAPI utilities
    └── math_equivalence.ts  # Math equivalence checking
```

## Original Python Version

This project is a TypeScript port of [DeepAgent](https://github.com/RUC-NLPIR/DeepAgent), originally written in Python.

## License

MIT
