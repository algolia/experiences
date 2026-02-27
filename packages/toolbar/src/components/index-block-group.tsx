import { useState } from 'preact/hooks';

import type { BlockPath, ExperienceApiBlock } from '../types';
import { BlockCard } from './block-card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
  onChangeWidgetIndex: (widgetPath: BlockPath, targetIndexName: string) => void;
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
  onChangeWidgetIndex,
  onPickElement,
}: IndexBlockGroupProps) {
  const indexName = (block.parameters.indexName as string) || '';
  const indexId = block.parameters.indexId as string | undefined;
  const [showFields, setShowFields] = useState(Boolean(indexId));

  return (
    <div class="space-y-3">
      {/* Lightweight section header */}
      <div class="group flex items-center gap-2 px-1">
        <span class="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Index
        </span>
        {indexName && (
          <Badge variant="outline" class="truncate max-w-36" title={indexName}>
            {indexName}
          </Badge>
        )}

        <div class="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {/* Edit index settings toggle */}
          <Button
            variant="ghost"
            size="icon"
            class={`text-muted-foreground rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] ${showFields ? 'bg-muted text-foreground' : 'hover:text-foreground'}`}
            aria-label="Edit index settings"
            title="Edit index settings"
            onClick={() => {
              setShowFields(!showFields);
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
              <path d="M20 7h-9" />
              <path d="M14 17H5" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
          </Button>

          {/* Delete index */}
          <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground hover:text-destructive rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            aria-label="Delete index block"
            title="Delete index block"
            onClick={() => {
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
      </div>

      {/* Index settings (animated) */}
      <div
        class="-mt-3 grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: showFields ? '1fr' : '0fr' }}
      >
        <div class="overflow-hidden">
          <div class="mt-3 space-y-2 rounded-lg border px-3 py-2.5">
            <label class="block text-xs font-medium text-foreground">
              Index Name
              <Input
                class="mt-1"
                value={indexName}
                placeholder="Index name"
                onInput={(event) => {
                  onParameterChange(
                    [parentIndex],
                    'indexName',
                    (event.target as HTMLInputElement).value
                  );
                }}
              />
            </label>
            <label class="block text-xs font-medium text-foreground">
              Index ID
              <Input
                class="mt-1"
                value={indexId ?? ''}
                placeholder="Optional widget ID"
                onInput={(event) => {
                  onParameterChange(
                    [parentIndex],
                    'indexId',
                    (event.target as HTMLInputElement).value
                  );
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Child widgets */}
      {(block.children ?? []).map((child, childIndex) => {
        return (
          <BlockCard
            key={childIndex}
            type={child.type}
            parameters={child.parameters}
            parentIndexName={indexName}
            open={expandedBlock === `${parentIndex}.${childIndex}`}
            onToggle={() => {
              return onToggleExpand(`${parentIndex}.${childIndex}`);
            }}
            onParameterChange={(key, value) => {
              return onParameterChange([parentIndex, childIndex], key, value);
            }}
            onCssVariableChange={(key, value) => {
              return onCssVariableChange([parentIndex, childIndex], key, value);
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
            onChangeIndex={(targetIndexName) => {
              return onChangeWidgetIndex(
                [parentIndex, childIndex],
                targetIndexName
              );
            }}
            onParentIndexNameChange={(value) => {
              return onParameterChange([parentIndex], 'indexName', value);
            }}
            siblingCount={block.children?.length ?? 0}
          />
        );
      })}
    </div>
  );
}
