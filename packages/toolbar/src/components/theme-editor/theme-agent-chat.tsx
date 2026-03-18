import { ArrowUp, Sparkles } from 'lucide-preact';

const THEME_SUGGESTIONS = [
  'Clean and minimal like Apple',
  'Bold with sharp edges like Nike',
  'Warm earthy tones like Aesop',
];

export function ThemeAgentChat() {
  return (
    <div class="flex flex-1 flex-col overflow-hidden">
      <div class="flex flex-1 flex-col items-center justify-center gap-5 px-4">
        <div class="text-center space-y-1.5">
          <div class="flex justify-center">
            <Sparkles
              class="size-8 text-muted-foreground/40"
              strokeWidth={1.5}
            />
          </div>
          <p class="text-sm font-medium">Describe your theme</p>
          <p class="text-xs text-muted-foreground">
            Tell me what you want and I'll generate it.
          </p>
          <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            Coming soon
          </span>
        </div>
        <div class="flex flex-col gap-2 w-full">
          {THEME_SUGGESTIONS.map((label) => {
            return (
              <div
                key={label}
                aria-disabled="true"
                class="w-full rounded-lg border px-3 py-2.5 text-left text-xs text-muted-foreground/60 cursor-default"
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area — pinned at bottom */}
      <div class="border-t p-3 space-y-2">
        <div class="relative">
          <textarea
            placeholder="Describe your theme…"
            rows={2}
            disabled
            class="w-full resize-none rounded-lg border bg-background px-3 py-2 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div
            class="absolute right-2.5 bottom-2.5 text-muted-foreground/40"
            aria-hidden="true"
          >
            <ArrowUp class="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
