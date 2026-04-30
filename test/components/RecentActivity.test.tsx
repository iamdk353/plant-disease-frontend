import { render, screen, waitFor } from "@testing-library/react";
import RecentActivity from "@/app/components/RecentActivity";

const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: useCurrentUserMock,
}));

describe("RecentActivity", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    useCurrentUserMock.mockReturnValue({ user: { uid: "u-1" } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders top 3 newest activities sorted by date", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          image_name: "old.jpg",
          created_at: "2024-01-01T10:00:00.000Z",
          results: [{ label: "old_result", confidence: 0.7, rank: 1 }],
        },
        {
          id: "2",
          image_name: "newest.jpg",
          created_at: "2024-04-01T10:00:00.000Z",
          results: [{ label: "newest_result", confidence: 0.9, rank: 1 }],
        },
        {
          id: "3",
          image_name: "mid.jpg",
          created_at: "2024-03-01T10:00:00.000Z",
          results: [{ label: "mid_result", confidence: 0.4, rank: 1 }],
        },
        {
          id: "4",
          image_name: "new.jpg",
          created_at: "2024-03-20T10:00:00.000Z",
          results: [{ label: "new_result", confidence: 0.8, rank: 1 }],
        },
      ],
    } as Response);

    render(<RecentActivity />);

    await waitFor(() =>
      expect(screen.queryByText("Loading activities...")).toBeNull(),
    );

    expect(screen.getByText("newest result")).toBeTruthy();
    expect(screen.getByText("new result")).toBeTruthy();
    expect(screen.getByText("mid result")).toBeTruthy();
    expect(screen.queryByText("old result")).toBeNull();
  });

  it("shows empty state when API returns no activities", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<RecentActivity />);

    await waitFor(() =>
      expect(screen.getByText("No recent activity found.")).toBeTruthy(),
    );
  });

  it("shows empty state on fetch failure", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => [],
    } as Response);

    render(<RecentActivity />);

    await waitFor(() =>
      expect(screen.getByText("No recent activity found.")).toBeTruthy(),
    );
  });

  it("does not call API when user is not available", () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    useCurrentUserMock.mockReturnValue({ user: null });

    render(<RecentActivity />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders Healthy badge for healthy result", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          image_name: "leaf.jpg",
          created_at: "2024-04-01T10:00:00.000Z",
          results: [{ label: "tomato_healthy", confidence: 0.3, rank: 1 }],
        },
      ],
    } as Response);

    render(<RecentActivity />);
    await waitFor(() => expect(screen.getByText("Healthy")).toBeTruthy());
  });

  it("renders High Risk badge for high-confidence disease", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          image_name: "leaf.jpg",
          created_at: "2024-04-01T10:00:00.000Z",
          results: [{ label: "late_blight", confidence: 0.95, rank: 1 }],
        },
      ],
    } as Response);

    render(<RecentActivity />);
    await waitFor(() => expect(screen.getByText("High Risk")).toBeTruthy());
  });

  it("renders Warning badge for lower-confidence disease", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          image_name: "leaf.jpg",
          created_at: "2024-04-01T10:00:00.000Z",
          results: [{ label: "late_blight", confidence: 0.4, rank: 1 }],
        },
      ],
    } as Response);

    render(<RecentActivity />);
    await waitFor(() => expect(screen.getByText("Warning")).toBeTruthy());
  });

  it("links each activity card to advisory page", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "1",
          image_name: "leaf.jpg",
          created_at: "2024-04-01T10:00:00.000Z",
          results: [{ label: "late_blight", confidence: 0.8, rank: 1 }],
        },
      ],
    } as Response);

    render(<RecentActivity />);
    await waitFor(() => expect(screen.getByText("late blight")).toBeTruthy());
    expect(screen.getByRole("link", { name: /late blight/i }).getAttribute("href")).toBe("/app/adivise");
  });

  it("shows empty state when fetch throws", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network"));

    render(<RecentActivity />);
    await waitFor(() =>
      expect(screen.getByText("No recent activity found.")).toBeTruthy(),
    );
  });
});
