import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

import {
  createRoomService,
  deactivateRoomService,
  getAvailableRoomsService,
  getRoomByIdService,
  getRoomsService,
  searchRoomsService,
  updateRoomService,
  updateRoomStatusService,
  deleteRoomService,
} from "./room.service.js";

export const getRooms = async (req, res) => {
  const roomsData = await getRoomsService(req.query);

  return sendResponse(res, 200, null, roomsData);
};

export const getRoomById = async (req, res) => {
  const roomId = validateId(req.params.roomId);

  const roomData = await getRoomByIdService(roomId);

  return sendResponse(res, 200, null, roomData);
};

export const getAvailableRooms = async (req, res) => {
  const roomsData = await getAvailableRoomsService();

  return sendResponse(res, 200, null, roomsData);
};

export const searchRooms = async (req, res) => {
  const roomsData = await searchRoomsService(req.query?.q);

  return sendResponse(res, 200, null, roomsData);
};

export const createRoom = async (req, res) => {
  const newRoomData = await createRoomService(req.body);

  return sendResponse(res, 201, "Room created.", newRoomData);
};

export const updateRoom = async (req, res) => {
  const roomId = validateId(req.params.roomId);

  const updatedRoomData = await updateRoomService(roomId, req.body);

  return sendResponse(res, 200, "Room updated.", updatedRoomData);
};

export const updateRoomStatus = async (req, res) => {
  const roomId = validateId(req.params.roomId);

  const updatedRoomData = await updateRoomStatusService(
    roomId,
    req.body.status,
  );

  return sendResponse(res, 200, "Room status updated.", updatedRoomData);
};

export const deactivateRoom = async (req, res) => {
  const roomId = validateId(req.params.roomId);

  const roomData = await deactivateRoomService(roomId);

  return sendResponse(res, 200, "Room deactivated.", roomData);
};

export const deleteRoom = async (req, res) => {
  const roomId = validateId(req.params.roomId);

  await deleteRoomService(roomId);

  return sendResponse(res, 200, "Room deleted.");
};
