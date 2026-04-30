import { renderHook, waitFor } from "@testing-library/react";
import type { User } from "firebase/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const { authMock, onAuthStateChangedMock } = vi.hoisted(() => ({
  authMock: { app: "test-app" },
  onAuthStateChangedMock: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: authMock,
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: onAuthStateChangedMock,
}));

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns authenticated user and loading false", async () => {
    const unsubscribe = vi.fn();
    const mockUser = { uid: "user-123" } as User;

    onAuthStateChangedMock.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        callback(mockUser);
        return unsubscribe;
      },
    );

    const { result } = renderHook(() => useCurrentUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.uid).toBe("user-123");
  });

  it("returns null user when not authenticated", async () => {
    onAuthStateChangedMock.mockImplementation(
      (_auth: unknown, callback: (user: User | null) => void) => {
        callback(null);
        return vi.fn();
      },
    );

    const { result } = renderHook(() => useCurrentUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    onAuthStateChangedMock.mockImplementation(
      () => unsubscribe,
    );

    const { unmount } = renderHook(() => useCurrentUser());
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
