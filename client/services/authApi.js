import api from "./api";

const authApi = {
  // =========================
  // Owner Setup
  // =========================
  async setupOwner(payload) {
    return api.post("/auth/setup/owner", payload);
  },

  async verifyOwnerEmail(token) {
    return api.post("/auth/setup/owner/verify-email", { token });
  },

  // =========================
  // Authentication
  // =========================
  async login(payload) {
    return api.post("/auth/login", payload);
  },

  async signup(payload) {
    return api.post("/auth/signup", payload);
  },

  async refreshToken() {
    return api.post("/auth/refresh");
  },

  // =========================
  // Staff Setup
  // =========================
  async setupStaff(payload) {
    return api.post("/auth/setup/staff", payload);
  },

  async verifyStaffEmail({ token, password }) {
    return api.post("/auth/setup/staff/verify-email", { token, password });
  },

  async completeSetup(payload) {
    return api.post("/auth/setup/complete-setup", payload);
  },

  // =========================
  // Logout
  // =========================
  async logout() {
    return api.post("/auth/logout");
  },
};

export default authApi;
