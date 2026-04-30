import { render, screen } from "@testing-library/react";
import Nav from "@/app/components/Nav";

const { usePathnameMock, useCurrentUserMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(),
  useCurrentUserMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
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

describe("Nav", () => {
  beforeEach(() => {
    useCurrentUserMock.mockReturnValue({ user: null });
  });

  it("highlights the current nav route", () => {
    usePathnameMock.mockReturnValue("/app/diagnoise");

    render(<Nav />);
    const diagnoseLink = screen.getByRole("link", { name: "Diagnose" });
    expect(diagnoseLink.className).toContain("text-primary");
    expect(diagnoseLink.className).toContain("font-bold");
  });

  it("uses fallback profile image when user photoURL is missing", () => {
    usePathnameMock.mockReturnValue("/app");
    useCurrentUserMock.mockReturnValue({ user: { photoURL: null } });

    render(<Nav />);
    const profileImg = screen.getByAltText("Farmer's profile picture");
    expect(profileImg.getAttribute("src")).toContain("googleusercontent.com");
  });

  it("uses user photoURL when available", () => {
    usePathnameMock.mockReturnValue("/app");
    useCurrentUserMock.mockReturnValue({
      user: { photoURL: "https://example.com/user.jpg" },
    });

    render(<Nav />);
    const profileImg = screen.getByAltText("Farmer's profile picture");
    expect(profileImg.getAttribute("src")).toBe("https://example.com/user.jpg");
  });

  it("marks dashboard active only on exact /app route", () => {
    usePathnameMock.mockReturnValue("/app");
    render(<Nav />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const diagnoseLink = screen.getByRole("link", { name: "Diagnose" });
    expect(dashboardLink.className).toContain("text-primary");
    expect(diagnoseLink.className).toContain("font-medium");
    expect(diagnoseLink.className).not.toContain("font-bold");
  });

  it("marks profile avatar border active on profile route", () => {
    usePathnameMock.mockReturnValue("/app/profile");
    render(<Nav />);

    const profileImg = screen.getByAltText("Farmer's profile picture");
    expect(profileImg.className).toContain("border-primary");
  });

  it("renders expected navigation links", () => {
    usePathnameMock.mockReturnValue("/app");
    render(<Nav />);

    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/app");
    expect(screen.getByRole("link", { name: "Diagnose" }).getAttribute("href")).toBe("/app/diagnoise");
    expect(screen.getByRole("link", { name: "Advise" }).getAttribute("href")).toBe("/app/adivise");
    expect(screen.getByRole("link", { name: "Profile" }).getAttribute("href")).toBe("/app/profile");
  });
});
