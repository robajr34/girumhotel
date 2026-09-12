import api from "./api";

const staffApi = {
  // Get my staff profile
  async getMyStaffProfile() {
    return api.get("/staffs/me");
  },

  // Update my staff profile
  async updateMyStaffProfile(payload) {
    return api.patch("/staffs/me", payload);
  },

  // Create staff profile
  async createStaff(payload) {
    return api.post("/staffs", payload);
  },

  // Get all staff (Owner / Manager)
  async getAllStaff(query = {}) {
    return api.get("/staffs", { params: query });
  },

  // Get staff by role
  async getStaffByRole(role, query = {}) {
    return api.get(`/staffs/role/${role}`, { params: query });
  },

  // Get staff by ID
  async getStaffById(staffId) {
    return api.get(`/staffs/${staffId}`);
  },

  // Update staff (Owner / Manager)
  async updateStaff(staffId, payload) {
    return api.patch(`/staffs/${staffId}`, payload);
  },

  // Delete staff (Owner only)
  async deleteStaff(staffId) {
    return api.delete(`/staffs/${staffId}`);
  },
};

export default staffApi;
