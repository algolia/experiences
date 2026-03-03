import { fetchAgentStudioAgents, fetchIndexSettings } from '../api';
import type { Environment } from '../types';

type Credentials = {
  appId: string;
  apiKey: string;
};

type SuggestionFetchContext = {
  credentials: Credentials;
  env: Environment;
  indexName?: string;
};

type SuggestionValue = string | { value: string; label: string };

type SuggestionSource = {
  fetcher: (context: SuggestionFetchContext) => Promise<SuggestionValue[]>;
  description: string;
  requiresIndexName?: boolean;
};

const SUGGESTION_SOURCES: Record<string, SuggestionSource> = {
  facetAttributes: {
    description: 'Facet attributes configured in the Algolia index settings',
    requiresIndexName: true,
    fetcher: async (context) => {
      const settings = await fetchIndexSettings({
        appId: context.credentials.appId,
        apiKey: context.credentials.apiKey,
        indexName: context.indexName!,
      });

      const raw = settings.attributesForFaceting ?? [];

      return raw
        .map((attr) => {
          return attr.replace(/^(searchable|filterOnly)\((.+)\)$/, '$2');
        })
        .sort();
    },
  },
  agentStudioAgents: {
    description: 'Available Agent Studio agents',
    fetcher: async (context) => {
      const agents = await fetchAgentStudioAgents({
        appId: context.credentials.appId,
        apiKey: context.credentials.apiKey,
        env: context.env,
      });

      return agents.map((agent) => {
        return { value: agent.id, label: agent.name };
      });
    },
  },
};

const PARAM_SUGGESTIONS: Record<string, string> = {
  attribute: 'facetAttributes',
  agentId: 'agentStudioAgents',
};

export function getSuggestionSourceForParam(param: string): string | undefined {
  return PARAM_SUGGESTIONS[param];
}

export function suggestionSourceRequiresIndexName(sourceName: string): boolean {
  return SUGGESTION_SOURCES[sourceName]?.requiresIndexName === true;
}

export async function fetchSuggestions(
  sourceName: string,
  credentials: Credentials,
  env: Environment,
  indexName?: string
): Promise<
  | { values: string[]; description: string; labels?: Record<string, string> }
  | { error: string }
> {
  const source = SUGGESTION_SOURCES[sourceName];

  if (!source) {
    return { error: `Unknown suggestion source: ${sourceName}` };
  }

  try {
    const raw = await source.fetcher({ credentials, env, indexName });

    const values: string[] = [];
    const labels: Record<string, string> = {};

    for (const item of raw) {
      if (typeof item === 'string') {
        values.push(item);
      } else {
        values.push(item.value);
        labels[item.value] = item.label;
      }
    }

    return {
      values,
      description: source.description,
      ...(Object.keys(labels).length > 0 && { labels }),
    };
  } catch {
    const suffix = indexName ? ` for index "${indexName}"` : '';

    return {
      error: `Failed to fetch suggestions from ${sourceName}${suffix}`,
    };
  }
}
