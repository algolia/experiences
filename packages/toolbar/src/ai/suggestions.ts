import { fetchIndexSettings } from '../api';

type Credentials = {
  appId: string;
  apiKey: string;
};

type SuggestionSource = {
  fetcher: (credentials: Credentials, indexName: string) => Promise<string[]>;
  description: string;
};

const SUGGESTION_SOURCES: Record<string, SuggestionSource> = {
  facetAttributes: {
    description: 'Facet attributes configured in the Algolia index settings',
    fetcher: async (credentials, indexName) => {
      const settings = await fetchIndexSettings({
        appId: credentials.appId,
        apiKey: credentials.apiKey,
        indexName,
      });

      const raw = settings.attributesForFaceting ?? [];

      return raw
        .map((attr) => {
          return attr.replace(/^(searchable|filterOnly)\((.+)\)$/, '$2');
        })
        .sort();
    },
  },
};

const PARAM_SUGGESTIONS: Record<string, string> = {
  attribute: 'facetAttributes',
};

export function getSuggestionSourceForParam(param: string): string | undefined {
  return PARAM_SUGGESTIONS[param];
}

export async function fetchSuggestions(
  sourceName: string,
  credentials: Credentials,
  indexName: string
): Promise<{ values: string[]; description: string } | { error: string }> {
  const source = SUGGESTION_SOURCES[sourceName];

  if (!source) {
    return { error: `Unknown suggestion source: ${sourceName}` };
  }

  try {
    const values = await source.fetcher(credentials, indexName);

    return { values, description: source.description };
  } catch {
    return {
      error: `Failed to fetch suggestions from ${sourceName} for index "${indexName}"`,
    };
  }
}
