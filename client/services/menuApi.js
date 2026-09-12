import api from "./api";

const menuApi = {
  // Get all menu items (Public)
  async getMenu(query = {}) {
    return api.get("/menus", { params: query });
  },

  // Create menu item (Owner / Manager)
  async createMenu(payload) {
    return api.post("/menus", payload);
  },

  // Update menu item (Owner / Manager)
  async updateMenu(menuId, payload) {
    return api.patch(`/menus/${menuId}`, payload);
  },

  // Delete menu item (Owner only)
  async deleteMenu(menuId) {
    return api.delete(`/menus/${menuId}`);
  },
};

export default menuApi;
