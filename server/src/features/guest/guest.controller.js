import {
  createGuestService,
  updateGuestService,
  getGuestService,
  getAllGuestsService,
} from "./guest.service.js";

import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

export const createGuest = async (req, res) => {
  const guest = await createGuestService(req.body);

  return sendResponse(res, 201, "Guest created successfully.", guest);
};

export const updateGuest = async (req, res) => {
  const guestId = validateId(req.params.guestId);

  const guest = await updateGuestService(
    {
      userId: req.user.userId,
      guestId,
    },
    req.body,
  );

  return sendResponse(res, 200, "Guest updated successfully.", guest);
};

export const getGuest = async (req, res) => {
  const guestId = validateId(req.params.guestId);

  const guest = await getGuestService({
    userId: req.user.userId,
    guestId,
  });

  return sendResponse(res, 200, "Guest retrieved successfully.", guest);
};

export const getAllGuests = async (req, res) => {
  const result = await getAllGuestsService(req.query);

  return sendResponse(res, 200, "Guests retrieved successfully.", result);
};
