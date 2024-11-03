// Re-export browser-specific exports
export { extractColors } from "./browser/extract";
export { useAura } from "./hooks/useAura";
export type { ColorInfo } from "./core/color";

// Note: Node-specific exports are handled via package.json "exports" field
