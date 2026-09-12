import api from "./api";

const roomApi = {
  // Get all rooms (supports pagination & sorting)
  async getRooms(query = {}) {
    return api.get("/rooms", { params: query });
  },

  // Get available rooms
  async getAvailableRooms(query = {}) {
    return api.get("/rooms/status/available", { params: query });
  },

  // Search rooms
  async searchRooms(searchTerm) {
    return api.get("/rooms/search", { params: { q: searchTerm } });
  },

  // Get room by ID
  async getRoomById(roomId) {
    return api.get(`/rooms/${roomId}`);
  },

  // Create room (Owner only)
  async createRoom(payload) {
    return api.post("/rooms", payload);
  },

  // Update room details (Owner / Manager)
  async updateRoom(roomId, payload) {
    return api.patch(`/rooms/${roomId}`, payload);
  },

  // Update room status (Owner / Manager / Receptionist)
  async updateRoomStatus(roomId, status) {
    return api.patch(`/rooms/${roomId}/status`, { status });
  },

  // Deactivate room (Owner / Manager)
  async deactivateRoom(roomId) {
    return api.patch(`/rooms/${roomId}/deactivate`);
  },

  // Delete room (Owner only)
  async deleteRoom(roomId) {
    return api.delete(`/rooms/${roomId}`);
  },
};

export default roomApi;
