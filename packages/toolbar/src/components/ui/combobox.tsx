import type { JSX } from 'preact';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/hooks';

import { Input } from './input';

type ComboboxProps = Omit<
  JSX.IntrinsicElements['input'],
  'onInput' | 'onSelect'
> & {
  suggestions: string[];
  onInput: (value: string) => void;
  label: string;
};

export function Combobox({
  suggestions,
  onInput,
  label,
  value,
  ...inputProps
}: ComboboxProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const text = typeof value === 'string' ? value : '';
  const filtered = suggestions.filter((item) => {
    return item.toLowerCase().includes(text.toLowerCase());
  });

  const safeIndex = activeIndex >= filtered.length ? -1 : activeIndex;
  const showDropdown = open && filtered.length > 0;

  useLayoutEffect(() => {
    if (!showDropdown || !containerRef.current || !listboxRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ul = listboxRef.current;
    ul.style.top = `${rect.bottom + 4}px`;
    ul.style.left = `${rect.left}px`;
    ul.style.width = `${rect.width}px`;
  });

  useEffect(() => {
    if (!showDropdown || !containerRef.current) return;

    let scrollParent: HTMLElement | null = containerRef.current.parentElement;
    while (scrollParent) {
      const { overflowY } = getComputedStyle(scrollParent);
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      scrollParent = scrollParent.parentElement;
    }

    if (!scrollParent) return;

    const onScroll = () => {
      setOpen(false);
      setActiveIndex(-1);
    };

    scrollParent.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollParent.removeEventListener('scroll', onScroll);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (safeIndex >= 0 && listboxRef.current) {
      const option = listboxRef.current.children[safeIndex] as
        | HTMLElement
        | undefined;
      option?.scrollIntoView({ block: 'nearest' });
    }
  }, [safeIndex]);

  function select(item: string) {
    onInput(item);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && filtered.length > 0) {
        setOpen(true);
        setActiveIndex(0);
        event.preventDefault();
      }

      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => {
          return i < filtered.length - 1 ? i + 1 : 0;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => {
          return i > 0 ? i - 1 : filtered.length - 1;
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (safeIndex >= 0) {
          const item = filtered[safeIndex];
          if (item) select(item);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  return (
    <div class="relative" ref={containerRef}>
      <Input
        {...inputProps}
        value={value}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && safeIndex >= 0
            ? `${listboxId}-${safeIndex}`
            : undefined
        }
        aria-controls={showDropdown ? listboxId : undefined}
        autocomplete="off"
        onInput={(event) => {
          onInput((event.target as HTMLInputElement).value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onClick={() => {
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={(event: FocusEvent) => {
          if (
            containerRef.current?.contains(event.relatedTarget as Node | null)
          ) {
            return;
          }
          setOpen(false);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
      />
      {showDropdown && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          class="fixed z-50 max-h-40 overflow-auto rounded-md border border-border bg-background py-1 shadow-md"
        >
          {filtered.map((item, index) => {
            return (
              <li
                key={item}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === safeIndex}
                class={`cursor-pointer px-3 py-1.5 text-sm ${index === safeIndex ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  select(item);
                }}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
              >
                {item}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
