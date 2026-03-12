import { useRef, useState } from 'preact/hooks';

import { useIndices } from '../../hooks/use-indices';
import { InfoTooltip } from './info-tooltip';
import { ItemTemplateField } from './item-template-field';
import { JsonField } from './json-field';
import { Button } from '../ui/button';
import { Combobox, type Suggestion } from '../ui/combobox';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type StoredIndexEntry = {
  indexName: string;
  hitsPerPage?: number;
  templates?: {
    header?: string;
    item?: Record<string, string>;
  };
  searchParameters?: Record<string, unknown>;
};

type IndicesConfigFieldProps = {
  label: string;
  entries: StoredIndexEntry[];
  onChange: (entries: StoredIndexEntry[]) => void;
  suggestLists?: Partial<Record<string, Suggestion[]>>;
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
  suggestLists,
}: IndicesConfigFieldProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const newEntryRef = useRef<HTMLDivElement>(null);

  const qsIndices = useIndices({ type: 'querySuggestions' });
  const indexSuggestions = suggestLists?.indices ?? [];

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
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  }

  function addEntry() {
    onChange([...entries, { indexName: '', hitsPerPage: 5 }]);
    setExpandedIndex(entries.length);
    requestAnimationFrame(() => {
      const combobox = newEntryRef.current?.querySelector<HTMLInputElement>(
        'input[role="combobox"]'
      );
      combobox?.focus();
    });
  }

  function onDragStart(index: number) {
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
        const isQs = qsIndices.includes(entry.indexName);
        const isDragOver =
          dropTargetIndex === index && dragSourceIndex !== index;

        return (
          <div
            key={index}
            ref={index === entries.length - 1 ? newEntryRef : undefined}
            class={`rounded-md border border-border ${isDragOver ? 'border-primary' : ''} ${dragSourceIndex === index ? 'opacity-50' : ''}`}
            draggable
            onDragStart={() => {
              return onDragStart(index);
            }}
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
                <svg
                  class="size-3.5 shrink-0 text-muted-foreground cursor-grab"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="9" cy="5" r="1.5" />
                  <circle cx="15" cy="5" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="19" r="1.5" />
                  <circle cx="15" cy="19" r="1.5" />
                </svg>
                <span class="font-medium truncate">
                  {entry.templates?.header || entry.indexName || 'New index'}
                </span>
                {isQs && (
                  <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Suggestions
                  </span>
                )}
              </span>
              <span class="flex items-center gap-1.5">
                {entry.hitsPerPage != null && (
                  <span class="text-xs text-muted-foreground">
                    {entry.hitsPerPage} hits
                  </span>
                )}
                <button
                  type="button"
                  class="inline-flex size-6 items-center justify-center rounded hover:bg-accent"
                  aria-label="Remove index"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeEntry(index);
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
                <svg
                  class={`size-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
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
                      const patch: Partial<StoredIndexEntry> = {
                        indexName: value,
                      };
                      if (
                        qsIndices.includes(value) &&
                        (!entry.templates?.header ||
                          entry.templates.header === '')
                      ) {
                        patch.templates = {
                          ...entry.templates,
                          header: 'Suggestions',
                        };
                      }
                      updateEntry(index, patch);
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
                    Hits per page
                    <InfoTooltip content="Number of results to show in this section." />
                  </Label>
                  <Input
                    type="number"
                    value={
                      entry.hitsPerPage != null ? String(entry.hitsPerPage) : ''
                    }
                    placeholder="5"
                    onInput={(event) => {
                      const raw = (event.target as HTMLInputElement).value;
                      updateEntry(index, {
                        hitsPerPage: raw === '' ? undefined : Number(raw),
                      });
                    }}
                  />
                </div>

                {!isQs && (
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
                )}

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
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add Index
      </Button>
    </div>
  );
}
