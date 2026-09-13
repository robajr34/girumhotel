import {
  blockUserService,
  deleteUserService,
  getAllUsersService,
  getUserService,
} from "./user.service.js";

import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";
import { getMeService } from "../auth/auth.service.js";

export const getAllUsers = async (req, res) => {
  const users = await getAllUsersService(req.query);

  return sendResponse(res, 200, null, users);
};

export const getUser = async (req, res) => {
  const userId = validateId(req.params.userId);

  const user = await getUserService(userId);

  return sendResponse(res, 200, null, user);
};

export const getMe = async (req, res) => {
  const userId = req.user.userId;

  const user = await getMeService(userId);

  return sendResponse(res, 200, null, user);
};

export const blockUser = async (req, res) => {
  const userId = validateId(req.params.userId);

  const user = await blockUserService(userId);

  return sendResponse(res, 200, "User blacklisted successfully.", user);
};

export const deleteUser = async (req, res) => {
  const userId = validateId(req.params.userId);

  const user = await deleteUserService(userId);

  return sendResponse(res, 200, null, user);
};
