import { useState } from 'preact/hooks';

import { WIDGET_TYPES } from '../widget-types';
import { Badge } from './ui/badge';
import { CollapsibleContent } from './ui/collapsible';

type AddWidgetPopoverProps = {
  onSelect: (type: string) => void;
};

export function AddWidgetPopover({ onSelect }: AddWidgetPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <div class="space-y-3">
      <button
        type="button"
        aria-label="Add widget"
        onClick={() => {
          return setOpen(!open);
        }}
        class="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
      >
        <svg
          class="size-3.5 transition-transform group-hover:rotate-90"
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
        Add Widget
      </button>

      <CollapsibleContent open={open}>
        <div class="rounded-xl border p-1">
          {Object.entries(WIDGET_TYPES).map(([type, config]) => {
            if (!config.enabled) {
              return (
                <div
                  key={type}
                  class="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2 py-1.5 opacity-40"
                >
                  <div class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                    {config.icon}
                  </div>
                  <span class="text-muted-foreground text-sm">
                    {config.label}
                  </span>
                  <Badge variant="secondary" class="ml-auto text-[10px]">
                    Coming Soon
                  </Badge>
                </div>
              );
            }

            return (
              <button
                key={type}
                type="button"
                class="group/item flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent"
                onClick={() => {
                  onSelect(type);
                  setOpen(false);
                }}
              >
                <div class="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover/item:bg-background">
                  {config.icon}
                </div>
                <span class="text-sm font-semibold">{config.label}</span>
              </button>
            );
          })}
        </div>
      </CollapsibleContent>
    </div>
  );
}
