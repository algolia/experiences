import {
  buildSystemPrompt,
  buildToolDefinitions,
} from '../packages/toolbar/src/ai/tools';
import { AGENT_STUDIO } from '../packages/toolbar/src/ai/agent-studio-config';

const prompt = buildSystemPrompt();
const tools = buildToolDefinitions();

const environments = Object.entries(AGENT_STUDIO).map(([name, config]) => {
  return {
    name,
    ...config,
    apiKey:
      name === 'beta'
        ? process.env.AGENT_STUDIO_BETA_WRITE_API_KEY
        : process.env.AGENT_STUDIO_PROD_WRITE_API_KEY,
  };
});

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

    try {
      const response = await fetch(env.baseUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-algolia-application-id': env.appId,
          'x-algolia-api-key': env.apiKey,
        },
        body: JSON.stringify({ instructions: prompt, tools }),
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
