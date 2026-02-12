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
            <svg
              class={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
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
