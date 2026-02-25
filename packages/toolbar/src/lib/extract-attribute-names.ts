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

  for (const hit of hits) {
    for (const key of Object.keys(hit)) {
      if (!INTERNAL_KEYS.has(key)) {
        keys.add(key);
      }
    }
  }

  return Array.from(keys).sort();
}
