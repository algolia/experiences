import type {
  Environment,
  ExperienceApiResponse,
  SaveExperienceParams,
} from './types';

const API_BASE: Record<Environment, string> = {
  beta: 'https://experiences-beta.algolia.com/1',
  prod: 'https://experiences.algolia.com/1',
};

type FetchExperienceParams = {
  appId: string;
  apiKey: string;
  env: Environment;
  experienceId: string;
};

export async function fetchExperience({
  appId,
  apiKey,
  env,
  experienceId,
}: FetchExperienceParams): Promise<ExperienceApiResponse> {
  const res = await fetch(`${API_BASE[env]}/experiences/${experienceId}`, {
    method: 'GET',
    headers: {
      'X-Algolia-Application-ID': appId,
      'X-Algolia-API-Key': apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(
      `[@algolia/experiences-toolbar] Failed to fetch experience: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function saveExperience({
  appId,
  apiKey,
  env,
  config,
}: SaveExperienceParams): Promise<void> {
  const res = await fetch(`${API_BASE[env]}/experiences`, {
    method: 'POST',
    headers: {
      'X-Algolia-Application-ID': appId,
      'X-Algolia-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    throw new Error(
      `[@algolia/experiences-toolbar] Failed to save experience: ${res.status} ${res.statusText}`
    );
  }
}

type FetchIndexRecordsParams = {
  appId: string;
  apiKey: string;
  indexName: string;
};

export async function fetchIndexRecords({
  appId,
  apiKey,
  indexName,
}: FetchIndexRecordsParams): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(
    `https://${appId}-dsn.algolia.net/1/indexes/${indexName}/query`,
    {
      method: 'POST',
      headers: {
        'X-Algolia-Application-ID': appId,
        'X-Algolia-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hitsPerPage: 10,
        attributesToHighlight: [],
        attributesToSnippet: [],
      }),
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as { hits?: Array<Record<string, unknown>> };

  return data.hits ?? [];
}

export type IndexInfo = {
  name: string;
  replicas?: string[];
  primary?: string;
};

type FetchIndicesParams = {
  appId: string;
  apiKey: string;
};

export async function fetchIndices({
  appId,
  apiKey,
}: FetchIndicesParams): Promise<IndexInfo[]> {
  const items: IndexInfo[] = [];
  let page = 0;

  try {
    while (true) {
      const res = await fetch(
        `https://${appId}-dsn.algolia.net/1/indexes?page=${page}&hitsPerPage=100`,
        {
          method: 'GET',
          headers: {
            'X-Algolia-Application-ID': appId,
            'X-Algolia-API-Key': apiKey,
          },
        }
      );

      if (!res.ok) {
        return items;
      }

      const data = (await res.json()) as {
        items?: IndexInfo[];
        nbPages?: number;
      };

      if (data.items) {
        items.push(...data.items);
      }

      page++;
      if (page >= (data.nbPages ?? 1)) {
        break;
      }
    }
  } catch {
    // Network error — return what we have
  }

  return items;
}

export type QsConfig = {
  indexName: string;
  sourceIndices: Array<{ indexName: string }>;
};

type FetchQsConfigsParams = {
  appId: string;
  apiKey: string;
};

export async function fetchQuerySuggestionConfigs({
  appId,
  apiKey,
}: FetchQsConfigsParams): Promise<QsConfig[]> {
  const headers = {
    'X-Algolia-Application-ID': appId,
    'X-Algolia-API-Key': apiKey,
  };

  for (const region of ['us', 'eu'] as const) {
    try {
      const res = await fetch(
        `https://query-suggestions.${region}.algolia.com/1/configs`,
        { method: 'GET', headers }
      );

      if (res.ok) {
        return (await res.json()) as QsConfig[];
      }
    } catch {
      // Network error — try next region
    }
  }

  return [];
}

type FetchAgentStudioAgentsParams = {
  appId: string;
  apiKey: string;
  env: Environment;
};

export type AgentStudioAgent = {
  id: string;
  name: string;
  status: string;
};

type AgentStudioResponse = {
  data?: AgentStudioAgent[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
};

const MAX_AGENT_PAGES = 50;

export async function fetchAgentStudioAgents({
  appId,
  apiKey,
  env,
}: FetchAgentStudioAgentsParams): Promise<AgentStudioAgent[]> {
  const baseUrl =
    env === 'beta'
      ? 'https://agent-studio-staging.eu.algolia.com/1/agents'
      : `https://${appId}.algolia.net/agent-studio/1/agents`;

  const agents: AgentStudioAgent[] = [];
  let page = 1;

  while (page <= MAX_AGENT_PAGES) {
    const url = new URL(baseUrl);
    url.searchParams.set('limit', '100');
    url.searchParams.set('page', String(page));

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Algolia-Application-ID': appId,
        'X-Algolia-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(
        `[@algolia/experiences-toolbar] Failed to fetch agents: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as AgentStudioResponse;

    agents.push(...(data.data ?? []));

    if (!data.pagination || page >= data.pagination.totalPages) {
      break;
    }

    page++;
  }

  return agents
    .filter((agent) => {
      return agent.status !== 'draft';
    })
    .sort((left, right) => {
      return left.name.localeCompare(right.name);
    });
}

type FetchIndexSettingsParams = {
  appId: string;
  apiKey: string;
  indexName: string;
};

export async function fetchIndexSettings({
  appId,
  apiKey,
  indexName,
}: FetchIndexSettingsParams): Promise<{
  attributesForFaceting?: string[];
}> {
  const res = await fetch(
    `https://${appId}-dsn.algolia.net/1/indexes/${indexName}/settings`,
    {
      method: 'GET',
      headers: {
        'X-Algolia-Application-ID': appId,
        'X-Algolia-API-Key': apiKey,
      },
    }
  );

  if (!res.ok) {
    return {};
  }

  const data = (await res.json()) as {
    attributesForFaceting?: string[];
  };

  return data;
}
