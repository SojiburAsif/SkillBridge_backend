// src/Module/Tutors/tutorSlot.controller.ts
import { Request, Response } from "express";
import { tutorSlotServices } from "./tutorSlot.service";

type AuthRequest = Request & { user?: { id: string } };

/* POST /api/tutor-slots/:tutorId */
const addSlots = async (req: AuthRequest, res: Response) => {
  try {
    const tutorIdRaw = req.params.tutorId;
    // fix TS string | undefined error
    if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid tutorId" });
    }
    const tutorId: string = tutorIdRaw;

    const slots = req.body.slots;
    if (!Array.isArray(slots)) return res.status(400).json({ success: false, error: "slots must be array" });

    const result = await tutorSlotServices.createSlots(tutorId, slots);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/* PUT /api/tutor-slots/:slotId */
const updateSlotController = async (req: AuthRequest, res: Response) => {
  try {
    const slotIdRaw = req.params.slotId;
    if (!slotIdRaw || Array.isArray(slotIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid slotId" });
    }
    const slotId: string = slotIdRaw;

    const data = req.body; // { startTime?, endTime?, isBooked? }
    const updated = await tutorSlotServices.updateSlot(slotId, data);
    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/* DELETE /api/tutor-slots/:slotId */
const deleteSlotController = async (req: AuthRequest, res: Response) => {
  try {
    const slotIdRaw = req.params.slotId;
    if (!slotIdRaw || Array.isArray(slotIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid slotId" });
    }
    const slotId: string = slotIdRaw;

    const deleted = await tutorSlotServices.deleteSlot(slotId);
    res.status(200).json({ success: true, data: deleted });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

/* GET /api/tutor-slots/:tutorId */
const getSlotsByTutor = async (req: Request, res: Response) => {
  try {
    const tutorIdRaw = req.params.tutorId;
    if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid tutorId" });
    }
    const tutorId: string = tutorIdRaw;

    const slots = await tutorSlotServices.getSlotsByTutor(tutorId);
    res.status(200).json({ success: true, data: slots });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

export const tutorSlotController = {
  addSlots,
  updateSlotController,
  deleteSlotController,
  getSlotsByTutor
};
