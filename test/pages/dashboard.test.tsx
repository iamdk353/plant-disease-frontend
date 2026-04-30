import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/app/page";

const { useCurrentUserMock, pushMock } = vi.hoisted(() => ({
  useCurrentUserMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
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

vi.mock("@/app/components/Nav", () => ({
  default: () => <div data-testid="nav-mock">Nav</div>,
}));

vi.mock("@/app/components/RecentActivity", () => ({
  default: () => <div data-testid="recent-activity-mock">RecentActivity</div>,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to / when user is not authenticated", async () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: false });
    render(<DashboardPage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("does not redirect while loading auth", () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: true });
    render(<DashboardPage />);

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows default user name when displayName is missing", () => {
    vi.spyOn(Date.prototype, "getHours").mockReturnValue(9);
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: null },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Farmer!/)).toBeTruthy();
  });

  it("shows first name from displayName", () => {
    vi.spyOn(Date.prototype, "getHours").mockReturnValue(9);
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Jane!/)).toBeTruthy();
  });

  it("shows Good morning greeting", () => {
    vi.spyOn(Date.prototype, "getHours").mockReturnValue(9);
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Good morning,/)).toBeTruthy();
  });

  it("shows Good afternoon greeting", () => {
    vi.spyOn(Date.prototype, "getHours").mockReturnValue(13);
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Good afternoon,/)).toBeTruthy();
  });

  it("shows Good evening greeting", () => {
    vi.spyOn(Date.prototype, "getHours").mockReturnValue(20);
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText(/Good evening,/)).toBeTruthy();
  });

  it("navigates to diagnose on primary card click", () => {
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByText("Diagnose My Crop"));
    expect(pushMock).toHaveBeenCalledWith("/app/diagnoise");
  });

  it("navigates to diagnose from mobile detect button", () => {
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    fireEvent.click(screen.getByRole("button", { name: /Detect/i }));
    expect(pushMock).toHaveBeenCalledWith("/app/diagnoise");
  });

  it("renders key sections and advisory link", () => {
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1", displayName: "Jane Doe" },
      loading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByTestId("nav-mock")).toBeTruthy();
    expect(screen.getByTestId("recent-activity-mock")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /What Should I Plant\?/i }).getAttribute("href"),
    ).toBe("/app/adivise");
  });
});
