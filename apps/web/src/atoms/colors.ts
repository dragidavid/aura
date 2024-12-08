import { atom } from "jotai";

type Color = {
  hex: string;
  weight: number;
};

export const colorsAtom = atom<Color[]>([]);
