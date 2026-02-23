import { Tooltip } from '../ui/tooltip';

type InfoTooltipProps = {
  content: string;
  class?: string;
};

export function InfoTooltip({ content, class: className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} class={className}>
      <svg
        class="size-3.5 text-muted-foreground"
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
    </Tooltip>
  );
}
