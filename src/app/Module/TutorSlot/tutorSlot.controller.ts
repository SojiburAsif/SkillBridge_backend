// src/Module/Tutors/tutorSlot.controller.ts
import { Request, Response } from "express";
import { tutorSlotServices } from "./tutorSlot.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

type AuthRequest = Request & { user?: { id: string } };

/* POST /api/tutor-slots/:tutorId */
const addSlots = catchAsync(async (req: AuthRequest, res: Response) => {
  const tutorIdRaw = req.params.tutorId;
  
  if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid tutorId" });
  }

  const tutorId: string = tutorIdRaw;
  const slots = req.body.slots;
  
  const result = await tutorSlotServices.createSlots(tutorId, slots);
  
  sendResponse(res, {
    httpStatusCode: StatusCodes.CREATED,
    success: true,
    message: "Slots created successfully",
    data: result
  });
});

/* PUT /api/tutor-slots/:slotId */
const updateSlotController = catchAsync(async (req: AuthRequest, res: Response) => {
  const slotIdRaw = req.params.slotId;
  
  if (!slotIdRaw || Array.isArray(slotIdRaw)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid slotId" });
  }
  
  const slotId: string = slotIdRaw;
  const data = req.body; 

  const updated = await tutorSlotServices.updateSlot(slotId, data);
  
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Slot updated successfully",
    data: updated
  });
});

/* DELETE /api/tutor-slots/:slotId */
const deleteSlotController = catchAsync(async (req: AuthRequest, res: Response) => {
  const slotIdRaw = req.params.slotId;
  
  if (!slotIdRaw || Array.isArray(slotIdRaw)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid slotId" });
  }
  
  const slotId: string = slotIdRaw;
  const deleted = await tutorSlotServices.deleteSlot(slotId);
  
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Slot deleted successfully",
    data: deleted
  });
});

/* GET /api/tutor-slots/:tutorId */
const getSlotsByTutor = catchAsync(async (req: Request, res: Response) => {
  const tutorIdRaw = req.params.tutorId;
  
  if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid tutorId" });
  }
  
  const tutorId: string = tutorIdRaw;
  const slots = await tutorSlotServices.getSlotsByTutor(tutorId);
  
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Slots retrieved successfully",
    data: slots
  });
});

const getAllSlotsAdmin = catchAsync(async (_req: Request, res: Response) => {
  const slots = await tutorSlotServices.getAllSlotsAdmin();
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "All slots retrieved successfully",
    data: slots
  });
});

export const tutorSlotController = {
  addSlots,
  updateSlotController,
  deleteSlotController,
  getSlotsByTutor,
  getAllSlotsAdmin
};
