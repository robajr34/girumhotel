import api from "./api";

const userApi = {
  // Get all users (Owner / Manager)
  async getAllUsers(query = {}) {
    return api.get("/users", { params: query });
  },

  // Get single user
  async getUser(userId) {
    return api.get(`/users/${userId}`);
  },

  // Get user details by userId
  async getMe() {
    return api.get(`/users/me`);
  },

  // Block user (Owner / Manager)
  async blockUser(userId) {
    return api.patch(`/users/${userId}/block`);
  },

  // Delete user (Owner / Manager)
  async deleteUser(userId) {
    return api.delete(`/users/${userId}`);
  },
};

export default userApi;
