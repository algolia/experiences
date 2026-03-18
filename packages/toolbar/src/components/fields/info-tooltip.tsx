import { Info } from 'lucide-preact';

import { Tooltip } from '../ui/tooltip';

type InfoTooltipProps = {
  content: string;
  class?: string;
};

export function InfoTooltip({ content, class: className }: InfoTooltipProps) {
  return (
    <Tooltip content={content} class={className}>
      <Info class="size-3.5 text-muted-foreground" />
    </Tooltip>
  );
}
