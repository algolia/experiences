import { useState } from 'preact/hooks';
import type { ExperienceApiResponse } from '../types';
import { AddWidgetPopover } from './add-widget-popover';
import { BlockCard } from './block-card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { TabsList, TabsTrigger, TabsContent } from './ui/tabs';

type PanelProps = {
  experience: ExperienceApiResponse;
  dirty: boolean;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onParameterChange: (blockIndex: number, key: string, value: unknown) => void;
  onCssVariableChange: (blockIndex: number, key: string, value: string) => void;
  onLocate: (container: string) => void;
  onAddBlock: (type: string) => void;
};

type Tab = 'manual' | 'ai';

export function Panel({
  experience,
  dirty,
  open,
  onClose,
  onSave,
  onParameterChange,
  onCssVariableChange,
  onLocate,
  onAddBlock,
}: PanelProps) {
  const [tab, setTab] = useState<Tab>('manual');

  return (
    <div
      class="bg-background text-foreground fixed left-0 top-0 bottom-0 z-[2147483647] flex w-[480px] flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out"
      style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)' }}
      aria-hidden={!open || undefined}
      inert={!open || undefined}
    >
      {/* Header */}
      <div class="flex items-center justify-between border-b px-4 py-3">
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500.34"
            class="size-4 text-primary"
          >
            <path
              d="M250 0C113.38 0 2 110.16.03 246.32c-2 138.29 110.19 252.87 248.49 253.67 42.71.25 83.85-10.2 120.38-30.05 3.56-1.93 4.11-6.83 1.08-9.52l-23.39-20.74c-4.75-4.22-11.52-5.41-17.37-2.92-25.5 10.85-53.21 16.39-81.76 16.04-111.75-1.37-202.04-94.35-200.26-206.1C48.96 136.37 139.26 47.15 250 47.15h202.83v360.53L337.75 305.43c-3.72-3.31-9.43-2.66-12.43 1.31-18.47 24.46-48.56 39.67-81.98 37.36-46.36-3.2-83.92-40.52-87.4-86.86-4.15-55.28 39.65-101.58 94.07-101.58 49.21 0 89.74 37.88 93.97 86.01.38 4.28 2.31 8.28 5.53 11.13l29.97 26.57c3.4 3.01 8.8 1.17 9.63-3.3 2.16-11.55 2.92-23.6 2.07-35.95-4.83-70.39-61.84-127.01-132.26-131.35-80.73-4.98-148.23 58.18-150.37 137.35-2.09 77.15 61.12 143.66 138.28 145.36 32.21.71 62.07-9.42 86.2-26.97L483.39 497.8c6.45 5.71 16.62 1.14 16.62-7.48V9.49C500 4.25 495.75 0 490.51 0z"
              fill="currentColor"
            />
          </svg>
          <h2 class="text-sm font-semibold">Algolia Experiences</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close toolbar"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>

      {/* Tabs */}
      <div class="px-4 pt-3">
        <TabsList>
          <TabsTrigger
            active={tab === 'manual'}
            onClick={() => setTab('manual')}
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Manual
          </TabsTrigger>
          <TabsTrigger active={tab === 'ai'} onClick={() => setTab('ai')}>
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
            AI
            <Badge variant="secondary" class="text-[10px]">
              Soon
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Manual tab */}
      <TabsContent
        active={tab === 'manual'}
        class="flex flex-1 flex-col overflow-hidden"
      >
        {/* Block list */}
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            {experience.blocks.map((block, index) => (
              <BlockCard
                key={index}
                type={block.type}
                parameters={block.parameters}
                initialOpen={
                  index === experience.blocks.length - 1 &&
                  block.parameters.container === ''
                }
                onParameterChange={(key, value) =>
                  onParameterChange(index, key, value)
                }
                onCssVariableChange={(key, value) =>
                  onCssVariableChange(index, key, value)
                }
                onLocate={() => onLocate(block.parameters.container)}
              />
            ))}
          </div>
        </div>

        {/* Add widget */}
        <div class="border-t px-4 py-3">
          <AddWidgetPopover onSelect={onAddBlock} />
        </div>

        {/* Footer */}
        <div class="border-t p-4">
          <Button size="lg" class="w-full" disabled={!dirty} onClick={onSave}>
            Save changes
          </Button>
        </div>
      </TabsContent>

      {/* AI tab */}
      <TabsContent
        active={tab === 'ai'}
        class="flex flex-1 flex-col items-center justify-center gap-3 p-4"
      >
        <svg
          class="size-10 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
        <div class="text-center">
          <p class="text-sm font-semibold">AI Mode</p>
          <p class="text-muted-foreground mt-1 text-sm">
            Edit your experience conversationally with an AI agent.
            <br /> Add widgets, change parameters, and update styles, all by
            chatting.
          </p>
        </div>
        <Badge variant="secondary">Coming soon</Badge>
      </TabsContent>
    </div>
  );
}
