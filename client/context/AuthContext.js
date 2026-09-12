"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import authApi from "@/services/authApi";
import staffApi from "@/services/staffApi";
import { getErrorMessage } from "@/services/api";
import { deleteToken, getToken, saveToken } from "@/utils/localStorage";

const AuthContext = createContext(null);

const STAFF_ROLES = ["owner", "manager", "receptionist"];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [guestProfile, setGuestProfile] = useState(null);

  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /*
   * ============================================================
   * PROFILE
   * ============================================================
   */

  const fetchProfile = useCallback(async (userData) => {
    if (!userData?._id) {
      return null;
    }

    /*
     * Staff / owner profile
     */
    if (STAFF_ROLES.includes(userData.role)) {
      try {
        const response = await staffApi.getMyStaffProfile();

        const profile = response.data?.data;

        if (profile) {
          setStaffProfile(profile);

          return profile;
        }

        setStaffProfile(null);
        return null;
      } catch (error) {
        /*
         * A staff profile might legitimately not exist yet
         * when requireSetup is true.
         */
        setStaffProfile(null);
        return null;
      }
    }

    /*
     * Guest profile
     *
     * Add guest profile fetching here when the guest
     * profile endpoint is required by the frontend.
     */
    if (userData.role === "guest") {
      setGuestProfile(null);
      return null;
    }

    return null;
  }, []);

  /*
   * ============================================================
   * INITIALIZE AUTHENTICATION
   * ============================================================
   *
   * IMPORTANT:
   * This function DOES NOT refresh the access token.
   *
   * Token refresh belongs exclusively to the Axios interceptor.
   *
   * This prevents:
   *
   * AuthContext → /refresh
   * Axios       → /refresh
   *
   * from consuming the same rotating refresh token twice.
   */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        if (mounted) {
          setIsLoading(false);
        }

        return;
      }

      if (mounted) {
        setToken(storedToken);
      }

      try {
        /*
         * This request is protected.
         *
         * If the access token is expired, Axios will automatically:
         *
         * 1. receive 401
         * 2. refresh the access token
         * 3. save the new token
         * 4. retry this request
         *
         * AuthContext does NOT manually refresh.
         */
        const response = await staffApi.getMyStaffProfile();

        if (!mounted) {
          return;
        }

        const profile = response.data?.data;

        if (profile) {
          setStaffProfile(profile);

          setUser({
            _id: profile.user,
            role: profile.role,
            requireSetup: false,
          });
        }
      } catch (error) {
        /*
         * If Axios already handled refresh and the request
         * still fails, the session is no longer usable.
         */
        if (!mounted) {
          return;
        }

        deleteToken();

        setToken(null);
        setUser(null);
        setStaffProfile(null);
        setGuestProfile(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * SESSION EXPIRED EVENT
   * ============================================================
   *
   * Axios dispatches this event when refresh fails.
   *
   * AuthContext only reacts to it.
   */

  useEffect(() => {
    const handleSessionExpired = () => {
      deleteToken();

      setToken(null);
      setUser(null);
      setStaffProfile(null);
      setGuestProfile(null);

      toast.error("Authentication required. Please login!");

      if (!pathname?.startsWith("/auth")) {
        router.push("/auth/login");
      }
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [pathname, router]);

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  const login = async ({ email, password }) => {
    try {
      const response = await authApi.login({
        email,
        password,
      });

      const { user: userData, accessToken } = response.data?.data || {};

      if (!accessToken || !userData) {
        throw new Error("Invalid login response.");
      }

      saveToken(accessToken);

      setToken(accessToken);
      setUser(userData);

      /*
       * Fetch associated Staff / Guest profile.
       */
      await fetchProfile(userData);

      toast.success(response.data?.message || "Logged in successfully.");

      /*
       * Handle setup state.
       */
      if (userData.requireSetup) {
        if (userData.role === "owner") {
          router.push("/auth/setup/owner/verify");
        } else {
          router.push("/auth/setup/staff/verify");
        }

        return userData;
      }

      /*
       * Guest
       */
      if (userData.role === "guest") {
        router.push("/bookings");
        return userData;
      }

      /*
       * Staff / owner
       */
      router.push("/dashboard");

      return userData;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * GUEST SIGNUP
   * ============================================================
   */

  const signup = async ({ email, password }) => {
    try {
      const response = await authApi.signup({
        email,
        password,
      });

      const { user: userData, accessToken } = response.data?.data || {};

      if (!accessToken || !userData) {
        throw new Error("Invalid signup response.");
      }

      saveToken(accessToken);

      setToken(accessToken);
      setUser(userData);

      toast.success(response.data?.message || "Account created successfully.");

      router.push("/rooms");

      return userData;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * OWNER SETUP
   * ============================================================
   */

  const setupOwner = async ({ email, password }) => {
    try {
      const response = await authApi.setupOwner({
        email,
        password,
      });

      toast.success(
        response.data?.message ||
          "Owner account created. Please check your email to verify your account.",
      );

      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * VERIFY OWNER EMAIL
   * ============================================================
   */

  const verifyOwnerEmail = async (tokenString) => {
    try {
      const response = await authApi.verifyOwnerEmail(tokenString);

      const { user: userData, accessToken } = response.data?.data || {};

      if (accessToken) {
        saveToken(accessToken);
        setToken(accessToken);
      }

      if (userData) {
        setUser(userData);
      }

      toast.success(response.data?.message || "Email verified successfully.");

      return userData;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * VERIFY STAFF EMAIL
   * ============================================================
   */

  const verifyStaffEmail = async ({ token: tokenString, password }) => {
    try {
      const response = await authApi.verifyStaffEmail({
        token: tokenString,
        password,
      });

      const { user: userData, accessToken } = response.data?.data || {};

      if (accessToken) {
        saveToken(accessToken);
        setToken(accessToken);
      }

      if (userData) {
        setUser(userData);
      }

      toast.success(response.data?.message || "Email verified successfully.");

      return userData;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * COMPLETE SETUP
   * ============================================================
   */

  const completeSetup = async ({ firstName, lastName, phone }) => {
    try {
      const response = await authApi.completeSetup({
        firstName,
        lastName,
        phone,
      });

      const staffData = response.data?.data;

      if (staffData) {
        setStaffProfile(staffData);
      }

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,
          requireSetup: false,
        };
      });

      toast.success(response.data?.message || "Setup completed.");

      router.push("/dashboard");

      return staffData;
    } catch (error) {
      const message = getErrorMessage(error);

      toast.error(message);

      throw error;
    }
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const logout = useCallback(() => {
    deleteToken();

    setToken(null);
    setUser(null);
    setStaffProfile(null);
    setGuestProfile(null);

    toast.success("Logged out successfully.");

    router.push("/auth/login");
  }, [router]);

  /*
   * ============================================================
   * REFRESH USER PROFILE
   * ============================================================
   *
   * This does NOT refresh the access token directly.
   *
   * The API layer handles token refresh automatically.
   */

  const refreshUser = useCallback(async () => {
    if (!user) {
      return;
    }

    await fetchProfile(user);
  }, [user, fetchProfile]);

  /*
   * ============================================================
   * AUTH STATE
   * ============================================================
   */

  const role = user?.role || null;

  const isAuthenticated = Boolean(token && user);

  /*
   * ============================================================
   * CONTEXT VALUE
   * ============================================================
   *
   * useMemo prevents unnecessary re-renders of the entire
   * application when unrelated state changes.
   */

  const contextValue = useMemo(
    () => ({
      user,
      role,
      token,

      staffProfile,
      guestProfile,

      isAuthenticated,
      isLoading,

      login,
      signup,

      setupOwner,
      verifyOwnerEmail,
      verifyStaffEmail,
      completeSetup,

      logout,
      refreshUser,

      setUser,
    }),
    [
      user,
      role,
      token,
      staffProfile,
      guestProfile,
      isAuthenticated,
      isLoading,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

/*
 * ================================================================
 * useAuth
 * ================================================================
 */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
