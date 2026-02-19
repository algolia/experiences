import { useId } from 'preact/hooks';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

const PLACEMENT_OPTIONS = [
  { value: 'inside', label: 'Inside' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'replace', label: 'Replace' },
  { value: 'body', label: 'Append to body' },
] as const;

type PlacementFieldProps = {
  container: string;
  placement: string | undefined;
  onContainerChange: (value: string) => void;
  onPlacementChange: (value: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
};

export function PlacementField({
  container,
  placement,
  onContainerChange,
  onPlacementChange,
  onPickElement,
}: PlacementFieldProps) {
  const placementId = useId();
  const containerId = useId();
  const currentPlacement = placement ?? 'inside';
  const isBody = currentPlacement === 'body';

  return (
    <div class="group space-y-1">
      <Label htmlFor={isBody ? placementId : containerId}>Container</Label>
      <div class="flex gap-1.5">
        <div class={`relative ${isBody ? 'w-full' : 'shrink-0'}`}>
          <select
            id={placementId}
            value={currentPlacement}
            onChange={(event) => {
              const value = (event.target as HTMLSelectElement).value;
              onPlacementChange(value);

              if (value === 'body') {
                onContainerChange('');
              }
            }}
            class={`border-input h-9 w-full appearance-none rounded-md border bg-transparent py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${isBody ? 'px-3 pr-8' : 'pl-2 pr-7'}`}
          >
            {PLACEMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            class="text-muted-foreground pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {!isBody && (
          <>
            <Input
              id={containerId}
              value={container}
              placeholder='e.g. "#search"'
              onInput={(e) =>
                onContainerChange((e.target as HTMLInputElement).value)
              }
            />
            <button
              type="button"
              title="Pick an element"
              onClick={() => onPickElement(onContainerChange)}
              class="border-input text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
                <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
