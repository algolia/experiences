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
      const paramKeys = Object.keys(config.defaultParameters).filter(
        (k) => k !== 'container'
      );
      const overrideKeys = Object.keys(config.fieldOverrides ?? {});
      const allKeys = [...new Set([...paramKeys, ...overrideKeys])];

      let desc = `- ${key} ("${config.label}")`;
      if (config.description) {
        desc += `: ${config.description}`;
      }

      if (allKeys.length > 0) {
        const paramLines = allKeys.flatMap((k) => {
          const override = config.fieldOverrides?.[k];
          const paramDesc = config.paramDescriptions?.[k];
          let line = `    - ${k}`;
          if (override) {
            line += ` (${override.type})`;
          }
          if (paramDesc) {
            line += `: ${paramDesc}`;
          }

          const lines = [line];

          if (k === 'cssVariables' && config.cssVariableDescriptions) {
            for (const [varName, varDesc] of Object.entries(
              config.cssVariableDescriptions
            )) {
              lines.push(`      - ${varName}: ${varDesc}`);
            }
          }

          return lines;
        });
        desc += `\n  Parameters:\n${paramLines.join('\n')}`;
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

      const cssVars = block.parameters.cssVariables ?? {};
      const cssEntries = Object.entries(cssVars);
      const cssStr =
        cssEntries.length > 0
          ? `, cssVariables: { ${cssEntries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ')} }`
          : '';

      return `[${index}] ${label} (${block.type}): ${params}${cssStr}`;
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
        cssVariables: z
          .record(z.string())
          .optional()
          .describe(
            'CSS variables for theming (e.g. { "primary-color-rgb": "255, 0, 0" })'
          ),
      }),
      execute: async ({ type, container, parameters, cssVariables }) => {
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
            if (key === 'container' || key === 'cssVariables') continue;
            if (allowedKeys.has(key)) {
              callbacks.onParameterChange(newIndex, key, value);
              applied.push(key);
            } else {
              rejected.push(key);
            }
          }
        }

        if (cssVariables) {
          for (const [cssKey, cssValue] of Object.entries(cssVariables)) {
            callbacks.onCssVariableChange(newIndex, cssKey, cssValue);
            applied.push(`cssVariables.${cssKey}`);
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
        'Edit parameters or CSS variables of an existing widget. Use the cssVariables field for theming changes (colors, etc.).',
      inputSchema: z.object({
        index: z.number().describe('The index of the widget to edit'),
        parameters: z
          .record(z.unknown())
          .optional()
          .describe('Parameters to update (key-value pairs)'),
        cssVariables: z
          .record(z.string())
          .optional()
          .describe(
            'CSS variables to update (e.g. { "primary-color-rgb": "255, 0, 0" })'
          ),
      }),
      execute: async ({ index, parameters, cssVariables }) => {
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

        if (parameters) {
          for (const [key, value] of Object.entries(parameters)) {
            if (key === 'cssVariables') continue;
            if (allowedKeys.has(key)) {
              callbacks.onParameterChange(index, key, value);
              applied.push(key);
            } else {
              rejected.push(key);
            }
          }
        }

        if (cssVariables) {
          for (const [cssKey, cssValue] of Object.entries(cssVariables)) {
            callbacks.onCssVariableChange(index, cssKey, cssValue);
            applied.push(`cssVariables.${cssKey}`);
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
