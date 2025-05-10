const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
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

    // Allow http for localhost, otherwise require https or data URLs
    const isLocalhost =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const isHttp = parsed.protocol === "http:";
    const isHttps = parsed.protocol === "https:";
    const isDataUrl = url.startsWith("data:");

    if (!((isHttp && isLocalhost) || isHttps || isDataUrl)) {
      throw new Error(
        "Only HTTPS (or HTTP for localhost) and data URLs are supported"
      );
    }

    if (isDataUrl) {
      const mime = url.split(",")[0]?.split(":")[1]?.split(";")[0];

      if (!mime || !ALLOWED_IMAGE_TYPES.includes(mime)) {
        throw new Error(
          `Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
        );
      }

      return true;
    }

    // For http/https, proceed with HEAD/GET requests
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        headers: { Accept: "image/*" },
        mode: "cors",
        credentials: "omit",
      });

      if (headResponse.ok) {
        const contentType = headResponse.headers.get("content-type");

        if (
          !contentType ||
          !ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
        ) {
          throw new Error(
            `Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
          );
        }
        const contentLength = headResponse.headers.get("content-length");

        if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
          throw new Error(
            `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
          );
        }

        return true;
      }
    } catch (e) {
      // HEAD request failed or threw, fall back to GET with range if necessary
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "image/*", Range: "bytes=0-1024" },
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
        `Unsupported image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
      );
    }

    return true;
  } catch (e) {
    throw new Error(
      `[@drgd/aura] - Image validation failed: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}
