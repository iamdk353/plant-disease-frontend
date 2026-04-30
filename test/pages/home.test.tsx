import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

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

describe("Home page", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("redirects to /app when authenticated", async () => {
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1" },
      loading: false,
    });

    render(<Home />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/app"));
  });

  it("shows landing content when unauthenticated", () => {
    useCurrentUserMock.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Home />);
    expect(screen.getByText(/Your plants,/i)).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("does not redirect while auth state is loading", () => {
    useCurrentUserMock.mockReturnValue({
      user: { uid: "u-1" },
      loading: true,
    });

    render(<Home />);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("renders auth navigation links", () => {
    useCurrentUserMock.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Home />);
    expect(screen.getByRole("link", { name: "Login" }).getAttribute("href")).toBe("/auth/login");
    expect(screen.getByRole("link", { name: "Get Started" }).getAttribute("href")).toBe("/auth/signup");
  });
});
