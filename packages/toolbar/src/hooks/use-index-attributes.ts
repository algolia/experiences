import { useEffect, useState } from 'preact/hooks';

import { fetchIndexRecords } from '../api';
import { extractAttributeNames } from '../lib/extract-attribute-names';
import { useToolbarContext } from '../lib/toolbar-context';

const cache = new Map<string, string[]>();

export function useIndexAttributes(indexName: string | undefined): string[] {
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

    fetchIndexRecords({
      appId: config.appId,
      apiKey: config.apiKey,
      indexName: effectiveIndexName,
    }).then((hits) => {
      if (cancelled) {
        return;
      }

      const names = extractAttributeNames(hits);
      cache.set(effectiveIndexName, names);
      setAttributes(names);
    });

    return () => {
      cancelled = true;
    };
  }, [config.appId, config.apiKey, effectiveIndexName]);

  return attributes;
}
