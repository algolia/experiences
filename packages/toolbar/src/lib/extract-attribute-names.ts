const INTERNAL_KEYS = new Set([
  'objectID',
  '_highlightResult',
  '_snippetResult',
  '_rankingInfo',
  '_distinctSeqID',
]);

export function extractAttributeNames(
  hits: Array<Record<string, unknown>>
): string[] {
  const keys = new Set<string>();

  const collectPaths = (obj: Record<string, unknown>, prefix: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (!prefix && INTERNAL_KEYS.has(key)) {
        continue;
      }

      if (value !== null && typeof value === 'object') {
        collectPaths(value as Record<string, unknown>, path);
      } else {
        keys.add(path);
      }
    }
  };

  for (const hit of hits) {
    collectPaths(hit, '');
  }

  return Array.from(keys).sort();
}
