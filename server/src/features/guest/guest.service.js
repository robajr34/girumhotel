import guestRepo from "./guest.repository.js";
import AppError from "../../utils/AppError.js";
import userRepo from "../user/user.repository.js";
import logger from "../../utils/logger.js";

export const createGuestService = async (data) => {
  const guest = await guestRepo.findByPhone(data.phone);

  if (guest) {
    logger.warn("Guest creation failed: phone already exists", {
      userId: data.user,
      phone: data.phone,
    });

    throw new AppError("Guest with phone already exist.", 409, "GUEST_EXIST");
  }

  const newGuest = await guestRepo.create({
    ...data,
  });

  const user = await userRepo.updateById(newGuest.user, {
    requireSetup: false,
  });

  if (!user) {
    await guestRepo.deleteById(newGuest._id);
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  logger.info("Guest created successfully", {
    guestId: newGuest._id,
    userId: newGuest.user,
  });

  return newGuest;
};

export const updateGuestService = async ({ userId, guestId }, data) => {
  const guest = await guestRepo.findByIdAndUser({
    userId,
    guestId,
  });

  if (!guest) {
    logger.warn("Guest update failed: guest not found", {
      userId,
      guestId,
    });

    throw new AppError("Guest not found.", 404, "GUEST_NOT_FOUND");
  }

  const updatedGuest = await guestRepo.updateById(guestId, { ...data });

  logger.info("Guest updated successfully", {
    guestId,
    userId,
  });

  return updatedGuest;
};

export const getGuestService = async ({ guestId, userId }) => {
  const user = await userRepo.findById(userId);

  if (!user) {
    logger.warn("Guest retrieval failed: user not found", {
      userId,
      guestId,
    });

    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  let guest;

  if (user.role === "guest") {
    guest = await guestRepo.findByIdAndUser({
      userId,
      guestId,
    });
  } else {
    guest = await guestRepo.findById(guestId);
  }

  if (!guest) {
    logger.warn("Guest retrieval failed: guest not found", {
      userId,
      guestId,
      role: user.role,
    });

    throw new AppError("Guest not found.", 404, "GUEST_NOT_FOUND");
  }

  logger.info("Guest retrieved successfully", {
    guestId,
    userId,
    role: user.role,
  });

  return guest;
};

export const getAllGuestsService = async (query = {}) => {
  const {
    page = 1,
    limit = 15,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const result = await guestRepo.findAll(
    {
      page,
      limit,
      sortBy,
      sortOrder,
    },
    filter,
  );

  logger.info("Guests retrieved successfully", {
    page,
    limit,
    sortBy,
    sortOrder,
    search: search || null,
    total: result.meta.total,
  });

  return result;
};
