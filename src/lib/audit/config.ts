import { ToolMetadata } from "./types";

export const VENDOR_REGISTRY: Record<string, ToolMetadata> = {
  openai: {
    id: "openai",
    name: "OpenAI API",
    category: "infrastructure",
    enterprise: true,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic API",
    category: "infrastructure",
    enterprise: true,
  },
  aws: {
    id: "aws",
    name: "AWS Bedrock",
    category: "infrastructure",
    enterprise: true,
  },
  gcp: {
    id: "gcp",
    name: "Google Cloud",
    category: "infrastructure",
    enterprise: true,
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    category: "assistant",
    enterprise: false,
  },
  github_copilot: {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "assistant",
    enterprise: true,
  },
  chatgpt_team: {
    id: "chatgpt_team",
    name: "ChatGPT Team",
    category: "consumer",
    enterprise: true,
  },
  chatgpt_plus: {
    id: "chatgpt_plus",
    name: "ChatGPT Plus",
    category: "consumer",
    enterprise: false,
  },
};
