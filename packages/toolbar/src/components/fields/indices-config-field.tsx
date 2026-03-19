import { useRef, useState } from 'preact/hooks';

import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-preact';

import { useIndices } from '../../hooks/use-indices';
import { InfoTooltip } from './info-tooltip';
import { ItemTemplateField } from './item-template-field';
import { JsonField } from './json-field';
import { Button } from '../ui/button';
import { Combobox } from '../ui/combobox';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type StoredIndexEntry = {
  indexName: string;
  hitsPerPage?: number;
  templates?: {
    header?: string;
    item?: Record<string, string>;
    noResults?: string;
  };
  searchParameters?: Record<string, unknown>;
};

type IndicesConfigFieldProps = {
  label: string;
  entries: StoredIndexEntry[];
  onChange: (entries: StoredIndexEntry[]) => void;
};

const ITEM_TEMPLATE_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'image', label: 'Image' },
  { key: 'price', label: 'Price' },
  { key: 'currency', label: 'Currency' },
];

export function IndicesConfigField({
  label,
  entries,
  onChange,
}: IndicesConfigFieldProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const newEntryRef = useRef<HTMLDivElement>(null);
  const keyCounterRef = useRef(entries.length);
  const [entryKeys, setEntryKeys] = useState<number[]>(() => {
    return entries.map((_, i) => {
      return i;
    });
  });

  const nonQsIndices = useIndices({ type: 'indices' });
  const indexSuggestions = nonQsIndices;

  function updateEntry(index: number, patch: Partial<StoredIndexEntry>) {
    const updated = entries.map((entry, idx) => {
      return idx === index ? { ...entry, ...patch } : entry;
    });
    onChange(updated);
  }

  function removeEntry(index: number) {
    onChange(
      entries.filter((_, idx) => {
        return idx !== index;
      })
    );
    setEntryKeys((prev) => {
      return prev.filter((_, idx) => {
        return idx !== index;
      });
    });
    setExpandedIndex((prev) => {
      if (prev === index) return null;
      if (prev !== null && prev > index) return prev - 1;
      return prev;
    });
  }

  function addEntry() {
    onChange([...entries, { indexName: '', hitsPerPage: 5 }]);
    const newKey = keyCounterRef.current++;
    setEntryKeys((prev) => {
      return [...prev, newKey];
    });
    setExpandedIndex(entries.length);
    requestAnimationFrame(() => {
      const combobox = newEntryRef.current?.querySelector<HTMLInputElement>(
        'input[role="combobox"]'
      );
      combobox?.focus();
    });
  }

  function onDragStart(index: number, event: DragEvent) {
    event.dataTransfer?.setData('text/plain', '');
    setDragSourceIndex(index);
  }

  function onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    setDropTargetIndex(index);
  }

  function onDrop(index: number) {
    if (dragSourceIndex === null || dragSourceIndex === index) {
      setDragSourceIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const reordered = [...entries];
    const moved = reordered.splice(dragSourceIndex, 1)[0];
    reordered.splice(index, 0, moved!);
    onChange(reordered);

    setEntryKeys((prev) => {
      const reorderedKeys = [...prev];
      const movedKey = reorderedKeys.splice(dragSourceIndex, 1)[0];
      reorderedKeys.splice(index, 0, movedKey!);
      return reorderedKeys;
    });

    if (expandedIndex === dragSourceIndex) {
      setExpandedIndex(index);
    } else if (expandedIndex !== null) {
      let newExpanded = expandedIndex;
      if (dragSourceIndex < expandedIndex && index >= expandedIndex) {
        newExpanded = expandedIndex - 1;
      } else if (dragSourceIndex > expandedIndex && index <= expandedIndex) {
        newExpanded = expandedIndex + 1;
      }
      setExpandedIndex(newExpanded);
    }

    setDragSourceIndex(null);
    setDropTargetIndex(null);
  }

  function onDragEnd() {
    setDragSourceIndex(null);
    setDropTargetIndex(null);
  }

  return (
    <div class="space-y-1.5">
      <Label>{label}</Label>

      {entries.length === 0 && (
        <p class="text-xs text-muted-foreground">
          No additional indices configured.
        </p>
      )}

      {entries.map((entry, index) => {
        const isExpanded = expandedIndex === index;
        const isDragOver =
          dropTargetIndex === index && dragSourceIndex !== index;

        return (
          <div
            key={entryKeys[index]}
            ref={index === entries.length - 1 ? newEntryRef : undefined}
            class={`rounded-md border border-border ${isDragOver ? 'border-primary' : ''} ${dragSourceIndex === index ? 'opacity-50' : ''}`}
            onDragOver={(event: DragEvent) => {
              return onDragOver(event, index);
            }}
            onDrop={() => {
              return onDrop(index);
            }}
            onDragEnd={onDragEnd}
          >
            <CollapsibleTrigger
              class="w-full justify-between px-2.5 py-2"
              onClick={() => {
                return setExpandedIndex(isExpanded ? null : index);
              }}
              aria-expanded={isExpanded}
            >
              <span class="flex items-center gap-2 text-sm leading-none">
                <GripVertical
                  class="size-3.5 shrink-0 text-muted-foreground cursor-grab"
                  draggable
                  onDragStart={(event: DragEvent) => {
                    return onDragStart(index, event);
                  }}
                />
                <span class="font-medium">
                  {truncate(
                    entry.templates?.header || entry.indexName || 'New index'
                  )}
                </span>
              </span>
              <span class="flex items-center gap-1.5">
                <button
                  type="button"
                  class="inline-flex size-6 items-center justify-center rounded hover:bg-accent"
                  aria-label="Remove index"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeEntry(index);
                  }}
                >
                  <Trash2 class="size-3.5" />
                </button>
                <ChevronDown
                  class={`size-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </span>
            </CollapsibleTrigger>

            <CollapsibleContent open={isExpanded}>
              <div class="space-y-3 border-t border-border px-2.5 py-3">
                <div class="group space-y-1">
                  <Label>Index Name</Label>
                  <Combobox
                    value={entry.indexName}
                    suggestions={indexSuggestions}
                    label="Index Name"
                    placeholder="Select an index"
                    onInput={(value) => {
                      updateEntry(index, { indexName: value });
                    }}
                  />
                </div>

                <div class="group space-y-1">
                  <Label>
                    Header
                    <InfoTooltip content="Section header text displayed above this index's results." />
                  </Label>
                  <Input
                    value={entry.templates?.header ?? ''}
                    placeholder={entry.indexName || 'Section header'}
                    onInput={(event) => {
                      updateEntry(index, {
                        templates: {
                          ...entry.templates,
                          header: (event.target as HTMLInputElement).value,
                        },
                      });
                    }}
                  />
                </div>

                <div class="group space-y-1">
                  <Label>
                    No Results
                    <InfoTooltip content="Text to display when no results are found for this index." />
                  </Label>
                  <Input
                    value={entry.templates?.noResults ?? ''}
                    placeholder="No results found"
                    onInput={(event) => {
                      updateEntry(index, {
                        templates: {
                          ...entry.templates,
                          noResults: (event.target as HTMLInputElement).value,
                        },
                      });
                    }}
                  />
                </div>

                <div class="group space-y-1">
                  <Label>
                    Hits per page
                    <InfoTooltip content="Number of results to show in this section." />
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={
                      entry.hitsPerPage != null ? String(entry.hitsPerPage) : ''
                    }
                    placeholder="5"
                    onInput={(event) => {
                      const raw = (event.target as HTMLInputElement).value;
                      if (raw === '') {
                        updateEntry(index, { hitsPerPage: undefined });
                        return;
                      }
                      const parsed = Math.max(1, Math.round(Number(raw)));
                      if (!Number.isNaN(parsed)) {
                        updateEntry(index, { hitsPerPage: parsed });
                      }
                    }}
                  />
                </div>

                <ItemTemplateField
                  label="Item Template"
                  description="Maps Algolia record attributes to display roles for rendering items."
                  value={entry.templates?.item ?? {}}
                  fields={ITEM_TEMPLATE_FIELDS}
                  onFieldChange={(subKey, subValue) => {
                    updateEntry(index, {
                      templates: {
                        ...entry.templates,
                        item: {
                          ...entry.templates?.item,
                          [subKey]: subValue,
                        },
                      },
                    });
                  }}
                  indexName={entry.indexName || undefined}
                />

                <JsonField
                  label="Search Parameters"
                  description="Additional Algolia search parameters as JSON."
                  enabled={
                    typeof entry.searchParameters === 'object' &&
                    entry.searchParameters !== null
                  }
                  value={entry.searchParameters ?? {}}
                  onChange={(value) => {
                    updateEntry(index, { searchParameters: value });
                  }}
                  onToggle={(toggled) => {
                    updateEntry(index, {
                      searchParameters: toggled ? {} : undefined,
                    });
                  }}
                />
              </div>
            </CollapsibleContent>
          </div>
        );
      })}

      <Button variant="outline" size="sm" class="w-full" onClick={addEntry}>
        <Plus class="size-4" />
        Add Index
      </Button>
    </div>
  );
}

const MAX_LABEL_LENGTH = 30;

function truncate(text: string): string {
  if (text.length <= MAX_LABEL_LENGTH) {
    return text;
  }

  return text.slice(0, MAX_LABEL_LENGTH) + '\u2026';
}
