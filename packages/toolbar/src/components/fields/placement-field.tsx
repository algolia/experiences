import { useId } from 'preact/hooks';

import type { Placement } from '../../types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PickElementButton } from './pick-element-button';

const PLACEMENT_OPTIONS: Array<{ value: Placement; label: string }> = [
  { value: 'inside', label: 'Inside' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'replace', label: 'Replace' },
  { value: 'body', label: 'Append to body' },
];

type PlacementFieldProps = {
  container: string;
  placement: Placement | undefined;
  onContainerChange: (value: string) => void;
  onPlacementChange: (value: Placement) => void;
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
              const value = (event.target as HTMLSelectElement)
                .value as Placement;
              onPlacementChange(value);

              if (value === 'body') {
                onContainerChange('');
              }
            }}
            class={`border-input h-9 w-full appearance-none rounded-md border bg-transparent py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${isBody ? 'px-3 pr-8' : 'pl-2 pr-7'}`}
          >
            {PLACEMENT_OPTIONS.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
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
              onInput={(event) => {
                return onContainerChange(
                  (event.target as HTMLInputElement).value
                );
              }}
            />
            <PickElementButton
              onPickElement={onPickElement}
              onSelect={onContainerChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
