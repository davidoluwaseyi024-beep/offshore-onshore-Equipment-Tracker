import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  register as apiRegister,
  type RegisterPayload,
} from "../api/auth";
import type { User } from "../types/user";

/** Thrown by `login()` when a `validate` callback rejects the logged-in user (e.g. wrong login tab for their role). */
export class RoleMismatchError extends Error {}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /**
   * `validate` runs against the freshly-authenticated user *before* the user
   * is committed to context state. This matters: committing first (even
   * briefly) flips `isAuthenticated` to true, which unmounts the login page
   * via its own `<Navigate>` before the caller gets a chance to reject the
   * login and show an error — validating first avoids that race entirely.
   */
  login: (email: string, password: string, validate?: (user: User) => string | null) => Promise<User>;
  /** Every self-registered account comes back as `technician` — the backend enforces this regardless of what's sent. */
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasBootstrapped = useRef(false);

  // On first load there's no access token in memory yet (a fresh tab), but
  // the httpOnly refresh cookie may still be valid — silently try to
  // re-establish the session before deciding the user is logged out.
  //
  // Guarded by `hasBootstrapped`: React StrictMode double-invokes effects in
  // dev, and refresh-token rotation blacklists the token on first use — a
  // second, near-simultaneous refresh call would present an already-used
  // token and fail, incorrectly logging the user out. The ref (not a local
  // `cancelled` closure) is what makes the guard survive StrictMode's
  // synthetic mount→cleanup→mount: a closure-scoped flag would be reset to
  // false by the second mount, but by then the *first* mount's cleanup has
  // already fired and would silently swallow the in-flight request's result.
  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    (async () => {
      try {
        await refreshSession();
        const me = await fetchMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener("auth:session-expired", handleExpired);
    return () => window.removeEventListener("auth:session-expired", handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string, validate?: (user: User) => string | null) => {
    const loggedInUser = await apiLogin(email, password);
    if (validate) {
      const rejectionMessage = validate(loggedInUser);
      if (rejectionMessage) {
        await apiLogout();
        throw new RoleMismatchError(rejectionMessage);
      }
    }
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const registeredUser = await apiRegister(payload);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
