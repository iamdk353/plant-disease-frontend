import { render, screen, waitFor } from "@testing-library/react";
import HistoryProfilePage from "@/app/app/history/page";

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

describe("HistoryProfilePage", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("redirects to / when user is not authenticated", async () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: false });
    render(<HistoryProfilePage />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("does not redirect while auth is loading", () => {
    useCurrentUserMock.mockReturnValue({ user: null, loading: true });
    render(<HistoryProfilePage />);

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("renders heading and timeline labels", () => {
    useCurrentUserMock.mockReturnValue({ user: { uid: "u-1" }, loading: false });
    render(<HistoryProfilePage />);

    expect(screen.getByText("My History")).toBeTruthy();
    expect(screen.getByText("Recent Diagnoses")).toBeTruthy();
    expect(screen.getByText("Chronological View")).toBeTruthy();
  });

  it("renders all static diagnosis entries", () => {
    useCurrentUserMock.mockReturnValue({ user: { uid: "u-1" }, loading: false });
    render(<HistoryProfilePage />);

    expect(screen.getByText("Healthy Leaf")).toBeTruthy();
    expect(screen.getByText("Late Blight")).toBeTruthy();
    expect(screen.getByText("Common Rust")).toBeTruthy();
  });
});
