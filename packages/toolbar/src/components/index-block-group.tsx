import type { BlockPath, ExperienceApiBlock } from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { AddWidgetPopover } from './add-widget-popover';
import { BlockCard } from './block-card';
import { BlockEditor } from './block-editor';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

type IndexBlockGroupProps = {
  block: ExperienceApiBlock;
  parentIndex: number;
  expandedBlock: string | null;
  indexBlocks: Array<{ index: number; block: ExperienceApiBlock }>;
  onToggleExpand: (key: string) => void;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onCssVariableChange: (path: BlockPath, key: string, value: string) => void;
  onLocate: (container: string, placement: string | undefined) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onAddBlock: (type: string, targetParentIndex?: number) => void;
  onMoveBlock: (fromPath: BlockPath, toParentIndex: number) => void;
  onPickElement: (callback: (selector: string) => void) => void;
};

export function IndexBlockGroup({
  block,
  parentIndex,
  expandedBlock,
  indexBlocks,
  onToggleExpand,
  onParameterChange,
  onCssVariableChange,
  onLocate,
  onDeleteBlock,
  onAddBlock,
  onMoveBlock,
  onPickElement,
}: IndexBlockGroupProps) {
  const groupKey = String(parentIndex);
  const isOpen =
    expandedBlock?.startsWith(`${groupKey}.`) || expandedBlock === groupKey;
  const indexName = (block.parameters.indexName as string) || '';
  const Icon = WIDGET_TYPES['ais.index']?.icon;

  return (
    <div class="rounded-xl border-2 border-primary/20 bg-primary/[0.02]">
      <Collapsible open={isOpen}>
        <CollapsibleTrigger
          class="w-full"
          onClick={() => {
            return onToggleExpand(groupKey);
          }}
          aria-expanded={isOpen}
        >
          <div class="group flex w-full items-center justify-between px-4 py-3">
            <div class="flex min-w-0 items-center gap-2.5">
              {Icon && (
                <div class="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon />
                </div>
              )}
              <span class="shrink-0 text-sm font-semibold">Index</span>
              {indexName && (
                <Badge
                  variant="outline"
                  class="truncate max-w-36"
                  title={indexName}
                >
                  {indexName}
                </Badge>
              )}
            </div>
            <div class="flex items-center gap-1">
              <div class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-destructive rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  aria-label="Delete index block"
                  title="Delete index block"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteBlock([parentIndex]);
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
                class={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent open={isOpen}>
          <div class="border-t px-3 py-3 space-y-3">
            {/* Index block parameters */}
            <div class="rounded-lg border bg-background px-3 py-2.5">
              <BlockEditor
                type="ais.index"
                parameters={block.parameters}
                onParameterChange={(key, value) => {
                  return onParameterChange([parentIndex], key, value);
                }}
                onCssVariableChange={(key, value) => {
                  return onCssVariableChange([parentIndex], key, value);
                }}
                onPickElement={onPickElement}
              />
            </div>

            {/* Child widgets */}
            {(block.blocks ?? []).map((child, childIndex) => {
              return (
                <BlockCard
                  key={childIndex}
                  type={child.type}
                  parameters={child.parameters}
                  open={expandedBlock === `${parentIndex}.${childIndex}`}
                  onToggle={() => {
                    return onToggleExpand(`${parentIndex}.${childIndex}`);
                  }}
                  onParameterChange={(key, value) => {
                    return onParameterChange(
                      [parentIndex, childIndex],
                      key,
                      value
                    );
                  }}
                  onCssVariableChange={(key, value) => {
                    return onCssVariableChange(
                      [parentIndex, childIndex],
                      key,
                      value
                    );
                  }}
                  onLocate={() => {
                    return onLocate(
                      child.parameters.container ?? '',
                      child.parameters.placement as string | undefined
                    );
                  }}
                  onDeleteBlock={() => {
                    return onDeleteBlock([parentIndex, childIndex]);
                  }}
                  onPickElement={onPickElement}
                  indexBlocks={indexBlocks}
                  parentIndex={parentIndex}
                  onMoveToIndex={(toParentIndex) => {
                    return onMoveBlock(
                      [parentIndex, childIndex],
                      toParentIndex
                    );
                  }}
                />
              );
            })}

            {/* Scoped add widget */}
            <AddWidgetPopover
              onSelect={(type) => {
                return onAddBlock(type, parentIndex);
              }}
              filter={(type) => {
                return type !== 'ais.index';
              }}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
