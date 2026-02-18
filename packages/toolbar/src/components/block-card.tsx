import { useState } from 'preact/hooks';
import type { ExperienceApiBlockParameters } from '../types';
import { WIDGET_TYPES } from '../widget-types';
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
  initialOpen?: boolean;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onLocate: () => void;
};

export function BlockCard({
  type,
  parameters,
  initialOpen = false,
  onParameterChange,
  onCssVariableChange,
  onLocate,
}: BlockCardProps) {
  const [open, setOpen] = useState(initialOpen);
  const widgetType = WIDGET_TYPES[type];
  const label = widgetType?.label ?? type;
  const Icon = widgetType?.icon;

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
              {parameters.container && (
                <Badge variant="outline">{parameters.container}</Badge>
              )}
            </div>
            <div class="flex items-center gap-1">
              {parameters.container && (
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
              )}
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
