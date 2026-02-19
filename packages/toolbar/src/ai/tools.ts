import { tool } from 'ai';
import { z } from 'zod';

import type { ExperienceApiResponse } from '../types';
import { WIDGET_TYPES } from '../widget-types';

export type ToolCallbacks = {
  onAddBlock: (type: string) => void;
  onParameterChange: (index: number, key: string, value: unknown) => void;
  onCssVariableChange: (index: number, key: string, value: string) => void;
  onDeleteBlock: (index: number) => void;
  getExperience: () => ExperienceApiResponse;
};

function getEnabledTypes() {
  return Object.entries(WIDGET_TYPES).filter(([, config]) => config.enabled);
}

export function describeWidgetTypes(): string {
  const enabled = getEnabledTypes();

  if (enabled.length === 0) {
    return 'No widget types are currently available.';
  }

  return enabled
    .map(([key, config]) => {
      const params = Object.keys(config.defaultParameters).filter(
        (k) => k !== 'container'
      );
      const overrides = config.fieldOverrides
        ? Object.entries(config.fieldOverrides).map(
            ([k, override]) => `${k} (${override.type}: ${override.label})`
          )
        : [];

      const editableParams = [
        ...params,
        ...overrides.filter((o) => !params.some((p) => o.startsWith(p))),
      ];

      let desc = `- ${key} ("${config.label}")`;
      if (editableParams.length > 0) {
        desc += `\n  Editable parameters: ${editableParams.join(', ')}`;
      }

      return desc;
    })
    .join('\n');
}

export function describeExperience(experience: ExperienceApiResponse): string {
  if (experience.blocks.length === 0) {
    return 'The experience has no widgets yet.';
  }

  return experience.blocks
    .map((block, index) => {
      const config = WIDGET_TYPES[block.type];
      const label = config?.label ?? block.type;
      const params = Object.entries(block.parameters)
        .filter(([k]) => k !== 'cssVariables')
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');

      return `[${index}] ${label} (${block.type}): ${params}`;
    })
    .join('\n');
}

function boundsError(index: number, count: number): string {
  if (count === 0) {
    return `Invalid index ${index}. The experience has no widgets.`;
  }

  return `Invalid index ${index}. Experience has ${count} widget(s) (indices 0–${count - 1}).`;
}

export function getTools(callbacks: ToolCallbacks) {
  const enabledKeys = getEnabledTypes().map(([key]) => key);
  const typeEnum = z.enum(enabledKeys as [string, ...string[]]);

  return {
    get_experience: tool({
      description:
        'Get the current experience state, including all widgets and their parameters.',
      inputSchema: z.object({}),
      execute: async () => {
        const experience = callbacks.getExperience();
        return { state: describeExperience(experience) };
      },
    }),

    add_widget: tool({
      description:
        'Add a new widget to the experience. Always ask the user for the container CSS selector if not provided.',
      inputSchema: z.object({
        type: typeEnum.describe('The widget type to add'),
        container: z
          .string()
          .describe('CSS selector for the container element'),
        parameters: z
          .record(z.unknown())
          .optional()
          .describe('Additional parameters for the widget'),
      }),
      execute: async ({ type, container, parameters }) => {
        const experience = callbacks.getExperience();
        const newIndex = experience.blocks.length;

        const config = WIDGET_TYPES[type];
        const allowedKeys = new Set([
          ...Object.keys(config?.defaultParameters ?? {}),
          ...Object.keys(config?.fieldOverrides ?? {}),
        ]);

        callbacks.onAddBlock(type);
        callbacks.onParameterChange(newIndex, 'container', container);

        const applied: string[] = ['container'];
        const rejected: string[] = [];

        if (parameters) {
          for (const [key, value] of Object.entries(parameters)) {
            if (key === 'container') continue;
            if (allowedKeys.has(key)) {
              callbacks.onParameterChange(newIndex, key, value);
              applied.push(key);
            } else {
              rejected.push(key);
            }
          }
        }

        return {
          success: true,
          index: newIndex,
          type,
          container,
          applied,
          rejected,
        };
      },
    }),

    edit_widget: tool({
      description:
        'Edit parameters of an existing widget. Only modify allowed parameters.',
      inputSchema: z.object({
        index: z.number().describe('The index of the widget to edit'),
        parameters: z
          .record(z.unknown())
          .describe('Parameters to update (key-value pairs)'),
      }),
      execute: async ({ index, parameters }) => {
        const experience = callbacks.getExperience();

        if (index < 0 || index >= experience.blocks.length) {
          return {
            success: false,
            error: boundsError(index, experience.blocks.length),
          };
        }

        const block = experience.blocks[index]!;
        const config = WIDGET_TYPES[block.type];
        const allowedKeys = new Set([
          ...Object.keys(config?.defaultParameters ?? {}),
          ...Object.keys(config?.fieldOverrides ?? {}),
        ]);

        const applied: string[] = [];
        const rejected: string[] = [];

        for (const [key, value] of Object.entries(parameters)) {
          if (
            key === 'cssVariables' &&
            typeof value === 'object' &&
            value !== null
          ) {
            for (const [cssKey, cssValue] of Object.entries(
              value as Record<string, string>
            )) {
              callbacks.onCssVariableChange(index, cssKey, cssValue);
              applied.push(`cssVariables.${cssKey}`);
            }
          } else if (allowedKeys.has(key)) {
            callbacks.onParameterChange(index, key, value);
            applied.push(key);
          } else {
            rejected.push(key);
          }
        }

        return { success: true, index, applied, rejected };
      },
    }),

    remove_widget: tool({
      description: 'Remove a widget from the experience by its index.',
      inputSchema: z.object({
        index: z.number().describe('The index of the widget to remove'),
      }),
      execute: async ({ index }) => {
        const experience = callbacks.getExperience();

        if (index < 0 || index >= experience.blocks.length) {
          return {
            success: false,
            error: boundsError(index, experience.blocks.length),
          };
        }

        const block = experience.blocks[index]!;
        callbacks.onDeleteBlock(index);

        return { success: true, removedType: block.type, removedIndex: index };
      },
    }),
  };
}
