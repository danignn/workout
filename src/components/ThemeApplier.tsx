import { useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { paletteById } from '../data/themes';

/** Writes the chosen palette onto the document root as CSS custom properties. */
export function ThemeApplier() {
  const { state } = useApp();
  const palette = paletteById(state.theme.palette);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(palette.vars)) {
      root.style.setProperty(key, value);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', palette.vars['--pink-100'] ?? '#ffe5ec');
  }, [palette]);

  return null;
}
