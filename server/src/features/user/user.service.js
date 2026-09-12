import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import refTokenRepo from "../token/refreshToken/refreshToken.repository.js";

import userRepo from "./user.repository.js";

export const getAllUsersService = async (query) => {
  const users = await userRepo.findAll(query, null);

  return users;
};

export const getUserService = async (userId) => {
  const user = await userRepo.findById(userId);

  if (!user) {
    logger.warn("Get user failed", {
      userId,
      reason: "User not found",
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return user;
};

export const blockUserService = async (userId) => {
  const blockedUser = await userRepo.updateById(userId, {
    isBlackListed: true,
  });

  if (!blockedUser) {
    logger.warn("User blocking failed", {
      userId,
      reason: "User not found",
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  logger.info("User blocked successfully", {
    userId,
  });

  const removeRefToken = await refTokenRepo.deleteAllByUserId(userId)

  return blockedUser;
};

export const deleteUserService = async (userId) => {
  const userExist = await userRepo.findById(userId);

  if (!userExist) {
    logger.warn("User deletion failed", {
      userId,
      reason: "User not found",
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  const deletedUser = await userRepo.deleteById(userId);

  logger.info("User deleted successfully", {
    userId,
  });

  return deletedUser;
};
