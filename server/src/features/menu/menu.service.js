import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";

import menuRepo from "./menu.repository.js";

export const createMenuService = async (data, userId) => {
  const menuExist = await menuRepo.findOne({
    name: data.name,
  });

  if (menuExist) {
    logger.warn("Menu creation failed", {
      name: data.name,
      userId,
      reason: "Menu item already exists",
    });

    throw new AppError("Menu item already exists.", 409, "MENU_ALREADY_EXISTS");
  }

  const menu = await menuRepo.create({
    ...data,
    createdBy: userId,
  });

  logger.info("Menu item created successfully", {
    menuId: menu._id,
    userId,
    name: menu.name,
    category: menu.category,
  });

  return menu;
};

export const updateMenuService = async (menuId, data, userId) => {
  const menuExist = await menuRepo.findById(menuId);

  if (!menuExist) {
    logger.warn("Menu update failed", {
      menuId,
      userId,
      reason: "Menu item not found",
    });

    throw new AppError("Menu item not found.", 404, "MENU_NOT_FOUND");
  }

  if (data.name && data.name !== menuExist.name) {
    const duplicateMenu = await menuRepo.findOne({
      name: data.name,
      _id: { $ne: menuId },
    });

    if (duplicateMenu) {
      logger.warn("Menu update failed", {
        menuId,
        userId,
        reason: "Menu item name already exists",
      });

      throw new AppError(
        "Menu item with this name already exists.",
        409,
        "MENU_ALREADY_EXISTS",
      );
    }
  }

  const updatedMenu = await menuRepo.updateById(menuId, {
    ...data,
    updatedBy: userId,
  });

  logger.info("Menu item updated successfully", {
    menuId,
    userId,
  });

  return updatedMenu;
};

export const deleteMenuService = async (menuId, userId) => {
  const menuExist = await menuRepo.findById(menuId);

  if (!menuExist) {
    logger.warn("Menu deletion failed", {
      menuId,
      userId,
      reason: "Menu item not found",
    });

    throw new AppError("Menu item not found.", 404, "MENU_NOT_FOUND");
  }

  await menuRepo.deleteById(menuId);

  logger.info("Menu item deleted successfully", {
    menuId,
    userId,
    name: menuExist.name,
  });

  return {
    menuId,
    deleted: true,
  };
};

export const getMenuService = async (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable;
  }

  if (query.search) {
    filter.name = {
      $regex: query.search,
      $options: "i",
    };
  }

  return menuRepo.findAll(filter, {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
};
