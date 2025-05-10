/**
 * Represents an extracted color with its prevalence in the image.
 */
export type AuraColor = {
  hex: string;
  weight: number;
  position: number;
};

/**
 * Response from the useAura hook (client-side only).
 */
export type AuraResponse = {
  colors: AuraColor[];
  isLoading: boolean;
  error: Error | null;
};
