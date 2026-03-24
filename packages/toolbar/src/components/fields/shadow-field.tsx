import { X } from 'lucide-preact';

import type { ShadowLayer } from '@experiences/theme';

import { hexToRgbTriplet, rgbTripletToHex } from '../../utils/css-colors';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type ShadowFieldProps = {
  layers: ShadowLayer[];
  onInput: (layers: ShadowLayer[]) => void;
};

const DEFAULT_LAYER: ShadowLayer = {
  offsetX: 0,
  offsetY: 2,
  blur: 4,
  spread: 0,
  color: '0, 0, 0',
  opacity: 0.1,
};

export function ShadowField({ layers, onInput }: ShadowFieldProps) {
  const updateLayer = (index: number, patch: Partial<ShadowLayer>) => {
    onInput(
      layers.map((layer, i) => {
        return i === index ? { ...layer, ...patch } : layer;
      })
    );
  };

  const addLayer = () => {
    if (layers.length >= 4) return;
    onInput([...layers, { ...DEFAULT_LAYER }]);
  };

  const removeLayer = (index: number) => {
    if (layers.length <= 1) return;
    onInput(
      layers.filter((_, i) => {
        return i !== index;
      })
    );
  };

  return (
    <div class="group space-y-2">
      {layers.map((layer, index) => {
        return (
          <div key={index} class="space-y-1.5 rounded-md border p-2">
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                Layer {index + 1}
              </span>
              {layers.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    return removeLayer(index);
                  }}
                  class="text-muted-foreground hover:text-foreground text-xs"
                  aria-label={`Remove layer ${index + 1}`}
                >
                  <X class="size-3.5" />
                </button>
              )}
            </div>
            <div class="flex items-center gap-1.5">
              <input
                type="color"
                value={rgbTripletToHex(layer.color)}
                onInput={(event) => {
                  return updateLayer(index, {
                    color: hexToRgbTriplet(
                      (event.target as HTMLInputElement).value
                    ),
                  });
                }}
                class="size-7 shrink-0 cursor-pointer rounded border border-input p-0.5"
              />
              <Input
                type="number"
                value={layer.offsetX}
                placeholder="X"
                onInput={(event) => {
                  return updateLayer(index, {
                    offsetX: Number((event.target as HTMLInputElement).value),
                  });
                }}
                class="h-7 text-xs font-mono px-1.5 min-w-0"
              />
              <Input
                type="number"
                value={layer.offsetY}
                placeholder="Y"
                onInput={(event) => {
                  return updateLayer(index, {
                    offsetY: Number((event.target as HTMLInputElement).value),
                  });
                }}
                class="h-7 text-xs font-mono px-1.5 min-w-0"
              />
              <Input
                type="number"
                min={0}
                value={layer.blur}
                placeholder="Blur"
                onInput={(event) => {
                  return updateLayer(index, {
                    blur: Number((event.target as HTMLInputElement).value),
                  });
                }}
                class="h-7 text-xs font-mono px-1.5 min-w-0"
              />
              <Input
                type="number"
                value={layer.spread}
                placeholder="Spread"
                onInput={(event) => {
                  return updateLayer(index, {
                    spread: Number((event.target as HTMLInputElement).value),
                  });
                }}
                class="h-7 text-xs font-mono px-1.5 min-w-0"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={layer.opacity}
                onInput={(event) => {
                  return updateLayer(index, {
                    opacity: Number((event.target as HTMLInputElement).value),
                  });
                }}
                class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              />
              <span class="text-xs text-muted-foreground font-mono w-8 text-right">
                {layer.opacity}
              </span>
            </div>
          </div>
        );
      })}
      {layers.length < 4 && (
        <Button
          variant="outline"
          size="sm"
          onClick={addLayer}
          class="w-full text-xs"
        >
          Add layer
        </Button>
      )}
    </div>
  );
}
