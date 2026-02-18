import { useState } from 'preact/hooks';
import { checkApiKeyAcl } from '../api';
import type { ExperienceApiResponse } from '../types';
import { BlockCard } from './block-card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Spinner } from './ui/spinner';

type AdminKeyState =
  | { status: 'idle'; input: string }
  | { status: 'validating'; input: string }
  | { status: 'error'; input: string; message: string };

type PanelProps = {
  appId: string;
  experience: ExperienceApiResponse;
  dirty: boolean;
  open: boolean;
  needsAdminKey: boolean;
  onClose: () => void;
  onSave: () => void;
  onAdminKeySave: (key: string) => void;
  onParameterChange: (blockIndex: number, key: string, value: unknown) => void;
  onCssVariableChange: (blockIndex: number, key: string, value: string) => void;
  onLocate: (container: string) => void;
};

export function Panel({
  appId,
  experience,
  dirty,
  open,
  needsAdminKey,
  onClose,
  onSave,
  onAdminKeySave,
  onParameterChange,
  onCssVariableChange,
  onLocate,
}: PanelProps) {
  const [adminKey, setAdminKey] = useState<AdminKeyState>({
    status: 'idle',
    input: '',
  });

  const validateAdminKey = async () => {
    const key = adminKey.input.trim();
    if (!key) return;
    setAdminKey({ status: 'validating', input: adminKey.input });
    try {
      const hasAcl = await checkApiKeyAcl(appId, key, 'editSettings');
      if (!hasAcl) {
        setAdminKey({
          status: 'error',
          input: adminKey.input,
          message: 'This key does not have the required permissions.',
        });
        return;
      }
      onAdminKeySave(key);
    } catch (error) {
      setAdminKey({
        status: 'error',
        input: adminKey.input,
        message: 'Invalid API key. Please check and try again.',
      });
    }
  };

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

      {/* Block list */}
      <div class="flex-1 overflow-y-auto p-4">
        <Alert class="mb-3">
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
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <AlertDescription>
            These are the Algolia Experience widgets on this page. Expand a
            widget to edit its parameters.
          </AlertDescription>
        </Alert>
        <div class="space-y-3">
          {experience.blocks.map((block, index) => (
            <BlockCard
              key={`${block.type}-${block.parameters.container}`}
              type={block.type}
              parameters={block.parameters}
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

      {/* Footer */}
      <div class="border-t p-4">
        {needsAdminKey ? (
          <div class="space-y-2">
            <Label
              htmlFor="admin-api-key"
              class={adminKey.status === 'error' ? 'text-destructive' : ''}
            >
              {adminKey.status === 'error'
                ? adminKey.message
                : 'Please provide an Admin API Key'}
            </Label>
            <div class="relative">
              <Input
                id="admin-api-key"
                type="password"
                value={adminKey.input}
                disabled={adminKey.status === 'validating'}
                onInput={(e) =>
                  setAdminKey({
                    status: 'idle',
                    input: (e.target as HTMLInputElement).value,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminKey.input.trim()) {
                    validateAdminKey();
                  }
                }}
                placeholder="Admin API Key"
                class={adminKey.status === 'error' ? 'border-destructive' : ''}
              />
              {adminKey.status === 'validating' && (
                <Spinner class="text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <Button
              size="lg"
              class="w-full"
              disabled={
                !adminKey.input.trim() || adminKey.status === 'validating'
              }
              onClick={validateAdminKey}
            >
              Update and save changes
            </Button>
          </div>
        ) : (
          <Button size="lg" class="w-full" disabled={!dirty} onClick={onSave}>
            Save changes
          </Button>
        )}
      </div>
    </div>
  );
}
