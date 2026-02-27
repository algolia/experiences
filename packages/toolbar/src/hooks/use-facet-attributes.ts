import { useEffect, useState } from 'preact/hooks';

import { fetchIndexSettings } from '../api';
import { useToolbarContext } from '../lib/toolbar-context';

const cache = new Map<string, string[]>();

function stripModifier(attr: string): string {
  const match = attr.match(/^\w+\((.+)\)$/);

  return match?.[1] ?? attr;
}

export function useFacetAttributes(indexName: string | undefined): string[] {
  const { config, experience } = useToolbarContext();
  const effectiveIndexName = indexName || experience.indexName;
  const [attributes, setAttributes] = useState<string[]>(() => {
    return effectiveIndexName ? (cache.get(effectiveIndexName) ?? []) : [];
  });

  useEffect(() => {
    if (!effectiveIndexName) {
      setAttributes([]);

      return;
    }

    const cached = cache.get(effectiveIndexName);

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
        cache.set(effectiveIndexName, names);
        setAttributes(names);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [config.appId, config.apiKey, effectiveIndexName]);

  return attributes;
}
