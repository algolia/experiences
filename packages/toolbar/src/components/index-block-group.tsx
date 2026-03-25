import { useId, useMemo, useState } from 'preact/hooks';

import { SlidersHorizontal, Trash2 } from 'lucide-preact';

import {
  useFacetAttributes,
  useIndexAttributes,
  useIndices,
} from '../hooks/use-indices';
import type { BlockPath, ExperienceApiBlock } from '../types';
import { BlockCard } from './block-card';
import type { SuggestLists } from './panel';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Combobox } from './ui/combobox';
import { Input } from './ui/input';

type IndexBlockGroupProps = {
  block: ExperienceApiBlock;
  parentIndex: number;
  expandedBlock: string | null;
  indexBlocks: Array<{ index: number; block: ExperienceApiBlock }>;
  suggestLists?: SuggestLists;
  onToggleExpand: (key: string) => void;
  onParameterChange: (path: BlockPath, key: string, value: unknown) => void;
  onLocate: (container: string, placement: string | undefined) => void;
  onDeleteBlock: (path: BlockPath) => void;
  onChangeWidgetIndex: (widgetPath: BlockPath, targetIndexName: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
  onNavigateToTheme?: () => void;
};

export function IndexBlockGroup({
  block,
  parentIndex,
  expandedBlock,
  indexBlocks,
  suggestLists,
  onToggleExpand,
  onParameterChange,
  onLocate,
  onDeleteBlock,
  onChangeWidgetIndex,
  onPickElement,
  onNavigateToTheme,
}: IndexBlockGroupProps) {
  const indexName = (block.parameters.indexName as string) || '';
  const indexId = block.parameters.indexId as string | undefined;
  const [showFields, setShowFields] = useState(Boolean(indexId));

  const indexNameInputId = useId();
  const replicaNames = useIndices({ type: 'replicas', target: indexName });
  const facetAttributes = useFacetAttributes(indexName);
  const indexAttributes = useIndexAttributes(indexName);
  const extendedSuggestLists: SuggestLists = useMemo(() => {
    return {
      ...suggestLists,
      'indices:replicas': replicaNames.length > 0 ? replicaNames : undefined,
      facetAttributes: facetAttributes.length > 0 ? facetAttributes : undefined,
      indexAttributes: indexAttributes.length > 0 ? indexAttributes : undefined,
    };
  }, [suggestLists, replicaNames, facetAttributes, indexAttributes]);

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
            <SlidersHorizontal class="size-3.5" />
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
            <Trash2 class="size-4" />
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
              <Combobox
                id={indexNameInputId}
                class="mt-1"
                value={indexName}
                placeholder="Index name"
                suggestions={suggestLists?.indices ?? []}
                label="Index Name"
                onInput={(value) => {
                  onParameterChange([parentIndex], 'indexName', value);
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
            onNavigateToTheme={
              child.type === 'ais.autocomplete' ? onNavigateToTheme : undefined
            }
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
            suggestLists={extendedSuggestLists}
          />
        );
      })}
    </div>
  );
}
