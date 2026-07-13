import { create } from "zustand";
import { apiClient, setAccessToken } from "@/lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: null,

  // Called once on app load. Tries to silently mint a new access token from
  // the httpOnly refresh cookie, so a page refresh doesn't log the user out.
  async initialize() {
    try {
      const { data } = await apiClient.post("/auth/refresh", {});
      setAccessToken(data.accessToken);
      set({ user: data.user, isInitializing: false });
    } catch {
      // No valid session yet — that's fine, the user just isn't logged in.
      set({ isInitializing: false });
    }
  },

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      set({ user: data.user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async register(name, email, password) {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post("/auth/register", { name, email, password });
      set({ isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async logout() {
    await apiClient.post("/auth/logout", {}).catch(() => undefined);
    setAccessToken(null);
    set({ user: null });
  },
}));
