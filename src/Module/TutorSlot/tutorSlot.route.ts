// src/Module/Tutors/tutorSlot.route.ts
import { Router } from "express";
import { tutorSlotController } from "./tutorSlot.controller";
import { auth, UserRole } from "../../middleware/auth";


const router = Router();

// Add multiple slots for tutor
router.post("/tutor/profileSlot/:tutorId", tutorSlotController.addSlots);

// Update slot (time or booked status)
router.put("/tutor/profileSlot/:slotId", tutorSlotController.updateSlotController);

// Delete slot
router.delete("/tutor/profileSlot/:slotId", tutorSlotController.deleteSlotController);

// Get all slots for a tutor
router.get("/tutor/profileSlot/:tutorId",  tutorSlotController.getSlotsByTutor);

export const TutorSlot = router;
