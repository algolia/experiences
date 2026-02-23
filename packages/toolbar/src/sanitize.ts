import type { ExperienceApiResponse } from './types';
import { WIDGET_TYPES } from './widget-types';

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
      }

      return { ...block, parameters: params };
    }),
  };
}
