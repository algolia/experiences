import { useState } from 'preact/hooks';

import { WIDGET_TYPES } from '../widget-types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
        onClick={() => setOpen(!open)}
        class="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-3 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
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
            const Icon = config.icon;

            if (!config.enabled) {
              return (
                <div
                  key={type}
                  class="text-muted-foreground flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm opacity-50"
                >
                  <Icon />
                  <span>{config.label}</span>
                  <Badge variant="secondary" class="ml-auto text-[10px]">
                    Coming Soon
                  </Badge>
                </div>
              );
            }

            return (
              <Button
                key={type}
                variant="ghost"
                class="w-full justify-start"
                onClick={() => {
                  onSelect(type);
                  setOpen(false);
                }}
              >
                <Icon />
                {config.label}
              </Button>
            );
          })}
        </div>
      </CollapsibleContent>
    </div>
  );
}
