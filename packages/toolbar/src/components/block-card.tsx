import { useEffect, useState } from 'preact/hooks';

import { ChevronDown, Crosshair, Palette, Trash2 } from 'lucide-preact';

import type {
  ExperienceApiBlock,
  ExperienceApiBlockParameters,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { BlockEditor } from './block-editor';
import type { SuggestLists } from './panel';
import { InfoTooltip } from './fields/info-tooltip';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Combobox } from './ui/combobox';
import { Label } from './ui/label';

type BlockCardProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  open: boolean;
  onToggle: () => void;
  onParameterChange: (key: string, value: unknown) => void;
  onLocate: () => void;
  onDeleteBlock: () => void;
  onPickElement: (callback: (selector: string) => void) => void;
  onNavigateToTheme?: () => void;
  indexBlocks?: Array<{ index: number; block: ExperienceApiBlock }>;
  parentIndex?: number;
  parentIndexName?: string;
  onChangeIndex?: (targetIndexName: string) => void;
  onParentIndexNameChange?: (value: string) => void;
  siblingCount?: number;
  suggestLists?: SuggestLists;
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
  onLocate,
  onDeleteBlock,
  onPickElement,
  onNavigateToTheme,
  indexBlocks,
  parentIndex,
  parentIndexName,
  onChangeIndex,
  onParentIndexNameChange,
  siblingCount,
  suggestLists,
}: BlockCardProps) {
  const widgetType = WIDGET_TYPES[type];
  const label = widgetType?.label ?? type;
  const icon = widgetType?.icon;
  const badge = getBadgeInfo(parameters);
  const [indexInputValue, setIndexInputValue] = useState(parentIndexName || '');
  const [indexCommitted, setIndexCommitted] = useState(false);

  useEffect(() => {
    setIndexInputValue(parentIndexName || '');
    setIndexCommitted(false);
  }, [parentIndexName]);

  function commitIndex(value: string) {
    const trimmed = value.trim();
    if (trimmed && trimmed !== parentIndexName && !indexCommitted) {
      setIndexCommitted(true);
      onChangeIndex?.(trimmed);
    }
  }

  return (
    <Card>
      <Collapsible open={open}>
        <CollapsibleTrigger
          class="w-full"
          onClick={onToggle}
          aria-expanded={open}
        >
          <CardHeader class="group w-full justify-between rounded-t-xl px-4 py-3 hover:bg-accent/50 transition-colors">
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
                {onNavigateToTheme && (
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    aria-label="Customize theme"
                    title="Customize theme"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigateToTheme();
                    }}
                  >
                    <Palette class="size-3.5" />
                  </Button>
                )}
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
                    <Crosshair class="size-3.5" />
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
                  <Trash2 class="size-4" />
                </Button>
              </div>
              <div
                class={`flex size-6 items-center justify-center rounded-full transition-colors group-hover:bg-accent`}
              >
                <ChevronDown
                  class={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </div>
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
                    content="The Algolia index this block queries."
                    class="mt-0.5"
                  />
                </Label>
                <Combobox
                  value={indexInputValue}
                  placeholder="Index name"
                  suggestions={suggestLists?.indices ?? []}
                  label="Index"
                  onInput={(value) => {
                    setIndexInputValue(value);
                    setIndexCommitted(false);
                    if (siblingCount === 1) {
                      onParentIndexNameChange?.(value);
                    }
                  }}
                  onSelect={(value) => {
                    if (siblingCount !== 1) {
                      commitIndex(value);
                    }
                  }}
                  onBlur={() => {
                    if (siblingCount !== 1) {
                      commitIndex(indexInputValue);
                    }
                  }}
                />
              </div>
            )}
            {(parentIndex === undefined || parentIndexName) && (
              <BlockEditor
                type={type}
                parameters={parameters}
                onParameterChange={onParameterChange}
                onPickElement={onPickElement}
                parentIndexName={parentIndexName}
                suggestLists={suggestLists}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
