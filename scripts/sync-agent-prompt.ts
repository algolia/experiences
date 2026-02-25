import { buildSystemPrompt } from '../packages/toolbar/src/ai/tools';

const prompt = buildSystemPrompt();

const environments = [
  {
    name: 'staging',
    appId: process.env.AGENT_STUDIO_STAGING_APP_ID,
    apiKey: process.env.AGENT_STUDIO_STAGING_API_KEY,
    agentId: process.env.AGENT_STUDIO_STAGING_AGENT_ID,
    url: (_: string, agentId: string) => {
      return `https://agent-studio-staging.eu.algolia.com/1/agents/${agentId}`;
    },
  },
  {
    name: 'production',
    appId: process.env.AGENT_STUDIO_PROD_APP_ID,
    apiKey: process.env.AGENT_STUDIO_PROD_API_KEY,
    agentId: process.env.AGENT_STUDIO_PROD_AGENT_ID,
    url: (appId: string, agentId: string) => {
      return `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}`;
    },
  },
];

async function main() {
  let failed = false;

  for (const env of environments) {
    if (!env.appId || !env.apiKey || !env.agentId) {
      console.error(
        `[${env.name}] Missing environment variables (APP_ID, API_KEY, or AGENT_ID)`
      );
      failed = true;
      continue;
    }

    const url = env.url(env.appId, env.agentId);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-algolia-application-id': env.appId,
          'x-algolia-api-key': env.apiKey,
        },
        body: JSON.stringify({ instructions: prompt }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[${env.name}] Failed (${response.status}): ${text}`);
        failed = true;
      } else {
        console.log(`[${env.name}] Updated successfully`);
      }
    } catch (error) {
      console.error(`[${env.name}] Request failed:`, error);
      failed = true;
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main();
