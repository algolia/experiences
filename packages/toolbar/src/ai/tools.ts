import type {
  AddBlockResult,
  BlockPath,
  Environment,
  ExperienceApiBlock,
  ExperienceApiResponse,
  Placement,
} from '../types';
import type { FieldConfig, IndexSuggestKind } from '../widget-types';
import { WIDGET_TYPES } from '../widget-types';
import {
  fetchSuggestions,
  suggestionSourceRequiresIndexName,
} from './suggestions';

export type ToolCallbacks = {
  onAddBlock: (type: string, targetParentIndex?: number) => AddBlockResult;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onCssVariableChange: (path: BlockPath, key: string, value: string) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onMoveBlock: (fromPath: BlockPath, toParentIndex: number) => void;
  getExperience: () => ExperienceApiResponse;
  getCredentials: () => { appId: string; apiKey: string };
  getEnv: () => Environment;
};

function getEnabledTypes() {
  return Object.entries(WIDGET_TYPES).filter(([, config]) => {
    return config.enabled;
  });
}

type SuggestAnnotation = { key?: string; kind: IndexSuggestKind };

function getSuggestAnnotations(
  field: FieldConfig | undefined
): SuggestAnnotation[] {
  if (!field) {
    return [];
  }

  if (
    (field.type === 'text' || field.type === 'list') &&
    'suggest' in field &&
    field.suggest
  ) {
    return [{ kind: field.suggest }];
  }

  if (
    (field.type === 'object' || field.type === 'items-list') &&
    'fields' in field
  ) {
    return field.fields
      .filter((nested) => {
        return 'suggest' in nested && nested.suggest;
      })
      .map((nested) => {
        return { key: nested.key, kind: nested.suggest! };
      });
  }

  return [];
}

export function describeWidgetTypes(): string {
  const enabled = getEnabledTypes();

  if (enabled.length === 0) {
    return 'No widget types are currently available.';
  }

  return enabled
    .map(([key, config]) => {
      const defaultPlacement =
        config.params.find((param) => {
          return param.key === 'placement';
        })?.default ?? 'inside';
      const visibleParams = config.params.filter((param) => {
        return (
          !param.hidden &&
          param.key !== 'container' &&
          param.key !== 'placement'
        );
      });

      let desc = `- ${key} ("${config.label}", default placement: ${defaultPlacement})`;
      if (config.description) {
        desc += `: ${config.description}`;
      }
      if (config.indexIndependent) {
        desc += ' [index-independent]';
      }

      if (visibleParams.length > 0) {
        const paramLines = visibleParams.map((param) => {
          let line = `    - ${param.key}`;
          if (param.field) {
            line += ` (${param.field.type})`;
          }
          if (param.description) {
            line += `: ${param.description}`;
          }
          const annotations = getSuggestAnnotations(param.field);
          for (const annotation of annotations) {
            if (annotation.key) {
              line += ` (${annotation.key} [suggests: ${annotation.kind}])`;
            } else {
              line += ` [suggests: ${annotation.kind}]`;
            }
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
    const children = block.children ?? [];
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
    (config?.params.find((param) => {
      return param.key === 'placement';
    })?.default as Placement | undefined) ??
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
    .filter(([param]) => {
      return param !== 'container' && param !== 'placement';
    })
    .map(([param, val]) => {
      return `${param}=${JSON.stringify(val)}`;
    })
    .join(', ');

  const paramsSuffix = params ? `: ${params}` : '';

  return `${indent}[${path}] ${label} (${block.type}) [${placementDesc}]${paramsSuffix}`;
}

export function describeExperience(experience: ExperienceApiResponse): string {
  if (experience.blocks.length === 0) {
    return 'The experience has no widgets yet.';
  }

  return experience.blocks
    .map((block, index) => {
      return describeBlock(block, String(index));
    })
    .join('\n');
}

function parsePath(path: string): BlockPath | null {
  if (!path || path.startsWith('.') || path.endsWith('.')) return null;
  const parts = path.split('.').map(Number);
  if (
    parts.some((num) => {
      return isNaN(num) || num < 0;
    })
  )
    return null;
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
  return experience.blocks[parentIdx]?.children?.[childIdx] ?? null;
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
    case 'get_suggestions':
      return `Fetched suggestions for ${input?.suggestKind ?? 'parameter'}`;
    default:
      return 'Action completed';
  }
}

function boundsError(path: string): string {
  return `Invalid path "${path}". Use get_experience to see valid widget paths.`;
}

function executeGetExperience(
  _args: Record<string, unknown>,
  callbacks: ToolCallbacks
) {
  const experience = callbacks.getExperience();
  return { state: describeExperience(experience) };
}

function executeAddWidget(
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
) {
  const type = args.type as string;
  const container = args.container as string | undefined;
  const placement = args.placement as Placement | undefined;
  const parameters = args.parameters as Record<string, unknown> | undefined;
  const target_index = args.target_index as number | undefined;

  const config = WIDGET_TYPES[type];
  const enabledKeys = getEnabledTypes().map(([key]) => {
    return key;
  });

  if (!enabledKeys.includes(type)) {
    return {
      success: false,
      error: `Unknown widget type "${type}". Available types: ${enabledKeys.join(', ')}`,
    };
  }

  const effectivePlacement: Placement =
    type === 'ais.index'
      ? 'inside'
      : (placement ??
        (config?.params.find((param) => {
          return param.key === 'placement';
        })?.default as Placement | undefined) ??
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
    ...(config?.params ?? []).map((param) => {
      return param.key;
    }),
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
}

function executeEditWidget(
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
) {
  const path = args.path as string;
  const parameters = args.parameters as Record<string, unknown>;

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
    ...(config?.params ?? []).map((param) => {
      return param.key;
    }),
    'placement',
  ]);

  const applied: string[] = [];
  const rejected: string[] = [];

  for (const [key, value] of Object.entries(parameters)) {
    if (key === 'cssVariables' && typeof value === 'object' && value !== null) {
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
}

function executeRemoveWidget(
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
) {
  const path = args.path as string;

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
}

function executeMoveWidget(
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
) {
  const path = args.path as string;
  const to_index = args.to_index as number;

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
}

type ToolExecutor = (
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
) => Record<string, unknown> | Promise<Record<string, unknown>>;

async function executeGetSuggestions(
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
): Promise<Record<string, unknown>> {
  const suggestKind = args.suggestKind as string | undefined;
  const indexName = args.indexName as string | undefined;

  if (!suggestKind) {
    return {
      success: false,
      error: 'Missing required parameter: suggestKind',
    };
  }

  if (suggestionSourceRequiresIndexName(suggestKind) && !indexName) {
    return { success: false, error: 'Missing required parameter: indexName' };
  }

  const credentials = callbacks.getCredentials();
  const env = callbacks.getEnv();
  const result = await fetchSuggestions(
    suggestKind,
    credentials,
    env,
    indexName
  );

  return result;
}

const TOOL_EXECUTORS = {
  get_experience: executeGetExperience,
  add_widget: executeAddWidget,
  edit_widget: executeEditWidget,
  remove_widget: executeRemoveWidget,
  move_widget: executeMoveWidget,
  get_suggestions: executeGetSuggestions,
} satisfies Record<string, ToolExecutor>;

type ToolName = keyof typeof TOOL_EXECUTORS;

type AgentStudioTool<Name extends ToolName = ToolName> = {
  name: Name;
  description: string;
  inputSchema: Record<string, unknown>;
  type: 'client_side';
};

export function buildToolDefinitions(): AgentStudioTool[] {
  const tools: { [Key in ToolName]: AgentStudioTool<Key> } = {
    get_experience: {
      name: 'get_experience',
      description:
        'Get the current experience state, including all widgets and their parameters. Widgets are addressed by path (e.g., "0" for top-level, "1.0" for first child of index block 1)',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      type: 'client_side',
    },
    add_widget: {
      name: 'add_widget',
      description:
        'Add a new widget. Index-dependent widgets are auto-placed inside an ais.index block. When placement is "body", no container is needed. Otherwise a container CSS selector is required.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'The widget type to add',
          },
          container: {
            type: 'string',
            description:
              'CSS selector for the container element (required unless placement is "body" or type is "ais.index")',
          },
          placement: {
            type: 'string',
            enum: ['inside', 'before', 'after', 'replace', 'body'],
            description:
              'Where to place the widget relative to the container. Uses the widget type default placement if not specified.',
          },
          parameters: {
            type: 'object',
            description: 'Additional parameters for the widget',
          },
          target_index: {
            type: 'number',
            description:
              'Index of the ais.index block to add this widget to. Only for index-dependent widgets. If omitted, uses the last index block or auto-creates one.',
          },
        },
        required: ['type'],
      },
      type: 'client_side',
    },
    edit_widget: {
      name: 'edit_widget',
      description:
        'Edit parameters of an existing widget by path (e.g., "0" for top-level, "1.0" for first child of index block 1).',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path of the widget to edit (e.g., "0", "1.0")',
          },
          parameters: {
            type: 'object',
            description: 'Parameters to update (key-value pairs)',
          },
        },
        required: ['path', 'parameters'],
      },
      type: 'client_side',
    },
    remove_widget: {
      name: 'remove_widget',
      description:
        'Remove a widget from the experience by path (e.g., "0" for top-level, "1.0" for first child of index block 1).',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path of the widget to remove (e.g., "0", "1.0")',
          },
        },
        required: ['path'],
      },
      type: 'client_side',
    },
    move_widget: {
      name: 'move_widget',
      description:
        'Move a widget between ais.index blocks. The widget must be nested (path has two parts, e.g., "1.0").',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'The path of the widget to move (e.g., "1.0" for first child of index block 1)',
          },
          to_index: {
            type: 'number',
            description:
              'The top-level index of the target ais.index block to move the widget to',
          },
        },
        required: ['path', 'to_index'],
      },
      type: 'client_side',
    },
    get_suggestions: {
      name: 'get_suggestions',
      description:
        'Get valid values for a widget parameter. Returns a list of values based on the suggestion kind from [suggests: <kind>] annotations.',
      inputSchema: {
        type: 'object',
        properties: {
          suggestKind: {
            type: 'string',
            description:
              'The suggestion kind from [suggests: <kind>] annotations (e.g., "facetAttributes", "indices", "indices:replicas")',
          },
          indexName: {
            type: 'string',
            description:
              'The Algolia index name (required for index-bound suggestion kinds like "facetAttributes", "indices:replicas", "indexAttributes")',
          },
        },
        required: ['suggestKind'],
      },
      type: 'client_side',
    },
  };

  return Object.values(tools);
}

export function buildSystemPrompt(): string {
  return `You are an AI assistant that helps users edit their Algolia Experience by adding, editing, and removing widgets.

## Available widget types

${describeWidgetTypes()}

## Placement

Each widget has a \`placement\` that controls where it renders relative to a container element:
- \`inside\` — renders inside the container (replaces its content).
- \`before\` — renders just before the container element.
- \`after\` — renders just after the container element.
- \`replace\` — replaces the container element entirely.
- \`body\` — appends to the document body (no container needed).

Each widget type has a default placement listed above. When placement is \`body\`, no container CSS selector is needed. For all other placements, a container CSS selector is required — ask the user for one if not provided.

## Rules

- When calling add_widget or edit_widget, widget-specific settings (like \`agentId\`, \`showRecent\`, \`cssVariables\`) MUST go inside the \`parameters\` field as key-value pairs, NOT as top-level arguments. Only \`type\`, \`container\`, \`placement\`, and \`target_index\` are top-level for add_widget, only \`path\` is top-level for edit_widget. When adding a widget, include all known parameters in the same call.
- Only modify parameters that are listed as editable for each widget type.
- Keep responses concise and confirm what you did after each action. Do not explain internal mechanics (index blocks, placements, paths) unless the user asks. Just ask for what you need in plain language (e.g., "Where should I place it? (CSS selector)" instead of explaining the placement system).
- Before editing or removing, ALWAYS call get_experience first to verify current widget paths and state.
- Refer to widgets by their path from get_experience results.
- If the user's request is ambiguous, ask for clarification.
- When setting a parameter marked [suggests: <kind>], ALWAYS call get_suggestions first with that suggestKind to discover valid values. For index-bound kinds (like "facetAttributes", "indices:replicas", "indexAttributes"), also pass the indexName from the relevant ais.index block.
- When filling or updating a \`template\` (item-template) parameter: first call get_experience to find the widget and its parent ais.index indexName, then call get_suggestions with suggestKind "indexAttributes" and that indexName. Match returned attributes to template slots by semantic similarity (e.g. "product_name"/"title" → name, "brand"/"product_type" → category, "description"/"short_description" → description, "image_url"/"thumbnail"/"images.0" → image, "price"/"sale_price" → price). Prefer the most specific match. Leave a slot empty ("") if no attribute is a reasonable match.`;
}

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  callbacks: ToolCallbacks
): Promise<Record<string, unknown>> {
  const executor = TOOL_EXECUTORS[toolName as keyof typeof TOOL_EXECUTORS] as
    | ToolExecutor
    | undefined;
  if (!executor) {
    return { success: false, error: `Unknown tool: ${toolName}` };
  }
  return executor(args, callbacks);
}
