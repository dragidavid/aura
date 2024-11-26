import { atom } from "jotai";

export interface ColorData {
  hex: string;
}

// Atom to store the current colors
export const colorsAtom = atom<ColorData[]>([]);

// Atom to handle color updates with transition state
export const updateColorsAtom = atom(
  (get) => get(colorsAtom),
  (get, set, newColors: ColorData[]) => {
    set(colorsAtom, newColors);
  },
);
