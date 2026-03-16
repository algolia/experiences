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
            <svg
              class="size-8 text-muted-foreground/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
            </svg>
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
            <svg
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
