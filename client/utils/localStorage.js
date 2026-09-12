// Safe synchronous token storage helper

const TOKEN_KEY = "hotel_access_token";

export const saveToken = (token) => {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error("Failed to save token to localStorage", e);
  }
};

export const deleteToken = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to remove token from localStorage", e);
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error("Failed to get token from localStorage", e);
    return null;
  }
};
