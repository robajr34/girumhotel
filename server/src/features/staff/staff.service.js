import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";

import staffRepo from "./staff.repository.js";
import userRepo from "../user/user.repository.js";

export const createStaffService = async (data, userId) => {
  const staffExist = await staffRepo.findByUserId(userId);
  const userExist = await userRepo.findById(userId);

  if (!userExist) {
    logger.warn("Staff creation failed", {
      userId,
      reason: "User not found",
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (staffExist) {
    logger.warn("Staff creation failed", {
      userId,
      reason: "Staff profile already exists",
      staffId: staffExist._id,
    });

    throw new AppError(
      "Staff profile already exists.",
      409,
      "STAFF_ALREADY_EXISTS",
    );
  }

  const staff = await staffRepo.create({
    user: userId,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: userExist.role,
  });

  userExist.requireSetup = false;
  await userExist.save();

  logger.info("Staff created successfully", {
    staffId: staff._id,
    userId,
    role: staff.role,
  });

  return staff;
};

export const getStaffByIdService = async (staffId) => {
  const staff = await staffRepo.findByIdWithUser(staffId);

  if (!staff) {
    logger.warn("Get staff failed", {
      staffId,
      reason: "Staff member not found",
    });

    throw new AppError("Staff member not found.", 404, "STAFF_NOT_FOUND");
  }

  return staff;
};

export const getMyStaffProfileService = async (userId) => {
  const staff = await staffRepo.findByUserId(userId);

  if (!staff) {
    logger.warn("Get staff profile failed", {
      userId,
      reason: "Staff profile not found",
    });

    throw new AppError("Staff profile not found.", 404, "STAFF_NOT_FOUND");
  }

  return staff;
};

export const getStaffByRoleService = async (role) => {
  return staffRepo.findByRole(role);
};

export const getAllStaffService = async (query = {}) => {
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  return staffRepo.findAll(filter, {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
};

export const updateStaffService = async (staffId, data) => {
  const staffExist = await staffRepo.findById(staffId);

  if (!staffExist) {
    logger.warn("Staff update failed", {
      staffId,
      reason: "Staff member not found",
    });

    throw new AppError("Staff member not found.", 404, "STAFF_NOT_FOUND");
  }

  const updatedStaff = await staffRepo.updateById(staffId, data);

  logger.info("Staff updated successfully", {
    staffId,
    userId: staffExist.user,
  });

  return updatedStaff;
};

export const updateMyStaffProfileService = async (userId, data) => {
  const staffExist = await staffRepo.findByUserId(userId);

  if (!staffExist) {
    logger.warn("Staff profile update failed", {
      userId,
      reason: "Staff profile not found",
    });

    throw new AppError("Staff profile not found.", 404, "STAFF_NOT_FOUND");
  }

  const updatedStaff = await staffRepo.updateByUserId(userId, data);

  logger.info("Staff profile updated successfully", {
    staffId: staffExist._id,
    userId,
  });

  return updatedStaff;
};

export const deleteStaffService = async (staffId) => {
  const staffExist = await staffRepo.findById(staffId);

  if (!staffExist) {
    logger.warn("Staff deletion failed", {
      staffId,
      reason: "Staff member not found",
    });

    throw new AppError("Staff member not found.", 404, "STAFF_NOT_FOUND");
  }

  await staffRepo.deleteById(staffId);

  logger.info("Staff deleted successfully", {
    staffId,
    userId: staffExist.user,
    role: staffExist.role,
  });

  return {
    staffId,
    deleted: true,
  };
};
