import api from "./api";

const guestApi = {
  // Get all guests (Owner / Manager)
  async getAllGuests(query = {}) {
    return api.get("/guests", { params: query });
  },

  // Get single guest
  async getGuest(guestId) {
    return api.get(`/guests/${guestId}`);
  },

  // Create guest profile
  async createGuest(payload) {
    return api.post("/guests", payload);
  },

  // Update guest profile
  async updateGuest(guestId, payload) {
    return api.patch(`/guests/${guestId}`, payload);
  },
};

export default guestApi;
