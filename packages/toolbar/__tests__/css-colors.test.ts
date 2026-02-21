import { describe, expect, it } from 'vitest';

import {
  hexToRgbTriplet,
  isHexColor,
  isRgbTriplet,
  rgbTripletToHex,
} from '../src/utils/css-colors';

describe('isHexColor', () => {
  it('accepts 3-digit hex', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#F00')).toBe(true);
  });

  it('accepts 6-digit hex', () => {
    expect(isHexColor('#003dff')).toBe(true);
    expect(isHexColor('#FF0000')).toBe(true);
  });

  it('accepts 8-digit hex (with alpha)', () => {
    expect(isHexColor('#003dff80')).toBe(true);
  });

  it('rejects values without hash', () => {
    expect(isHexColor('003dff')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isHexColor('')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(isHexColor('#gggggg')).toBe(false);
  });

  it('rejects RGB triplets', () => {
    expect(isHexColor('255,0,0')).toBe(false);
  });
});

describe('isRgbTriplet', () => {
  it('accepts comma-separated RGB values', () => {
    expect(isRgbTriplet('255,0,0')).toBe(true);
    expect(isRgbTriplet('0,0,0')).toBe(true);
    expect(isRgbTriplet('255,255,255')).toBe(true);
  });

  it('accepts values with spaces around commas', () => {
    expect(isRgbTriplet('255, 128, 0')).toBe(true);
    expect(isRgbTriplet(' 0 , 0 , 0 ')).toBe(true);
  });

  it('rejects values outside 0-255 range', () => {
    expect(isRgbTriplet('256,0,0')).toBe(false);
    expect(isRgbTriplet('0,-1,0')).toBe(false);
  });

  it('rejects non-numeric parts', () => {
    expect(isRgbTriplet('red,green,blue')).toBe(false);
  });

  it('rejects fewer than 3 parts', () => {
    expect(isRgbTriplet('255,0')).toBe(false);
  });

  it('rejects more than 3 parts', () => {
    expect(isRgbTriplet('255,0,0,128')).toBe(false);
  });

  it('rejects hex colors', () => {
    expect(isRgbTriplet('#003dff')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isRgbTriplet('')).toBe(false);
  });
});

describe('rgbTripletToHex', () => {
  it('converts basic colors', () => {
    expect(rgbTripletToHex('255,0,0')).toBe('#ff0000');
    expect(rgbTripletToHex('0,255,0')).toBe('#00ff00');
    expect(rgbTripletToHex('0,0,255')).toBe('#0000ff');
  });

  it('converts black and white', () => {
    expect(rgbTripletToHex('0,0,0')).toBe('#000000');
    expect(rgbTripletToHex('255,255,255')).toBe('#ffffff');
  });

  it('handles spaces around values', () => {
    expect(rgbTripletToHex('255, 128, 0')).toBe('#ff8000');
  });

  it('pads single-digit hex values with zero', () => {
    expect(rgbTripletToHex('0,0,1')).toBe('#000001');
    expect(rgbTripletToHex('15,0,0')).toBe('#0f0000');
  });

  it('clamps values above 255', () => {
    expect(rgbTripletToHex('300,0,0')).toBe('#ff0000');
  });

  it('clamps values below 0', () => {
    expect(rgbTripletToHex('-10,0,0')).toBe('#000000');
  });
});

describe('hexToRgbTriplet', () => {
  it('converts basic colors', () => {
    expect(hexToRgbTriplet('#ff0000')).toBe('255,0,0');
    expect(hexToRgbTriplet('#00ff00')).toBe('0,255,0');
    expect(hexToRgbTriplet('#0000ff')).toBe('0,0,255');
  });

  it('converts black and white', () => {
    expect(hexToRgbTriplet('#000000')).toBe('0,0,0');
    expect(hexToRgbTriplet('#ffffff')).toBe('255,255,255');
  });

  it('is case-insensitive', () => {
    expect(hexToRgbTriplet('#FF8000')).toBe('255,128,0');
  });

  it('returns 0,0,0 for invalid hex', () => {
    expect(hexToRgbTriplet('not-a-color')).toBe('0,0,0');
  });

  it('returns 0,0,0 for 3-digit hex (not supported)', () => {
    expect(hexToRgbTriplet('#f00')).toBe('0,0,0');
  });

  it('returns 0,0,0 for 8-digit hex (alpha not supported)', () => {
    expect(hexToRgbTriplet('#ff000080')).toBe('0,0,0');
  });
});
