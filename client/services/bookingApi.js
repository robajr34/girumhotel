import api from "./api";

const bookingApi = {
  // Create booking
  async createBooking(payload) {
    return api.post("/bookings", payload);
  },

  // Get all bookings (Owner / Manager)
  async getAllBookings(query = {}) {
    return api.get("/bookings", { params: query });
  },

  // Search booking by booking number
  async getBookingByNumber(bookingNumber) {
    return api.get("/bookings/search", { params: { bookingNumber } });
  },

  // Get bookings belonging to a guest
  async getGuestBookings(guestId, query = {}) {
    return api.get(`/bookings/guest/${guestId}`, { params: query });
  },

  // Get single booking by ID
  async getBooking(bookingId) {
    return api.get(`/bookings/${bookingId}`);
  },

  // Update booking details
  async updateBooking(bookingId, payload) {
    return api.patch(`/bookings/${bookingId}`, payload);
  },

  // Confirm booking (Manager / Owner / Receptionist)
  async confirmBooking(bookingId) {
    return api.patch(`/bookings/${bookingId}/confirm`);
  },

  // Check in guest (Manager / Owner / Receptionist)
  async checkInBooking(bookingId) {
    return api.patch(`/bookings/${bookingId}/check-in`);
  },

  // Check out guest (Manager / Owner / Receptionist)
  async checkOutBooking(bookingId) {
    return api.patch(`/bookings/${bookingId}/check-out`);
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    return api.patch(`/bookings/${bookingId}/cancel`);
  },

  // Delete booking (Manager / Owner / Guest)
  async deleteBooking(bookingId) {
    return api.delete(`/bookings/${bookingId}`);
  },
};

export default bookingApi;
