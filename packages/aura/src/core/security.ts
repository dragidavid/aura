export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates image URLs for security and compatibility.
 * Checks URL structure, protocol, content-type, size limits, and CORS.
 *
 * @param url - URL to validate
 * @returns Promise resolving to true if valid
 * @throws {Error} with standardized message if validation fails
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("[@drgd/aura] - Invalid image URL format");
  }

  const isLocalhost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  const isHttp = parsed.protocol === "http:";
  const isHttps = parsed.protocol === "https:";
  const isDataUrl = url.startsWith("data:");

  if (!((isHttp && isLocalhost) || isHttps || isDataUrl)) {
    throw new Error(
      "[@drgd/aura] - Only HTTPS (or HTTP for localhost) and data URLs are supported"
    );
  }

  if (isDataUrl) {
    const mime = url.split(",")[0]?.split(":")[1]?.split(";")[0];

    if (!mime || !ALLOWED_IMAGE_TYPES.includes(mime)) {
      throw new Error(
        `[@drgd/aura] - Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
      );
    }

    return true;
  }

  let headController = new AbortController();
  let getController: AbortController | undefined;

  try {
    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        headers: { Accept: "image/*" },
        mode: "cors",
        credentials: "omit",
        signal: headController.signal,
      });

      if (headResponse.ok) {
        const contentType = headResponse.headers.get("content-type");

        if (
          !contentType ||
          !ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
        ) {
          throw new Error(
            `[@drgd/aura] - Invalid image type (from HEAD). Supported: ${ALLOWED_IMAGE_TYPES.join(", ")}`
          );
        }

        const contentLength = headResponse.headers.get("content-length");

        if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
          throw new Error(
            `[@drgd/aura] - Image size (from HEAD) exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
          );
        }

        return true;
      } else {
        console.log(
          `[@drgd/aura] - HEAD request failed for ${url}: ${headResponse.status} ${headResponse.statusText}. Attempting GET.`
        );
      }
    } catch (e: any) {
      if (
        e.message.startsWith("[@drgd/aura] - Invalid image type (from HEAD)") ||
        e.message.startsWith("[@drgd/aura] - Image size (from HEAD) exceeds")
      ) {
        throw e;
      }

      if (headController.signal.aborted) {
        throw e;
      }
    } finally {
      if (!headController.signal.aborted) {
        headController.abort();
      }
    }

    // If HEAD failed or was not ok, try GET
    getController = new AbortController();
    const getResponse = await fetch(url, {
      method: "GET",
      headers: { Accept: "image/*" },
      mode: "cors",
      credentials: "omit",
      signal: getController.signal,
    });

    if (!getResponse.ok) {
      throw new Error(
        `[@drgd/aura] - Image is not accessible (GET ${getResponse.status} ${getResponse.statusText})`
      );
    }

    const contentType = getResponse.headers.get("content-type");

    if (
      !contentType ||
      !ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())
    ) {
      throw new Error(
        `[@drgd/aura] - Unsupported image type (from GET). Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
      );
    }

    if (
      getResponse.body &&
      typeof getResponse.body.cancel === "function" &&
      !getResponse.body.locked
    ) {
      getResponse.body.cancel().catch((cancelError) => {
        console.warn(
          `[@drgd/aura] - Error cancelling response body stream for ${url}: ${cancelError.message}`
        );
      });
    }

    return true;
  } catch (e: any) {
    if (getController && !getController.signal.aborted) {
      getController.abort();
    }

    // Ensure headController is also cleaned up if an error happens before its finally block
    if (!headController.signal.aborted) {
      headController.abort();
    }

    if (e.message.startsWith("[@drgd/aura] -")) {
      throw e;
    } else if (e.name === "AbortError") {
      throw new Error(`[@drgd/aura] - Image validation aborted: ${e.message}`);
    } else {
      throw new Error(`[@drgd/aura] - Image validation failed: ${e.message}`);
    }
  }
}
