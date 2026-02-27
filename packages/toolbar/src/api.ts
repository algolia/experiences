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
