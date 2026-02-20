import { tool } from 'ai';
import { z } from 'zod';

import type { ExperienceApiResponse, Placement } from '../types';
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
        (k) => k !== 'container' && k !== 'placement'
      );
      const overrideKeys = Object.keys(config.fieldOverrides ?? {});
      const allKeys = [...new Set([...paramKeys, ...overrideKeys])];

      const defaultPlacement = config.defaultParameters.placement ?? 'inside';
      let desc = `- ${key} ("${config.label}", default placement: ${defaultPlacement})`;
      if (config.description) {
        desc += `: ${config.description}`;
      }

      if (allKeys.length > 0) {
        const paramLines = allKeys.map((k) => {
          const override = config.fieldOverrides?.[k];
          const paramDesc = config.paramDescriptions?.[k];
          let line = `    - ${k}`;
          if (override) {
            line += ` (${override.type})`;
          }
          if (paramDesc) {
            line += `: ${paramDesc}`;
          }

          return line;
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
      const placement: Placement =
        block.parameters.placement ??
        (config?.defaultParameters.placement as Placement | undefined) ??
        'inside';
      const container = block.parameters.container as string | undefined;

      let placementDesc: string;
      if (placement === 'body') {
        placementDesc = 'body';
      } else if (container) {
        placementDesc = `${placement} ${container}`;
      } else {
        placementDesc = placement;
      }

      const params = Object.entries(block.parameters)
        .filter(([k]) => k !== 'container' && k !== 'placement')
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');

      const paramsSuffix = params ? `: ${params}` : '';

      return `[${index}] ${label} (${block.type}) [${placementDesc}]${paramsSuffix}`;
    })
    .join('\n');
}

export function describeToolAction(
  toolName: string,
  input: Record<string, unknown> | undefined,
  output: Record<string, unknown> | undefined
): string {
  switch (toolName) {
    case 'get_experience':
      return 'Checked experience state';
    case 'add_widget': {
      const widgetType = input?.type ?? 'widget';
      const placement = input?.placement as string | undefined;
      const container = input?.container as string | undefined;

      if (placement === 'body') {
        return `Added ${widgetType} to body`;
      }
      if (placement && placement !== 'inside' && container) {
        return `Added ${widgetType} ${placement} ${container}`;
      }
      return `Added ${widgetType}${container ? ` to ${container}` : ''}`;
    }
    case 'edit_widget': {
      const applied = output?.applied;
      const desc = `Edited widget ${input?.index ?? ''}`;
      if (Array.isArray(applied) && applied.length > 0) {
        return `${desc} — ${applied.join(', ')}`;
      }
      return desc;
    }
    case 'remove_widget':
      return `Removed widget ${input?.index ?? ''}`;
    default:
      return 'Action completed';
  }
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
        'Add a new widget to the experience. When placement is "body", no container is needed. For other placements, a container CSS selector is required.',
      inputSchema: z.object({
        type: typeEnum.describe('The widget type to add'),
        container: z
          .string()
          .optional()
          .describe(
            'CSS selector for the container element (required unless placement is "body")'
          ),
        placement: z
          .enum<
            Placement,
            [Placement, ...Placement[]]
          >(['inside', 'before', 'after', 'replace', 'body'])
          .optional()
          .describe(
            'Where to place the widget relative to the container. Uses the widget type default placement if not specified.'
          ),
        parameters: z
          .record(z.unknown())
          .optional()
          .describe('Additional parameters for the widget'),
      }),
      execute: async ({ type, container, placement, parameters }) => {
        const experience = callbacks.getExperience();
        const newIndex = experience.blocks.length;

        const config = WIDGET_TYPES[type];
        const allowedKeys = new Set([
          ...Object.keys(config?.defaultParameters ?? {}),
          ...Object.keys(config?.fieldOverrides ?? {}),
          'placement',
        ]);

        const effectivePlacement: Placement =
          placement ??
          (config?.defaultParameters.placement as Placement | undefined) ??
          'inside';

        callbacks.onAddBlock(type);

        const applied: string[] = [];
        const rejected: string[] = [];

        if (
          effectivePlacement !== 'body' &&
          !container &&
          !parameters?.container
        ) {
          return {
            success: false,
            error: `A container CSS selector is required when placement is "${effectivePlacement}".`,
          };
        }

        callbacks.onParameterChange(newIndex, 'placement', effectivePlacement);
        applied.push('placement');

        if (container) {
          callbacks.onParameterChange(newIndex, 'container', container);
          applied.push('container');
        }

        if (parameters) {
          for (const [key, value] of Object.entries(parameters)) {
            if (key === 'container' || key === 'placement') continue;
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
          placement: effectivePlacement,
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
          'placement',
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
