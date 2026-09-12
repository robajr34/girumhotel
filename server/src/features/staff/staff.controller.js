import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

import {
  createStaffService,
  getAllStaffService,
  getStaffByIdService,
  getMyStaffProfileService,
  getStaffByRoleService,
  updateStaffService,
  updateMyStaffProfileService,
  deleteStaffService,
} from "./staff.service.js";

export const createStaff = async (req, res) => {
  const staff = await createStaffService(req.body, req.user.userId);

  return sendResponse(res, 201, "Staff created successfully.", staff);
};

export const getAllStaff = async (req, res) => {
  const result = await getAllStaffService(req.query);

  return sendResponse(res, 200, "Staff retrieved successfully.", result);
};

export const getStaffById = async (req, res) => {
  const staffId = validateId(req.params.staffId);

  const staff = await getStaffByIdService(staffId);

  return sendResponse(res, 200, "Staff retrieved successfully.", staff);
};

export const getMyStaffProfile = async (req, res) => {
  const staff = await getMyStaffProfileService(req.user.userId);

  return sendResponse(res, 200, "Staff profile retrieved successfully.", staff);
};

export const getStaffByRole = async (req, res) => {
  const staff = await getStaffByRoleService(req.params.role);

  return sendResponse(res, 200, "Staff retrieved successfully.", staff);
};

export const updateStaff = async (req, res) => {
  const staffId = validateId(req.params.staffId);

  const staff = await updateStaffService(staffId, req.body);

  return sendResponse(res, 200, "Staff updated successfully.", staff);
};

export const updateMyStaffProfile = async (req, res) => {
  const staff = await updateMyStaffProfileService(req.user.userId, req.body);

  return sendResponse(res, 200, "Staff profile updated successfully.", staff);
};

export const deleteStaff = async (req, res) => {
  const staffId = validateId(req.params.staffId);

  const result = await deleteStaffService(staffId);

  return sendResponse(res, 200, "Staff deleted successfully.", result);
};
