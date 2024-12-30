/**
 * Represents a color extracted from an image, used by both server and client-side functions.
 * 
 * @property hex - The hexadecimal color code (e.g. "#FF0000")
 * @property weight - The prevalence of this color in the image, as a percentage (0-1)
 */
export type AuraColor = {
  hex: string;
  weight: number;
};

/**
 * Represents the response from the `useAura` hook. This is only used on the client side.
 * 
 * @property colors - An array of AuraColor objects
 * @property isLoading - Whether the colors are still being extracted
 * @property error - An error object if the extraction failed
 */
export type AuraResponse = {
  colors: AuraColor[];
  isLoading: boolean;
  error: Error | null;
};
