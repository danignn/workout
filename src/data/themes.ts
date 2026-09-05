import type { MascotId, PaletteId } from '../store/types';

export interface Palette {
  id: PaletteId;
  label: string;
  /** Swatch shown in the picker. */
  swatch: string;
  vars: Record<string, string>;
}

/**
 * White page, pastel accents. #ffe5ec is the requested base tint and is what
 * fills the exercise cards and section surfaces in the default theme.
 */
export const PALETTES: Palette[] = [
  {
    id: 'blush',
    label: 'Baby pink',
    swatch: '#ffe5ec',
    vars: {
      '--pink-50': '#fff7f9',
      '--pink-100': '#ffe5ec',
      '--pink-200': '#ffd2de',
      '--pink-300': '#ffb8cc',
      '--pink-400': '#ff9dbb',
      '--pink-500': '#f97fa5',
      '--pink-600': '#e8618c',
      '--pink-700': '#c9456f',
      '--bg': '#ffffff',
      '--surface': '#ffffff',
      '--surface-tint': '#ffe5ec',
      '--line': '#ffdce6',
    },
  },
  {
    id: 'rose',
    label: 'Dusty rose',
    swatch: '#f6dcdc',
    vars: {
      '--pink-50': '#fdf6f5',
      '--pink-100': '#f6dcdc',
      '--pink-200': '#efc7c7',
      '--pink-300': '#e3a9a9',
      '--pink-400': '#d68e91',
      '--pink-500': '#c4737a',
      '--pink-600': '#ab5b64',
      '--pink-700': '#8d4550',
      '--bg': '#ffffff',
      '--surface': '#ffffff',
      '--surface-tint': '#f9e8e7',
      '--line': '#f2dcda',
    },
  },
  {
    id: 'lilac',
    label: 'Lilac',
    swatch: '#ece2fb',
    vars: {
      '--pink-50': '#faf7ff',
      '--pink-100': '#ece2fb',
      '--pink-200': '#ddccf7',
      '--pink-300': '#c9b0f0',
      '--pink-400': '#b596e6',
      '--pink-500': '#9f7ad9',
      '--pink-600': '#8760c4',
      '--pink-700': '#6d4aa3',
      '--bg': '#ffffff',
      '--surface': '#ffffff',
      '--surface-tint': '#f2ebfd',
      '--line': '#e6dcf8',
    },
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: '#d9f2e8',
    vars: {
      '--pink-50': '#f4fdf9',
      '--pink-100': '#d9f2e8',
      '--pink-200': '#bfe8d8',
      '--pink-300': '#99d9c1',
      '--pink-400': '#74c8a8',
      '--pink-500': '#4fb391',
      '--pink-600': '#369a79',
      '--pink-700': '#277c60',
      '--bg': '#ffffff',
      '--surface': '#ffffff',
      '--surface-tint': '#e6f7ef',
      '--line': '#d5efe4',
    },
  },
  {
    id: 'butter',
    label: 'Peach',
    swatch: '#ffe8d6',
    vars: {
      '--pink-50': '#fffaf5',
      '--pink-100': '#ffe8d6',
      '--pink-200': '#ffd6b8',
      '--pink-300': '#ffbe93',
      '--pink-400': '#fda672',
      '--pink-500': '#f68b52',
      '--pink-600': '#e0713a',
      '--pink-700': '#bb5729',
      '--bg': '#ffffff',
      '--surface': '#ffffff',
      '--surface-tint': '#fff0e3',
      '--line': '#ffe3cf',
    },
  },
];

export const MASCOTS: { id: MascotId; label: string; emoji: string }[] = [
  { id: 'butterfly', label: 'Glittery butterfly', emoji: '🦋' },
  { id: 'sparkle', label: 'Twinkling sparkles', emoji: '✨' },
  { id: 'heart', label: 'Floating hearts', emoji: '💕' },
  { id: 'fairy', label: 'Fairy', emoji: '🧚' },
  { id: 'bunny', label: 'Bunny', emoji: '🐰' },
  { id: 'kitty', label: 'Kitty', emoji: '🐱' },
  { id: 'flower', label: 'Blossom', emoji: '🌸' },
  { id: 'custom', label: 'My own picture', emoji: '🖼️' },
  { id: 'none', label: 'None', emoji: '🚫' },
];

export function paletteById(id: PaletteId): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
