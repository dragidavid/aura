const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates image URLs for security and compatibility.
 * Checks URL structure, protocol, content-type, size limits, and CORS.
 *
 * @param url - URL to validate
 * @returns Promise resolving to true if valid
 * @throws {Error} with standardized message if validation fails
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Invalid image URL format");
    }

    if (!(parsed.protocol === "https:" || url.startsWith("data:"))) {
      throw new Error("Only HTTPS and data URLs are supported");
    }

    // Handle data URLs
    if (url.startsWith("data:")) {
      const mime = url.split(",")[0]?.split(":")[1]?.split(";")[0];

      if (!mime || !ALLOWED_IMAGE_TYPES.includes(mime)) {
        throw new Error(
          `Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        );
      }

      return true;
    }

    try {
      // Try HEAD request first
      const headResponse = await fetch(url, {
        method: "HEAD",
        headers: { Accept: "image/*" },
        mode: "cors",
        credentials: "omit", // Prevent sending cookies for security
      });

      if (headResponse.ok) {
        const contentType = headResponse.headers.get("content-type");

        if (
          !contentType ||
          !ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
        ) {
          throw new Error(
            `Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
          );
        }

        const contentLength = headResponse.headers.get("content-length");

        if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
          throw new Error(
            `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
          );
        }

        return true;
      }
    } catch (headError) {
      // HEAD request failed, fall back to GET with range
      console.warn("HEAD request failed, falling back to GET request");
    }

    // Fallback: GET request with range header
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/*",
        Range: "bytes=0-1024", // Only request first KB to check type
      },
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`Image is not accessible (HTTP ${response.status})`);
    }

    const contentType = response.headers.get("content-type");

    if (
      !contentType ||
      !ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
    ) {
      throw new Error(
        `Unsupported image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
      );
    }

    return true;
  } catch (error) {
    throw new Error(
      `Image validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
