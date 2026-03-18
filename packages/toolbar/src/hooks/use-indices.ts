import { useEffect, useState } from 'preact/hooks';

import {
  fetchAgentStudioAgents,
  fetchIndexRecords,
  fetchIndexSettings,
  fetchIndices,
  fetchQuerySuggestionConfigs,
  type IndexInfo,
  type QsConfig,
} from '../api';
import { extractAttributeNames } from '../lib/extract-attribute-names';
import { useToolbarContext } from '../lib/toolbar-context';

const indicesCache = new Map<string, IndexInfo[]>();
const indicesFetching = new Map<string, Promise<IndexInfo[]>>();
const qsCache = new Map<string, QsConfig[]>();
const qsFetching = new Map<string, Promise<QsConfig[]>>();

function useAllIndices(): IndexInfo[] {
  const { config } = useToolbarContext();
  const { appId, apiKey } = config;
  const [indices, setIndices] = useState<IndexInfo[]>(() => {
    return indicesCache.get(appId) ?? [];
  });

  useEffect(() => {
    const cached = indicesCache.get(appId);

    if (cached) {
      setIndices(cached);

      return;
    }

    let cancelled = false;

    const pending =
      indicesFetching.get(appId) ?? fetchIndices({ appId, apiKey });

    indicesFetching.set(appId, pending);

    pending
      .then((items) => {
        indicesCache.set(appId, items);
        indicesFetching.delete(appId);

        if (!cancelled) {
          setIndices(items);
        }
      })
      .catch(() => {
        indicesFetching.delete(appId);
      });

    return () => {
      cancelled = true;
    };
  }, [appId, apiKey]);

  return indices;
}

function useQuerySuggestionConfigs(enabled: boolean): QsConfig[] {
  const { config } = useToolbarContext();
  const { appId, apiKey } = config;
  const [configs, setConfigs] = useState<QsConfig[]>(() => {
    return qsCache.get(appId) ?? [];
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cached = qsCache.get(appId);

    if (cached) {
      setConfigs(cached);

      return;
    }

    let cancelled = false;

    const pending =
      qsFetching.get(appId) ?? fetchQuerySuggestionConfigs({ appId, apiKey });

    qsFetching.set(appId, pending);

    pending
      .then((items) => {
        qsCache.set(appId, items);
        qsFetching.delete(appId);

        if (!cancelled) {
          setConfigs(items);
        }
      })
      .catch(() => {
        qsFetching.delete(appId);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, appId, apiKey]);

  return configs;
}

type UseIndicesOptions = {
  type?: 'indices' | 'replicas' | 'querySuggestions';
  target?: string;
  enabled?: boolean;
};

export function useIndices(options?: UseIndicesOptions): string[] {
  const indices = useAllIndices();
  const qsConfigs = useQuerySuggestionConfigs(
    (options?.type === 'querySuggestions' || options?.type === 'indices') &&
      options.enabled !== false
  );

  if (!options?.type) {
    return indices.map((index) => {
      return index.name;
    });
  }

  if (options.type === 'indices') {
    const qsIndexNames = new Set(
      qsConfigs.map((config) => {
        return config.indexName;
      })
    );
    return indices
      .map((index) => {
        return index.name;
      })
      .filter((name) => {
        return !qsIndexNames.has(name);
      });
  }

  if (options.type === 'replicas') {
    if (!options.target) {
      return [];
    }

    const primary = indices.find((index) => {
      return index.name === options.target;
    });

    return primary?.replicas ?? [];
  }

  if (options.type === 'querySuggestions') {
    if (!options.target) {
      return qsConfigs.map((config) => {
        return config.indexName;
      });
    }

    return qsConfigs
      .filter((config) => {
        return config.sourceIndices.some((source) => {
          return source.indexName === options.target;
        });
      })
      .map((config) => {
        return config.indexName;
      });
  }

  return [];
}

type Agent = {
  id: string;
  name: string;
};

const agentCache = new Map<string, Agent[]>();

export function useAgentStudioAgents(): Agent[] {
  const { config } = useToolbarContext();
  const env = config.env ?? 'prod';
  const cacheKey = `${env}:${config.appId}`;
  const [agents, setAgents] = useState<Agent[]>(() => {
    return agentCache.get(cacheKey) ?? [];
  });

  useEffect(() => {
    const cached = agentCache.get(cacheKey);

    if (cached) {
      setAgents(cached);

      return;
    }

    let cancelled = false;

    fetchAgentStudioAgents({
      appId: config.appId,
      apiKey: config.apiKey,
      env,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        const mapped = result.map((agent) => {
          return { id: agent.id, name: agent.name };
        });
        agentCache.set(cacheKey, mapped);
        setAgents(mapped);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [config.appId, config.apiKey, cacheKey]);

  return agents;
}

const facetCache = new Map<string, string[]>();

function stripModifier(attr: string): string {
  const match = attr.match(/^\w+\((.+)\)$/);

  return match?.[1] ?? attr;
}

export function useFacetAttributes(indexName: string | undefined): string[] {
  const { config, experience } = useToolbarContext();
  const effectiveIndexName = indexName || experience.indexName;
  const [attributes, setAttributes] = useState<string[]>(() => {
    return effectiveIndexName ? (facetCache.get(effectiveIndexName) ?? []) : [];
  });

  useEffect(() => {
    if (!effectiveIndexName) {
      setAttributes([]);

      return;
    }

    const cached = facetCache.get(effectiveIndexName);

    if (cached) {
      setAttributes(cached);

      return;
    }

    let cancelled = false;

    fetchIndexSettings({
      appId: config.appId,
      apiKey: config.apiKey,
      indexName: effectiveIndexName,
    })
      .then((settings) => {
        if (cancelled) {
          return;
        }

        const raw = settings.attributesForFaceting ?? [];
        const names = raw.map(stripModifier).sort();
        facetCache.set(effectiveIndexName, names);
        setAttributes(names);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [config.appId, config.apiKey, effectiveIndexName]);

  return attributes;
}

const indexAttrCache = new Map<string, string[]>();

export function useIndexAttributes(indexName: string | undefined): string[] {
  const { config, experience } = useToolbarContext();
  const effectiveIndexName = indexName || experience.indexName;
  const [attributes, setAttributes] = useState<string[]>(() => {
    return effectiveIndexName
      ? (indexAttrCache.get(effectiveIndexName) ?? [])
      : [];
  });

  useEffect(() => {
    if (!effectiveIndexName) {
      setAttributes([]);

      return;
    }

    const cached = indexAttrCache.get(effectiveIndexName);

    if (cached) {
      setAttributes(cached);

      return;
    }

    let cancelled = false;

    fetchIndexRecords({
      appId: config.appId,
      apiKey: config.apiKey,
      indexName: effectiveIndexName,
    }).then((hits) => {
      if (cancelled) {
        return;
      }

      const names = extractAttributeNames(hits);
      indexAttrCache.set(effectiveIndexName, names);
      setAttributes(names);
    });

    return () => {
      cancelled = true;
    };
  }, [config.appId, config.apiKey, effectiveIndexName]);

  return attributes;
}
