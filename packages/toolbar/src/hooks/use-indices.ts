import { useEffect, useState } from 'preact/hooks';

import {
  fetchIndices,
  fetchQuerySuggestionConfigs,
  type IndexInfo,
  type QsConfig,
} from '../api';
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
  type?: 'replicas' | 'querySuggestions';
  target?: string;
  enabled?: boolean;
};

export function useIndices(options?: UseIndicesOptions): string[] {
  const indices = useAllIndices();
  const qsConfigs = useQuerySuggestionConfigs(
    options?.type === 'querySuggestions' && options.enabled !== false
  );

  if (!options?.type) {
    return indices.map((index) => {
      return index.name;
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
