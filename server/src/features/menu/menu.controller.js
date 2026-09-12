import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

import {
  createMenuService,
  updateMenuService,
  deleteMenuService,
  getMenuService,
} from "./menu.service.js";

export const createMenu = async (req, res) => {
  const menu = await createMenuService(req.body, req.user.userId);

  return sendResponse(res, 201, "Menu item created successfully.", menu);
};

export const updateMenu = async (req, res) => {
  const menuId = validateId(req.params.menuId);

  const menu = await updateMenuService(menuId, req.body, req.user.userId);

  return sendResponse(res, 200, "Menu item updated successfully.", menu);
};

export const deleteMenu = async (req, res) => {
  const menuId = validateId(req.params.menuId);

  const result = await deleteMenuService(menuId, req.user.userId);

  return sendResponse(res, 200, "Menu item deleted successfully.", result);
};

export const getMenu = async (req, res) => {
  const result = await getMenuService(req.query);

  return sendResponse(res, 200, "Menu retrieved successfully.", result);
};
