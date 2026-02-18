import { useEffect, useRef, useState } from 'preact/hooks';
import { WIDGET_TYPES } from '../widget-types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

type AddWidgetPopoverProps = {
  onSelect: (type: string) => void;
};

export function AddWidgetPopover({ onSelect }: AddWidgetPopoverProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onClick(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    const root = popoverRef.current?.getRootNode() as
      | Document
      | ShadowRoot
      | undefined;

    root?.addEventListener('click', onClick as EventListener);

    return () => {
      root?.removeEventListener('click', onClick as EventListener);
    };
  }, [open]);

  return (
    <div class="relative" ref={popoverRef}>
      {open && (
        <Card class="absolute bottom-full left-0 right-0 mb-2 p-1">
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
                    Coming soon
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
        </Card>
      )}
      <Button
        variant="outline"
        class="w-full"
        onClick={() => setOpen(!open)}
        aria-label="Add widget"
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
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add widget
      </Button>
    </div>
  );
}
