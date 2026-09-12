import { Router } from "express";

import {
  createMenu,
  updateMenu,
  deleteMenu,
  getMenu,
} from "./menu.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { permit } from "../../middlewares/authorize.js";

import validate from "../../middlewares/validator.js";

import {
  createMenuValidator,
  updateMenuValidator,
} from "./menu.validator.js";

const menuRouter = Router();

// GET MENU
menuRouter.get("/", getMenu);

// CREATE MENU
menuRouter.post(
  "/",
  authenticate,
  permit("owner", "manager"),
  validate(createMenuValidator),
  createMenu,
);

// UPDATE MENU
menuRouter.patch(
  "/:menuId",
  authenticate,
  permit("owner", "manager"),
  validate(updateMenuValidator),
  updateMenu,
);

// DELETE MENU
menuRouter.delete(
  "/:menuId",
  authenticate,
  permit("owner"),
  deleteMenu,
);

export default menuRouter;
