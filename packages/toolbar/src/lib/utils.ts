import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ExperienceApiResponse } from '../types';
import { WIDGET_TYPES } from '../widget-types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeExperience(experience: ExperienceApiResponse) {
  return {
    ...experience,
    blocks: experience.blocks.map((block) => {
      const overrides = WIDGET_TYPES[block.type]?.fieldOverrides ?? {};
      const params = { ...block.parameters };

      for (const [key, override] of Object.entries(overrides)) {
        if (override.type === 'list' && Array.isArray(params[key])) {
          const cleaned = (params[key] as string[])
            .map((item) => {
              return item.trim();
            })
            .filter(Boolean);
          params[key] = cleaned.length > 0 ? cleaned : undefined;
        }

        if (override.type === 'items-list' && Array.isArray(params[key])) {
          const cleaned = (params[key] as Array<Record<string, string>>)
            .map((item) => {
              const trimmed: Record<string, string> = {};
              for (const [field, val] of Object.entries(item)) {
                trimmed[field] = typeof val === 'string' ? val.trim() : val;
              }
              return trimmed;
            })
            .filter((item) => {
              return Object.values(item).some(Boolean);
            });
          params[key] = cleaned.length > 0 ? cleaned : undefined;
        }
      }

      return { ...block, parameters: params };
    }),
  };
}
