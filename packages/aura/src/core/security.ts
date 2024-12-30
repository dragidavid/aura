const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates image URLs and checks CORS/content type
 * Falls back to GET request if HEAD is not allowed
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);

    // Only allow https or data URLs
    if (!(parsed.protocol === "https:" || url.startsWith("data:"))) {
      throw new Error("Only HTTPS or data URLs are supported");
    }

    // For data URLs, validate mime type
    if (url.startsWith("data:")) {
      const mime = url.split(",")[0]?.split(":")[1]?.split(";")[0];
      if (!mime || !ALLOWED_IMAGE_TYPES.includes(mime)) {
        throw new Error("Invalid image type");
      }

      return true;
    }

    // Try HEAD request first
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        headers: { Accept: "image/*" },
      });

      if (headResponse.ok) {
        const contentType = headResponse.headers.get("content-type");
        if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
          throw new Error("Invalid image type");
        }

        const contentLength = headResponse.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
          throw new Error("Image size exceeds maximum allowed size");
        }

        return true;
      }
    } catch (headError) {
      // HEAD request failed, fall back to GET
      console.warn("HEAD request failed, falling back to GET request");
    }

    // Fall back to GET request with range header to minimize data transfer
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/*",
        Range: "bytes=0-1024", // Only request first KB to check type
      },
    });

    if (!response.ok) throw new Error("Image URL is not accessible");

    const contentType = response.headers.get("content-type");
    if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error("Invalid image type");
    }

    // For GET requests, we might not get content-length due to Range header
    // So we'll need to trust the server's content-type
    return true;
  } catch (error) {
    throw new Error(
      `Invalid image URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
