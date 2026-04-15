// src/Module/Tutors/tutorSlot.route.ts
import { Router } from "express";
import { tutorSlotController } from "./tutorSlot.controller";
import { auth, UserRole } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { TutorSlotValidation } from "./tutorSlot.validation";

const router = Router();

// Add multiple slots for tutor
router.post(
    "/tutor/profileSlot/:tutorId", 
    auth(UserRole.TUTOR, UserRole.ADMIN), 
    validateRequest(TutorSlotValidation.createSlotsSchema), 
    tutorSlotController.addSlots
);

// Update slot (time or booked status)
router.put(
    "/tutor/profileSlot/:slotId", 
    auth(UserRole.TUTOR, UserRole.ADMIN), 
    validateRequest(TutorSlotValidation.updateSlotSchema), 
    tutorSlotController.updateSlotController
);

// Delete slot
router.delete(
    "/tutor/profileSlot/:slotId", 
    auth(UserRole.TUTOR, UserRole.ADMIN), 
    tutorSlotController.deleteSlotController
);

// Get all slots for a tutor
router.get(
    "/tutor/profileSlot/:tutorId",  
    tutorSlotController.getSlotsByTutor
);

// Admin: get all tutor slots
router.get(
    "/tutor/profileSlot",
    auth(UserRole.ADMIN),
    tutorSlotController.getAllSlotsAdmin
);

export const TutorSlot = router;
