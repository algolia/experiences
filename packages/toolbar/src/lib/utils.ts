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
      const listParams = (WIDGET_TYPES[block.type]?.params ?? []).filter(
        (param) => {
          return (
            param.field?.type === 'list' || param.field?.type === 'items-list'
          );
        }
      );
      const blockParams = { ...block.parameters };

      for (const param of listParams) {
        const key = param.key;

        if (param.field?.type === 'list' && Array.isArray(blockParams[key])) {
          const cleaned = (blockParams[key] as string[])
            .map((item) => {
              return item.trim();
            })
            .filter(Boolean);
          blockParams[key] = cleaned.length > 0 ? cleaned : undefined;
        }

        if (
          param.field?.type === 'items-list' &&
          Array.isArray(blockParams[key])
        ) {
          const cleaned = (blockParams[key] as Array<Record<string, string>>)
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
          blockParams[key] = cleaned.length > 0 ? cleaned : undefined;
        }
      }

      return { ...block, parameters: blockParams };
    }),
  };
}

export function withAutocompleteFocus(
  experience: ExperienceApiResponse
): ExperienceApiResponse {
  const input = document.querySelector('.ais-AutocompleteInput');
  const isOpen = input?.getAttribute('aria-expanded') === 'true';

  const hasAutocomplete = experience.blocks.some((block) => {
    return block.type === 'ais.autocomplete';
  });

  if (!hasAutocomplete) return experience;

  return {
    ...experience,
    blocks: experience.blocks.map((block) => {
      if (block.type !== 'ais.autocomplete') return block;
      return {
        ...block,
        parameters: { ...block.parameters, autofocus: isOpen },
      };
    }),
  };
}
