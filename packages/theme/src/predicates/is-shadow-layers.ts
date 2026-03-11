import type { ShadowLayer } from '../types';

/**
 * Type predicate to check if a value is a ShadowLayer array.
 */
export function isShadowLayers(value: unknown): value is ShadowLayer[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'offsetX' in value[0] &&
    'blur' in value[0]
  );
}
