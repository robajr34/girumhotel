import sendCookie from "../../utils/cookieHandler.js";
import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

import {
  completeSetupService,
  getMeService,
  guestLoginService,
  guestSignupService,
  refreshTokenService,
  setupOwnerService,
  setupStaffService,
  verifyOwnerEmailService,
  verifyStaffEmailService,
} from "../auth/auth.service.js";

export const guestLogin = async (req, res) => {
  const { user, accessToken, refreshToken } = await guestLoginService(req.body);

  sendCookie(res, refreshToken);

  return sendResponse(res, 200, "Logged in successfully.", {
    user,
    accessToken,
  });
};

export const guestSignup = async (req, res) => {
  const { user, accessToken, refreshToken } = await guestSignupService(
    req.body,
  );

  sendCookie(res, refreshToken);

  return sendResponse(res, 201, "Account created successfully.", {
    user,
    accessToken,
  });
};

export const refreshToken = async (req, res) => {
  const { accessToken, refreshToken } = await refreshTokenService(
    req.cookies.token,
  );

  sendCookie(res, refreshToken);

  return sendResponse(res, 200, null, {
    accessToken,
  });
};

export const getMe = async (req, res) => {
  const id = validateId(req.params.userId);

  const myData = await getMeService(id);

  return sendResponse(res, 200, null, myData);
};

export const setupOwner = async (req, res) => {
  const result = await setupOwnerService(req.body);

  return sendResponse(
    res,
    201,
    "Owner account created. Please check your email to verify your account.",
    result,
  );
};

export const verifyOwnerEmail = async (req, res) => {
  const { user, accessToken, refreshToken } = await verifyOwnerEmailService(
    req.body.token,
  );

  sendCookie(res, refreshToken);

  return sendResponse(res, 200, "Email verified successfully.", {
    user,
    accessToken,
  });
};

export const completeSetup = async (req, res) => {
  console.log(req.body);
  const result = await completeSetupService(req.body, req.user.userId);

  return sendResponse(res, 200, "Setup completed.", result);
};

export const setupStaff = async (req, res) => {
  const result = await setupStaffService(req.body, req.user.userId);

  return sendResponse(
    res,
    201,
    "Staff account created. Please check your email to verify your account.",
    result,
  );
};

export const verifyStaffEmail = async (req, res) => {
  const { user, accessToken, refreshToken } = await verifyStaffEmailService(req.body,
    req.body.token,
  );

  sendCookie(res, refreshToken);

  return sendResponse(res, 200, "Email verified successfully.", {
    user,
    accessToken,
  });
};

export const logout = async (req, res) => {
  res.clearCookie("refreshToken");
  return sendResponse(res, 200, "Logged out successfully.", null);
};