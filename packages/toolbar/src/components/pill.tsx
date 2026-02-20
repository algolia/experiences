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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 500.34"
            class="size-5 text-primary"
          >
            <path
              d="M250 0C113.38 0 2 110.16.03 246.32c-2 138.29 110.19 252.87 248.49 253.67 42.71.25 83.85-10.2 120.38-30.05 3.56-1.93 4.11-6.83 1.08-9.52l-23.39-20.74c-4.75-4.22-11.52-5.41-17.37-2.92-25.5 10.85-53.21 16.39-81.76 16.04-111.75-1.37-202.04-94.35-200.26-206.1C48.96 136.37 139.26 47.15 250 47.15h202.83v360.53L337.75 305.43c-3.72-3.31-9.43-2.66-12.43 1.31-18.47 24.46-48.56 39.67-81.98 37.36-46.36-3.2-83.92-40.52-87.4-86.86-4.15-55.28 39.65-101.58 94.07-101.58 49.21 0 89.74 37.88 93.97 86.01.38 4.28 2.31 8.28 5.53 11.13l29.97 26.57c3.4 3.01 8.8 1.17 9.63-3.3 2.16-11.55 2.92-23.6 2.07-35.95-4.83-70.39-61.84-127.01-132.26-131.35-80.73-4.98-148.23 58.18-150.37 137.35-2.09 77.15 61.12 143.66 138.28 145.36 32.21.71 62.07-9.42 86.2-26.97L483.39 497.8c6.45 5.71 16.62 1.14 16.62-7.48V9.49C500 4.25 495.75 0 490.51 0z"
              fill="currentColor"
            />
          </svg>
        </Button>

        {locked && (
          <Badge
            variant="secondary"
            class="absolute -right-1 -top-1 size-5 p-0 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-2.5"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Badge>
        )}
      </div>
    </div>
  );
}
