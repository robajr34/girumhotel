import { Router } from "express";

import {
  createRoom,
  deactivateRoom,
  getAvailableRooms,
  getRoomById,
  getRooms,
  deleteRoom,
  searchRooms,
  updateRoom,
  updateRoomStatus,
} from "./room.controller.js";

import validate from "../../middlewares/validator.js";

import {
  newRoomValidator,
  updateRoomStatusValidator,
  updateRoomValidator,
} from "./room.validator.js";

import { permit } from "../../middlewares/authorize.js";
import { authenticate } from "../../middlewares/authenticate.js";

const roomRouter = Router();

// Public routes

// Get all rooms
roomRouter.get("/", getRooms);

// Get available rooms
roomRouter.get("/status/available", getAvailableRooms);

// Search rooms
roomRouter.get("/search", searchRooms);

// Get a single room
roomRouter.get("/:roomId", getRoomById);

// Protected routes

// Create a new room
roomRouter.post(
  "/",
  authenticate,
  permit("owner"),
  validate(newRoomValidator),
  createRoom,
);

// Update room details
roomRouter.patch(
  "/:roomId",
  authenticate,
  permit("owner", "manager"),
  validate(updateRoomValidator),
  updateRoom,
);

// Update room status
roomRouter.patch(
  "/:roomId/status",
  authenticate,
  permit("owner", "manager", "receptionist"),
  validate(updateRoomStatusValidator),
  updateRoomStatus,
);

// Deactivate room
roomRouter.patch(
  "/:roomId/deactivate",
  authenticate,
  permit("owner", "manager"),
  deactivateRoom,
);

// Delete room
roomRouter.delete("/:roomId", authenticate, permit("owner"), deleteRoom);

export default roomRouter;
