import type { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { ExperienceApiBlockParameters } from '../types';
import { BlockEditor } from './block-editor';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

type BlockCardProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onLocate: () => void;
};

const TYPE_CONFIG: Record<string, { label: string; icon: () => JSX.Element }> =
  {
    'ais.autocomplete': {
      label: 'Autocomplete',
      icon: () => (
        <svg
          class="size-4 shrink-0 text-[#003dff]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    'ais.chat': {
      label: 'Chat',
      icon: () => (
        <svg
          class="size-4 shrink-0 text-[#003dff]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      ),
    },
  };

export function BlockCard({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
  onLocate,
}: BlockCardProps) {
  const [open, setOpen] = useState(false);
  const config = TYPE_CONFIG[type];
  const label = config?.label ?? type;
  const Icon = config?.icon;

  return (
    <Card>
      <Collapsible open={open}>
        <CollapsibleTrigger
          class="w-full"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <CardHeader class="w-full justify-between bg-muted/50 rounded-t-xl px-6 py-3">
            <div class="flex items-center gap-2">
              {Icon && <Icon />}
              <span class="text-sm font-semibold">{label}</span>
              <Badge variant="outline">{parameters.container}</Badge>
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                aria-label={`Locate ${parameters.container}`}
                title={`Locate ${parameters.container}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLocate();
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
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                </svg>
              </button>
              <svg
                class={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent open={open}>
          <CardContent class="border-t py-4">
            <BlockEditor
              type={type}
              parameters={parameters}
              onParameterChange={onParameterChange}
              onCssVariableChange={onCssVariableChange}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
