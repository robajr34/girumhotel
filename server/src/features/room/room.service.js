import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import roomRepo from "./room.repository.js";

export const getRoomsService = async (query) => {
  const rooms = await roomRepo.findAll(query, null);

  logger.info("Rooms retrieved successfully", {
    count: rooms?.rooms?.length ?? rooms?.length ?? 0,
  });

  return rooms;
};

export const getRoomByIdService = async (roomId) => {
  const room = await roomRepo.findById(roomId);

  if (!room) {
    logger.warn("Room retrieval failed: room not found", {
      roomId,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  logger.info("Room retrieved successfully", {
    roomId,
  });

  return room;
};

export const getAvailableRoomsService = async () => {
  const availableRooms = await roomRepo.findAll(null, {
    status: "available",
  });

  logger.info("Available rooms retrieved successfully", {
    count: availableRooms?.rooms?.length ?? availableRooms?.length ?? 0,
  });

  return availableRooms;
};

export const searchRoomsService = async (query = {}) => {
  const rooms = await roomRepo.search(query);

  logger.info("Room search completed", {
    query,
    count: rooms?.rooms?.length ?? rooms?.length ?? 0,
  });

  return rooms;
};

export const createRoomService = async (data) => {
  const roomExist = await roomRepo.findOne({
    roomNumber: data.roomNumber,
  });

  if (roomExist) {
    logger.warn("Room creation failed: room number already exists", {
      roomNumber: data.roomNumber,
    });

    throw new AppError("Room number already exists.", 409, "ROOM_EXIST");
  }

  // TODO: Get image URLs from Cloudinary.

  const newRoom = await roomRepo.create(data);

  logger.info("Room created successfully", {
    roomId: newRoom._id,
    roomNumber: newRoom.roomNumber,
  });

  return newRoom;
};

export const updateRoomService = async (roomId, data) => {
  const updatedRoom = await roomRepo.updateById(roomId, data);

  if (!updatedRoom) {
    logger.warn("Room update failed: room not found", {
      roomId,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  logger.info("Room updated successfully", {
    roomId,
  });

  return updatedRoom;
};

export const updateRoomStatusService = async (roomId, status) => {
  const updatedRoom = await roomRepo.updateById(roomId, {
    status,
  });

  if (!updatedRoom) {
    logger.warn("Room status update failed: room not found", {
      roomId,
      status,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  logger.info("Room status updated successfully", {
    roomId,
    status,
  });

  return updatedRoom;
};

export const deactivateRoomService = async (roomId) => {
  const deactivatedRoom = await roomRepo.updateById(roomId, {
    status: "inactive",
  });

  if (!deactivatedRoom) {
    logger.warn("Room deactivation failed: room not found", {
      roomId,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  logger.info("Room deactivated successfully", {
    roomId,
  });

  return deactivatedRoom;
};

export const deleteRoomService = async (roomId) => {
  const room = await roomRepo.deleteById(roomId);

  if (!room) {
    logger.warn("Room deletion failed: room not found", {
      roomId,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  logger.info("Room deleted successfully", {
    roomId,
    roomNumber: room.roomNumber,
  });

  return room;
};
