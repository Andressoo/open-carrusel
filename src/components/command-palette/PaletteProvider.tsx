"use client";

import { CommandPalette, useCommandPalette } from "./CommandPalette";

/**
 * Wrapper que monta el CommandPalette globalmente.
 * Se renderiza una sola vez en el layout root.
 */
export function PaletteProvider() {
  const { open, setOpen } = useCommandPalette();
  return <CommandPalette open={open} onClose={() => setOpen(false)} />;
}
