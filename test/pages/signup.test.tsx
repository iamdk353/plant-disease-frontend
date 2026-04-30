import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SignupPage from "@/app/auth/signup/page";

const {
  pushMock,
  createUserWithEmailAndPasswordMock,
  updateProfileMock,
  signInWithPopupMock,
  GoogleAuthProviderMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  createUserWithEmailAndPasswordMock: vi.fn(),
  updateProfileMock: vi.fn(),
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
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  updateProfile: updateProfileMock,
  signInWithPopup: signInWithPopupMock,
  GoogleAuthProvider: GoogleAuthProviderMock,
}));

describe("SignupPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    createUserWithEmailAndPasswordMock.mockReset();
    updateProfileMock.mockReset();
    signInWithPopupMock.mockReset();
    GoogleAuthProviderMock.mockReset();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => "",
    } as Response);
    // Suppress expected console.error output from backend error paths so tests stay clean
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates account, updates profile, syncs backend, then redirects to /", async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: { uid: "u1", email: "u1@example.com" },
    });
    updateProfileMock.mockResolvedValue({});

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() =>
      expect(createUserWithEmailAndPasswordMock).toHaveBeenCalled(),
    );
    expect(updateProfileMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ displayName: "John Smith" }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows firebase error when signup fails", async () => {
    createUserWithEmailAndPasswordMock.mockRejectedValue(
      new Error("signup failed"),
    );

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "bad" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => expect(screen.getByText("signup failed")).toBeTruthy());
  });

  it("handles google signup and redirects to /app", async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: "u2", email: "u2@example.com" },
    });

    render(<SignupPage />);
    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));

    await waitFor(() => expect(signInWithPopupMock).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/app");
  });

  it("constructs GoogleAuthProvider when google signup starts", async () => {
    signInWithPopupMock.mockResolvedValue({
      user: { uid: "u2", email: "u2@example.com" },
    });
    render(<SignupPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() => expect(GoogleAuthProviderMock).toHaveBeenCalledTimes(1));
  });

  it("continues to redirect even when backend register fails after signup", async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: { uid: "u1", email: "u1@example.com" },
    });
    updateProfileMock.mockResolvedValue({});
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("backend down"));

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("continues to redirect even when backend returns non-ok", async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({
      user: { uid: "u1", email: "u1@example.com" },
    });
    updateProfileMock.mockResolvedValue({});
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      text: async () => "bad request",
    } as Response);

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("shows loading state while signup is pending", async () => {
    let resolveSignup: ((value: unknown) => void) | null = null;
    createUserWithEmailAndPasswordMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        }),
    );
    updateProfileMock.mockResolvedValue({});
    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() =>
      expect(
        screen
          .getByRole("button", { name: "Creating Account..." })
          .hasAttribute("disabled"),
      ).toBe(true),
    );

    resolveSignup?.({ user: { uid: "u1", email: "u1@example.com" } });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Create Account/i })).toBeTruthy(),
    );
  });

  it("shows fallback error when firebase signup fails without message", async () => {
    createUserWithEmailAndPasswordMock.mockRejectedValue({});
    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText("john@example.com"), {
      target: { value: "u1@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "secret123" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() =>
      expect(screen.getByText("Failed to create an account.")).toBeTruthy(),
    );
  });

  it("shows google fallback error when popup login fails without message", async () => {
    signInWithPopupMock.mockRejectedValue({});
    render(<SignupPage />);

    fireEvent.click(screen.getByRole("button", { name: /Continue with Google/i }));
    await waitFor(() =>
      expect(screen.getByText("Google login failed")).toBeTruthy(),
    );
  });
});
