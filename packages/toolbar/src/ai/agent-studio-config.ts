import type { Environment } from '../types';

export type AgentStudioEnvironment = {
  appId: string;
  agentId: string;
  searchApiKey: string;
  baseUrl: string;
};

export const AGENT_STUDIO: Record<Environment, AgentStudioEnvironment> = {
  beta: {
    appId: process.env.AGENT_STUDIO_BETA_APP_ID!,
    agentId: process.env.AGENT_STUDIO_BETA_AGENT_ID!,
    searchApiKey: process.env.AGENT_STUDIO_BETA_SEARCH_API_KEY!,
    baseUrl: `https://agent-studio-staging.eu.algolia.com/1/agents/${process.env.AGENT_STUDIO_BETA_AGENT_ID}`,
  },
  prod: {
    appId: process.env.AGENT_STUDIO_PROD_APP_ID!,
    agentId: process.env.AGENT_STUDIO_PROD_AGENT_ID!,
    searchApiKey: process.env.AGENT_STUDIO_PROD_SEARCH_API_KEY!,
    baseUrl: `https://${process.env.AGENT_STUDIO_PROD_APP_ID}.algolia.net/agent-studio/1/agents/${process.env.AGENT_STUDIO_PROD_AGENT_ID}`,
  },
};
