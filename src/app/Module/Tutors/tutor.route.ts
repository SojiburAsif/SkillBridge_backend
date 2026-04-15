import express from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { TutorController } from './tutor.controller';
import validateRequest from '../../middleware/validateRequest';
import { TutorValidation } from './tutor.validation';

const router = express.Router();

// Upserts (creates or updates) the tutor profile for the logged in user
router.put(
    '/tutor/my-profile', 
    auth(UserRole.TUTOR, UserRole.ADMIN), 
    validateRequest(TutorValidation.updateTutorProfileSchema), 
    TutorController.updateTutorController
);

router.get('/tutor/my-profile', auth(UserRole.TUTOR), TutorController.getMytetutorProfile);

router.get('/tutor/profile', TutorController.getAlltetutor);

router.get("/tutor/profile/:tutorId", TutorController.getTutorProfile);

export const tutorRouter = router;