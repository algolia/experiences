import { tool } from 'ai';
import { z } from 'zod';

import type {
  AddBlockResult,
  BlockPath,
  ExperienceApiBlock,
  ExperienceApiResponse,
  Placement,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';

export type ToolCallbacks = {
  onAddBlock: (type: string, targetParentIndex?: number) => AddBlockResult;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onCssVariableChange: (path: BlockPath, key: string, value: string) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onMoveBlock: (fromPath: BlockPath, toParentIndex: number) => void;
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
      if (config.indexIndependent) {
        desc += ' [index-independent]';
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

function describeBlock(
  block: ExperienceApiBlock,
  path: string,
  indent: string = ''
): string {
  const config = WIDGET_TYPES[block.type];
  const label = config?.label ?? block.type;

  if (block.type === 'ais.index') {
    const indexName = block.parameters.indexName || '(unnamed)';
    const indexId = block.parameters.indexId;
    const children = block.blocks ?? [];
    let desc = `${indent}[${path}] Index (ais.index) — indexName: ${indexName}`;
    if (indexId) {
      desc += `, indexId: ${indexId}`;
    }

    if (children.length === 0) {
      desc += ' (empty)';
    } else {
      children.forEach((child, j) => {
        desc += '\n' + describeBlock(child, `${path}.${j}`, indent + '  ');
      });
    }

    return desc;
  }

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

  return `${indent}[${path}] ${label} (${block.type}) [${placementDesc}]${paramsSuffix}`;
}

export function describeExperience(experience: ExperienceApiResponse): string {
  if (experience.blocks.length === 0) {
    return 'The experience has no widgets yet.';
  }

  return experience.blocks
    .map((block, index) => describeBlock(block, String(index)))
    .join('\n');
}

function parsePath(path: string): BlockPath | null {
  if (!path || path.startsWith('.') || path.endsWith('.')) return null;
  const parts = path.split('.').map(Number);
  if (parts.some((n) => isNaN(n) || n < 0)) return null;
  if (parts.length === 1) return [parts[0]] as BlockPath;
  if (parts.length === 2) return [parts[0], parts[1]] as BlockPath;
  return null;
}

function resolveBlock(
  experience: ExperienceApiResponse,
  path: BlockPath
): ExperienceApiBlock | null {
  if (path.length === 1) {
    return experience.blocks[path[0]] ?? null;
  }
  const [parentIdx, childIdx] = path;
  return experience.blocks[parentIdx]?.blocks?.[childIdx] ?? null;
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
      const desc = `Edited widget ${input?.path ?? ''}`;
      if (Array.isArray(applied) && applied.length > 0) {
        return `${desc} — ${applied.join(', ')}`;
      }
      return desc;
    }
    case 'remove_widget':
      return `Removed widget ${input?.path ?? ''}`;
    case 'move_widget':
      return `Moved widget ${input?.path ?? ''} to index ${input?.to_index ?? ''}`;
    default:
      return 'Action completed';
  }
}

function boundsError(path: string): string {
  return `Invalid path "${path}". Use get_experience to see valid widget paths.`;
}

export function getTools(callbacks: ToolCallbacks) {
  const enabledKeys = getEnabledTypes().map(([key]) => key);
  const typeEnum = z.enum(enabledKeys as [string, ...string[]]);

  return {
    get_experience: tool({
      description:
        'Get the current experience state, including all widgets and their parameters. Widgets are addressed by path (e.g., "0" for top-level, "1.0" for first child of index block 1).',
      inputSchema: z.object({}),
      execute: async () => {
        const experience = callbacks.getExperience();
        return { state: describeExperience(experience) };
      },
    }),

    add_widget: tool({
      description:
        'Add a new widget to the experience. Index-dependent widgets (all except ais.chat, ais.autocomplete, ais.index) are automatically placed inside an ais.index block. When placement is "body", no container is needed. For other placements, a container CSS selector is required.',
      inputSchema: z.object({
        type: typeEnum.describe('The widget type to add'),
        container: z
          .string()
          .optional()
          .describe(
            'CSS selector for the container element (required unless placement is "body" or type is "ais.index")'
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
        target_index: z
          .number()
          .optional()
          .describe(
            'Index of the ais.index block to add this widget to. Only for index-dependent widgets. If omitted, uses the last index block or auto-creates one.'
          ),
      }),
      execute: async ({
        type,
        container,
        placement,
        parameters,
        target_index,
      }) => {
        const config = WIDGET_TYPES[type];

        // Validate container before mutating state
        const effectivePlacement: Placement =
          type === 'ais.index'
            ? 'inside'
            : (placement ??
              (config?.defaultParameters.placement as Placement | undefined) ??
              'inside');

        if (
          type !== 'ais.index' &&
          effectivePlacement !== 'body' &&
          !container &&
          !parameters?.container
        ) {
          return {
            success: false,
            error: `A container CSS selector is required when placement is "${effectivePlacement}".`,
          };
        }

        if (target_index !== undefined) {
          const experience = callbacks.getExperience();
          const targetBlock = experience.blocks[target_index];
          if (!targetBlock || targetBlock.type !== 'ais.index') {
            return {
              success: false,
              error: `Target index ${target_index} is not an ais.index block.`,
            };
          }
        }

        const result = callbacks.onAddBlock(type, target_index);
        const newPath = result.path;

        if (type === 'ais.index') {
          if (parameters) {
            for (const [key, value] of Object.entries(parameters)) {
              callbacks.onParameterChange(newPath, key, value);
            }
          }

          return { success: true, path: newPath.join('.'), type };
        }

        const allowedKeys = new Set([
          ...Object.keys(config?.defaultParameters ?? {}),
          ...Object.keys(config?.fieldOverrides ?? {}),
          'placement',
        ]);

        const applied: string[] = [];
        const rejected: string[] = [];

        callbacks.onParameterChange(newPath, 'placement', effectivePlacement);
        applied.push('placement');

        if (container) {
          callbacks.onParameterChange(newPath, 'container', container);
          applied.push('container');
        }

        if (parameters) {
          for (const [key, value] of Object.entries(parameters)) {
            if (key === 'container' || key === 'placement') continue;
            if (allowedKeys.has(key)) {
              callbacks.onParameterChange(newPath, key, value);
              applied.push(key);
            } else {
              rejected.push(key);
            }
          }
        }

        return {
          success: true,
          path: newPath.join('.'),
          type,
          placement: effectivePlacement,
          container,
          applied,
          rejected,
          ...(result.indexCreated && {
            note: `An ais.index block was auto-created at path ${newPath[0]} but has no indexName. Ask the user which Algolia index to target, then use edit_widget to set it.`,
          }),
        };
      },
    }),

    edit_widget: tool({
      description:
        'Edit parameters of an existing widget. Address widgets by path (e.g., "0" for top-level, "1.0" for first child of index block 1).',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path of the widget to edit (e.g., "0", "1.0")'),
        parameters: z
          .record(z.unknown())
          .describe('Parameters to update (key-value pairs)'),
      }),
      execute: async ({ path, parameters }) => {
        const experience = callbacks.getExperience();
        const blockPath = parsePath(path);

        if (!blockPath) {
          return { success: false, error: boundsError(path) };
        }

        const block = resolveBlock(experience, blockPath);
        if (!block) {
          return { success: false, error: boundsError(path) };
        }

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
              callbacks.onCssVariableChange(blockPath, cssKey, cssValue);
              applied.push(`cssVariables.${cssKey}`);
            }
          } else if (allowedKeys.has(key)) {
            callbacks.onParameterChange(blockPath, key, value);
            applied.push(key);
          } else {
            rejected.push(key);
          }
        }

        return { success: true, path, applied, rejected };
      },
    }),

    remove_widget: tool({
      description:
        'Remove a widget from the experience by its path (e.g., "0" for top-level, "1.0" for first child of index block 1).',
      inputSchema: z.object({
        path: z
          .string()
          .describe('The path of the widget to remove (e.g., "0", "1.0")'),
      }),
      execute: async ({ path }) => {
        const experience = callbacks.getExperience();
        const blockPath = parsePath(path);

        if (!blockPath) {
          return { success: false, error: boundsError(path) };
        }

        const block = resolveBlock(experience, blockPath);
        if (!block) {
          return { success: false, error: boundsError(path) };
        }

        callbacks.onDeleteBlock(blockPath);

        return { success: true, removedType: block.type, removedPath: path };
      },
    }),

    move_widget: tool({
      description:
        'Move a widget from one ais.index block to another. The widget must be inside an index block (path has two parts, e.g., "1.0").',
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            'The path of the widget to move (e.g., "1.0" for first child of index block 1)'
          ),
        to_index: z
          .number()
          .describe(
            'The top-level index of the target ais.index block to move the widget to'
          ),
      }),
      execute: async ({ path, to_index }) => {
        const experience = callbacks.getExperience();
        const blockPath = parsePath(path);

        if (!blockPath || blockPath.length !== 2) {
          return {
            success: false,
            error: `Invalid path "${path}". Only nested widgets (e.g., "1.0") can be moved between index blocks.`,
          };
        }

        const block = resolveBlock(experience, blockPath);
        if (!block) {
          return { success: false, error: boundsError(path) };
        }

        const targetBlock = experience.blocks[to_index];
        if (!targetBlock || targetBlock.type !== 'ais.index') {
          return {
            success: false,
            error: `Target index ${to_index} is not an ais.index block.`,
          };
        }

        callbacks.onMoveBlock(blockPath, to_index);

        return { success: true, movedType: block.type, from: path, to_index };
      },
    }),
  };
}
