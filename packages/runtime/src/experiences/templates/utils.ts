import type { Hit } from 'instantsearch.js/es/types';

export const SKELETON_CSS = `
@keyframes shimmer {
  0% { background-position-x: 200%; }
  100% { background-position-x: 0%; }
}
.algolia-experiences-skeleton {
  border-radius: 4px;
  background: linear-gradient(100deg, #e8e8e8, #e8e8e8 50%, #fff 60%, #e8e8e8 70%);
  background-size: 200% 100%;
  background-attachment: fixed;
  animation: shimmer 2s ease-out infinite;
}
`;

export function getByPath(hit: Hit, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    return current != null && typeof current === 'object'
      ? (current as Record<string, unknown>)[segment]
      : undefined;
  }, hit);
}

export function hasAttributes(template: Record<string, string>): boolean {
  return Object.entries(template).some(([key, value]) => {
    return key !== 'currency' && value !== '';
  });
}
