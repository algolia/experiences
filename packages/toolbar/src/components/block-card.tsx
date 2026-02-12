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

const TYPE_LABELS: Record<string, string> = {
  'ais.chat': 'Chat',
  'ais.autocomplete': 'Autocomplete',
};

export function BlockCard({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
}: BlockCardProps) {
  const [open, setOpen] = useState(false);
  const label = TYPE_LABELS[type] ?? type;

  return (
    <Card>
      <Collapsible open={open}>
        <CollapsibleTrigger
          class="w-full"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <CardHeader class="w-full justify-between">
            <div class="flex items-center gap-2">
              <Badge>{label}</Badge>
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
          <CardContent>
            <BlockEditor
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
