import type {
  ExperienceApiBlock,
  ExperienceApiBlockParameters,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { BlockEditor } from './block-editor';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

type BlockCardProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  open: boolean;
  onToggle: () => void;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onLocate: () => void;
  onDeleteBlock: () => void;
  onPickElement: (callback: (selector: string) => void) => void;
  indexBlocks?: Array<{ index: number; block: ExperienceApiBlock }>;
  parentIndex?: number;
  onMoveToIndex?: (toParentIndex: number) => void;
};

const PLACEMENT_LABELS: Record<string, string> = {
  before: 'before',
  after: 'after',
  replace: 'replaces',
};

function getBadgeInfo(parameters: ExperienceApiBlockParameters): {
  prefix: string | null;
  text: string;
} | null {
  const placement = parameters.placement as string | undefined;
  const container = parameters.container;

  if (placement === 'body') {
    return { prefix: null, text: 'body' };
  }

  if (!container) {
    return null;
  }

  const prefix =
    placement && placement !== 'inside'
      ? (PLACEMENT_LABELS[placement] ?? null)
      : null;

  return { prefix, text: container };
}

export function BlockCard({
  type,
  parameters,
  open,
  onToggle,
  onParameterChange,
  onCssVariableChange,
  onLocate,
  onDeleteBlock,
  onPickElement,
  indexBlocks,
  parentIndex,
  onMoveToIndex,
}: BlockCardProps) {
  const widgetType = WIDGET_TYPES[type];
  const label = widgetType?.label ?? type;
  const icon = widgetType?.icon;
  const badge = getBadgeInfo(parameters);

  return (
    <Card>
      <Collapsible open={open}>
        <CollapsibleTrigger
          class="w-full"
          onClick={onToggle}
          aria-expanded={open}
        >
          <CardHeader class="group w-full justify-between rounded-t-xl px-4 py-3">
            <div class="flex min-w-0 items-center gap-2.5">
              {icon && (
                <div
                  class={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${open ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  {icon}
                </div>
              )}
              <span class="shrink-0 text-sm font-semibold">{label}</span>
              {badge && (
                <Badge
                  variant="outline"
                  class="truncate justify-start max-w-36 gap-1"
                  title={
                    badge.prefix ? `${badge.prefix} ${badge.text}` : badge.text
                  }
                >
                  {badge.prefix && (
                    <span class="text-muted-foreground">{badge.prefix}</span>
                  )}
                  <span class="truncate">{badge.text}</span>
                </Badge>
              )}
            </div>
            <div class="flex items-center gap-1">
              <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {parameters.container && (
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    aria-label={`Locate ${parameters.container}`}
                    title={`Locate ${parameters.container}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onLocate();
                    }}
                  >
                    <svg
                      class="size-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M22 12h-4" />
                      <path d="M6 12H2" />
                      <path d="M12 6V2" />
                      <path d="M12 22v-4" />
                    </svg>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-destructive rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label="Delete block"
                  title="Delete block"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteBlock();
                  }}
                >
                  <svg
                    class="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </Button>
              </div>
              <svg
                class={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent open={open}>
          <CardContent class="border-t px-4 py-3">
            {indexBlocks &&
              indexBlocks.length > 1 &&
              onMoveToIndex &&
              parentIndex !== undefined && (
                <div class="mb-3">
                  <label class="block text-xs font-medium text-foreground">
                    Index
                    <select
                      class="mt-1 block w-full rounded-md border bg-transparent px-2 py-1.5 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/50"
                      value={parentIndex}
                      onChange={(e) => {
                        const target = Number(
                          (e.target as HTMLSelectElement).value
                        );
                        if (target !== parentIndex) {
                          onMoveToIndex(target);
                        }
                      }}
                    >
                      {indexBlocks.map(({ index, block }) => (
                        <option key={index} value={index}>
                          {(block.parameters.indexName as string) ||
                            `Index ${index}`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            <BlockEditor
              type={type}
              parameters={parameters}
              onParameterChange={onParameterChange}
              onCssVariableChange={onCssVariableChange}
              onPickElement={onPickElement}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
