const HEX_COLOR_RE = /^#([0-9a-f]{3,8})$/i;
const HEX_RGB_RE = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

export function isHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

export function isRgbTriplet(value: string): boolean {
  const parts = value.split(',');

  return (
    parts.length === 3 &&
    parts.every((part) => {
      const num = Number(part.trim());

      return !isNaN(num) && num >= 0 && num <= 255;
    })
  );
}

export function rgbTripletToHex(triplet: string): string {
  return (
    '#' +
    triplet
      .split(',')
      .map((part) => {
        return Math.max(0, Math.min(255, Number(part.trim())))
          .toString(16)
          .padStart(2, '0');
      })
      .join('')
  );
}

export function hexToRgbTriplet(hex: string): string {
  const result = HEX_RGB_RE.exec(hex);

  if (!result) {
    return '0,0,0';
  }

  return [
    parseInt(result[1]!, 16),
    parseInt(result[2]!, 16),
    parseInt(result[3]!, 16),
  ].join(',');
}
