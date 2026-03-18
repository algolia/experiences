import { Lock } from 'lucide-preact';

import { AlgoliaLogo } from './icons/algolia-logo';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

type PillProps = {
  visible: boolean;
  locked: boolean;
  onClick: () => void;
};

export function Pill({ visible, locked, onClick }: PillProps) {
  return (
    <div
      class="fixed bottom-4 left-4 z-[2147483647] transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div class="relative">
        <Button
          onClick={onClick}
          variant="outline"
          size="icon"
          class="size-12 rounded-full shadow-md transition-shadow hover:shadow-lg"
          aria-label="Open Algolia Experiences toolbar"
        >
          <AlgoliaLogo class="size-5 text-primary" />
        </Button>

        {locked && (
          <Badge
            variant="secondary"
            class="absolute -right-1 -top-1 size-5 p-0 shadow-sm"
          >
            <Lock class="size-2.5" strokeWidth={2.5} />
          </Badge>
        )}
      </div>
    </div>
  );
}
