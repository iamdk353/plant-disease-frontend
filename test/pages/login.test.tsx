import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "@/app/auth/login/page";

const {
  pushMock,
  signInWithEmailAndPasswordMock,
  signInWithPopupMock,
  GoogleAuthProviderMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  signInWithPopupMock: vi.fn(),
  GoogleAuthProviderMock: vi.fn(),
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

vi.mock("@/lib/firebase", () => ({
  auth: { app: "mocked-app" },
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signInWithPopup: signInWithPopupMock,
  GoogleAuthProvider: GoogleAuthProviderMock,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    signInWithEmailAndPasswordMock.mockReset();
    signInWithPopupMock.mockReset();
    GoogleAuthProviderMock.mockReset();
  });

  it("logs in with email/password and redirects to /app", async () => {
    signInWithEmailAndPasswordMock.mockResolvedValue({});
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Login to Account/i }));

    await waitFor(() =>
      expect(signInWithEmailAndPasswordMock).toHaveBeenCalled(),
    );
    expect(pushMock).toHaveBeenCalledWith("/app");
  });

  it("shows firebase error on login failure", async () => {
    signInWithEmailAndPasswordMock.mockRejectedValue(new Error("bad creds"));
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrong" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Login to Account/i }));

    await waitFor(() => expect(screen.getByText("bad creds")).toBeTruthy());
  });

  it("logs in with google and redirects to /", async () => {
    signInWithPopupMock.mockResolvedValue({});
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));

    await waitFor(() => expect(signInWithPopupMock).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows google login error", async () => {
    signInWithPopupMock.mockRejectedValue(new Error("google failed"));
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() => expect(screen.getByText("google failed")).toBeTruthy());
  });

  it("constructs GoogleAuthProvider during google login", async () => {
    signInWithPopupMock.mockResolvedValue({});
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() => expect(GoogleAuthProviderMock).toHaveBeenCalledTimes(1));
  });

  it("shows loading state while email login is pending", async () => {
    let resolveLogin: ((value: unknown) => void) | null = null;
    signInWithEmailAndPasswordMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Login to Account/i }));

    await waitFor(() => expect(screen.getByText("Logging In...")).toBeTruthy());
    expect(
      screen.getByRole("button", { name: "Logging In..." }).hasAttribute("disabled"),
    ).toBe(true);

    resolveLogin?.({});
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Login to Account/i })).toBeTruthy(),
    );
  });

  it("shows fallback error when google login rejects without message", async () => {
    signInWithPopupMock.mockRejectedValue({});
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() =>
      expect(screen.getByText("Google login failed")).toBeTruthy(),
    );
  });
});
