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
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
      </svg>
    </button>
  );
}
