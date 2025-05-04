import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateImageUrl } from "./security";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createMockResponse(
  status: number,
  ok: boolean,
  headersInit: Record<string, string> = {},
  body?: BodyInit | null,
): Partial<Response> {
  const headers = new Headers(headersInit);

  return {
    ok,
    status,
    headers: headers,
  };
}

describe("validateImageUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve true for a valid HTTPS URL with correct HEAD response", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {
        "content-type": "image/jpeg",
        "content-length": "1024",
      }),
    );

    await expect(
      validateImageUrl("https://example.com/image.jpg"),
    ).resolves.toBe(true);
    expect(mockFetch).toHaveBeenCalledWith("https://example.com/image.jpg", {
      method: "HEAD",
      headers: { Accept: "image/*" },
      mode: "cors",
      credentials: "omit",
    });
  });

  it("should resolve true for a valid data URL with allowed type", async () => {
    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    await expect(validateImageUrl(dataUrl)).resolves.toBe(true);

    expect(mockFetch).not.toHaveBeenCalled(); // Should not fetch for data URLs
  });

  it("should reject for an invalid URL format", async () => {
    await expect(validateImageUrl("invalid-url")).rejects.toThrow(
      "Image validation failed: Invalid image URL format",
    );
  });

  it("should reject for non-HTTPS/data URLs", async () => {
    await expect(
      validateImageUrl("http://example.com/image.jpg"),
    ).rejects.toThrow(
      "Image validation failed: Only HTTPS and data URLs are supported",
    );
    await expect(
      validateImageUrl("ftp://example.com/image.jpg"),
    ).rejects.toThrow(
      "Image validation failed: Only HTTPS and data URLs are supported",
    );
  });

  it("should reject for data URL with disallowed type", async () => {
    const dataUrl = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==";

    await expect(validateImageUrl(dataUrl)).rejects.toThrow(
      /Image validation failed: Invalid image type. Supported types:/i,
    );
  });

  it("should fall back to GET request if HEAD fails", async () => {
    // Mock HEAD failure (e.g., network error or 405 Method Not Allowed)
    mockFetch.mockRejectedValueOnce(new Error("HEAD request failed"));
    // Mock successful GET response
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "image/webp" }),
    );

    await expect(
      validateImageUrl("https://example.com/image.webp"),
    ).resolves.toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      "https://example.com/image.webp",
      {
        method: "HEAD",
        headers: { Accept: "image/*" },
        mode: "cors",
        credentials: "omit",
      },
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://example.com/image.webp",
      {
        method: "GET",
        headers: { Accept: "image/*", Range: "bytes=0-1024" },
        mode: "cors",
        credentials: "omit",
      },
    );
  });

  it("should reject if GET fallback response is not ok", async () => {
    mockFetch.mockRejectedValueOnce(new Error("HEAD request failed"));
    mockFetch.mockResolvedValueOnce(createMockResponse(404, false)); // GET fails

    await expect(
      validateImageUrl("https://example.com/not-found.jpg"),
    ).rejects.toThrow(/Image is not accessible \(HTTP 404\)/i);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should reject if GET fallback content-type is invalid", async () => {
    mockFetch.mockRejectedValueOnce(new Error("HEAD request failed"));
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "application/json" }),
    );

    await expect(
      validateImageUrl("https://example.com/json-file"),
    ).rejects.toThrow(/Unsupported image type/i);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should reject if both HEAD and GET fetches fail", async () => {
    mockFetch.mockRejectedValueOnce(new Error("HEAD fetch failed"));
    mockFetch.mockRejectedValueOnce(new Error("GET fetch failed"));

    await expect(
      validateImageUrl("https://example.com/network-error"),
    ).rejects.toThrow(
      /Image validation failed: GET fetch failed/, // Error from the second fetch
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
