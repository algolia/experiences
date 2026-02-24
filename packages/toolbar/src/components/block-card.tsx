import { useState } from 'preact/hooks';

import type {
  ExperienceApiBlock,
  ExperienceApiBlockParameters,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { BlockEditor } from './block-editor';
import { InfoTooltip } from './fields/info-tooltip';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
  parentIndexName?: string;
  onChangeIndex?: (targetIndexName: string) => void;
  onParentIndexNameChange?: (value: string) => void;
  siblingCount?: number;
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
  parentIndexName,
  onChangeIndex,
  onParentIndexNameChange,
  siblingCount,
}: BlockCardProps) {
  const widgetType = WIDGET_TYPES[type];
  const label = widgetType?.label ?? type;
  const icon = widgetType?.icon;
  const badge = getBadgeInfo(parameters);
  const [indexInputValue, setIndexInputValue] = useState('');
  const [isEditingIndex, setIsEditingIndex] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const indexSuggestions = (indexBlocks ?? []).filter(
    ({ block: indexBlock, index }) => {
      const name = (indexBlock.parameters.indexName as string) || '';
      return (
        index !== parentIndex &&
        name &&
        name.toLowerCase().includes(indexInputValue.toLowerCase())
      );
    }
  );

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
            {indexBlocks && onChangeIndex && parentIndex !== undefined && (
              <div class="mb-3 space-y-1">
                <Label>
                  Index
                  <InfoTooltip
                    content="The Algolia index this widget queries."
                    class="mt-0.5"
                  />
                </Label>
                <div class="relative">
                  <Input
                    value={
                      isEditingIndex ? indexInputValue : parentIndexName || ''
                    }
                    placeholder="Index name"
                    onFocus={() => {
                      setIndexInputValue(parentIndexName || '');
                      setIsEditingIndex(true);
                      setShowSuggestions(true);
                    }}
                    onInput={(event) => {
                      const value = (event.target as HTMLInputElement).value;
                      setIndexInputValue(value);
                      setShowSuggestions(true);
                      // Live-rename when this is the only widget in the index
                      if (siblingCount === 1) {
                        onParentIndexNameChange?.(value);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        (event.target as HTMLInputElement).blur();
                      } else if (event.key === 'Escape') {
                        setIsEditingIndex(false);
                        setShowSuggestions(false);
                        setIndexInputValue('');
                      }
                    }}
                    onBlur={() => {
                      const value = indexInputValue.trim();
                      if (
                        value &&
                        value !== parentIndexName &&
                        siblingCount !== 1
                      ) {
                        onChangeIndex(value);
                      }
                      setIsEditingIndex(false);
                      setShowSuggestions(false);
                      setIndexInputValue('');
                    }}
                  />
                  {showSuggestions && indexSuggestions.length > 0 && (
                    <div class="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
                      {indexSuggestions.map(({ block: suggBlock, index }) => {
                        const name =
                          (suggBlock.parameters.indexName as string) ||
                          `Index ${index}`;
                        return (
                          <button
                            key={index}
                            type="button"
                            class="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              onChangeIndex(name);
                              setIsEditingIndex(false);
                              setShowSuggestions(false);
                              setIndexInputValue('');
                            }}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {(parentIndex === undefined || parentIndexName) && (
              <BlockEditor
                type={type}
                parameters={parameters}
                onParameterChange={onParameterChange}
                onCssVariableChange={onCssVariableChange}
                onPickElement={onPickElement}
                parentIndexName={parentIndexName}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
