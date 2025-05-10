import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";

import {
  validateImageUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "./security";

global.fetch = vi.fn();
const mockFetch = global.fetch as Mock;

const createMockResponse = (
  status: number,
  ok: boolean,
  headers?: Record<string, string>,
  body?: any
) => ({
  ok,
  status,
  statusText: headers?.statusText || (ok ? "OK" : "Error"),
  headers: {
    get: (header: string) => headers?.[header.toLowerCase()] || null,
    ...headers,
  },
  json: async () => body,
  text: async () => String(body),
  blob: async () => new Blob([body]),
  body: body ? { cancel: vi.fn().mockResolvedValue(undefined) } : null,
});

describe("validateImageUrl", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("should resolve true for a valid HTTPS URL with correct HEAD response", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "image/jpeg" })
    );

    await expect(
      validateImageUrl("https://example.com/image.jpg")
    ).resolves.toBe(true);

    expect(mockFetch).toHaveBeenCalledWith("https://example.com/image.jpg", {
      method: "HEAD",
      headers: { Accept: "image/*" },
      mode: "cors",
      credentials: "omit",
      signal: expect.any(AbortSignal),
    });
  });

  it("should resolve true for a valid data URL with allowed type", async () => {
    const dataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`;

    await expect(validateImageUrl(dataUrl)).resolves.toBe(true);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should reject for an invalid URL format", async () => {
    await expect(validateImageUrl("invalid-url")).rejects.toThrow(
      "[@drgd/aura] - Invalid image URL format"
    );
  });

  it("should reject for non-HTTPS/data URLs", async () => {
    await expect(
      validateImageUrl("http://example.com/image.jpg")
    ).rejects.toThrow(
      "[@drgd/aura] - Only HTTPS (or HTTP for localhost) and data URLs are supported"
    );
  });

  it("should resolve for http://localhost URLs", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "image/jpeg" })
    );

    await expect(
      validateImageUrl("http://localhost:3000/image.jpg")
    ).resolves.toBe(true);

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/image.jpg", {
      method: "HEAD",
      headers: { Accept: "image/*" },
      mode: "cors",
      credentials: "omit",
      signal: expect.any(AbortSignal),
    });
  });

  it("should reject for data URL with disallowed type", async () => {
    const dataUrl = "data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==";

    await expect(validateImageUrl(dataUrl)).rejects.toThrow(
      `[@drgd/aura] - Invalid image type. Supported types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  });

  it("should fall back to GET request if HEAD fails", async () => {
    // HEAD fails
    mockFetch.mockImplementationOnce(() => {
      throw new Error("HEAD request failed"); // Or mock a non-ok response for HEAD
    });

    // GET succeeds
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "image/webp" })
    );

    await expect(
      validateImageUrl("https://example.com/image.webp")
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
        signal: expect.any(AbortSignal),
      }
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "https://example.com/image.webp",
      {
        method: "GET",
        headers: { Accept: "image/*" },
        mode: "cors",
        credentials: "omit",
        signal: expect.any(AbortSignal),
      }
    );
  });

  it("should reject if GET fallback response is not ok", async () => {
    mockFetch.mockImplementationOnce(() => {
      // HEAD fails
      throw new Error("HEAD request failed");
    });
    mockFetch.mockResolvedValueOnce(
      createMockResponse(404, false, { statusText: "Not Found" })
    ); // GET fails

    await expect(
      validateImageUrl("https://example.com/not-found.jpg")
    ).rejects.toThrow(
      "[@drgd/aura] - Image is not accessible (GET 404 Not Found)"
    );
  });

  it("should reject if GET fallback content-type is invalid", async () => {
    mockFetch.mockImplementationOnce(() => {
      // HEAD fails
      throw new Error("HEAD request failed");
    });
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, { "content-type": "application/json" })
    ); // GET has invalid content type

    await expect(
      validateImageUrl("https://example.com/json-file")
    ).rejects.toThrow(
      `[@drgd/aura] - Unsupported image type (from GET). Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`
    );
  });

  it("should reject if both HEAD and GET fetches fail (network error)", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    await expect(
      validateImageUrl("https://example.com/network-error")
    ).rejects.toThrow("[@drgd/aura] - Image validation failed: Network error");
  });

  it("should reject for image exceeding MAX_IMAGE_SIZE based on HEAD content-length", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {
        "content-type": "image/jpeg",
        "content-length": (MAX_IMAGE_SIZE + 1).toString(),
      })
    );

    await expect(
      validateImageUrl("https://example.com/large-image.jpg")
    ).rejects.toThrow(
      `[@drgd/aura] - Image size (from HEAD) exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    );
  });
});
