import { buildActivityImageUrl, getApiBaseUrl } from "@/lib/api";

describe("getApiBaseUrl", () => {
  it("uses NEXT_PUBLIC_API_URL and trims trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com///");
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("falls back to localhost when env is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(getApiBaseUrl()).toBe("http://localhost:8000");
  });

  it("keeps URL untouched when there are no trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("trims a single trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });
});

describe("buildActivityImageUrl", () => {
  it("builds encoded activity image URL", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
    expect(buildActivityImageUrl("leaf image(1).jpg")).toBe(
      "https://api.example.com/activities/image/leaf%20image(1).jpg",
    );
  });

  it("encodes special characters safely", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/");
    expect(buildActivityImageUrl("leaf/#1?.jpg")).toBe(
      "https://api.example.com/activities/image/leaf%2F%231%3F.jpg",
    );
  });

  it("uses fallback host when env is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(buildActivityImageUrl("a b.png")).toBe(
      "http://localhost:8000/activities/image/a%20b.png",
    );
  });
});
