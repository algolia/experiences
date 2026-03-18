import { Pointer } from 'lucide-preact';

type PickElementButtonProps = {
  onPickElement: (callback: (selector: string) => void) => void;
  onSelect: (selector: string) => void;
};

export function PickElementButton({
  onPickElement,
  onSelect,
}: PickElementButtonProps) {
  return (
    <button
      type="button"
      title="Pick an element"
      onClick={() => {
        return onPickElement(onSelect);
      }}
      class="border-input text-muted-foreground hover:text-foreground hover:bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    >
      <Pointer class="size-4" />
    </button>
  );
}
