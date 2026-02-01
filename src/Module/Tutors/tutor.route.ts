import express from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { TutorController } from './tutor.controller';


const router = express.Router();

// router.post('/', auth(UserRole.STUDENT, UserRole.ADMIN), TutorController.createtutor);

router.get('/tutor/profile', TutorController.getAlltetutor);

router.get("/my/profile", auth(UserRole.TUTOR), TutorController.getMytetutorProfile);

router.get('/categories', TutorController.getCategories)

router.get("/tutor/profile/:tutorId", TutorController.getTutorProfile)

router.post('/categories', auth(UserRole.ADMIN), TutorController.PostCategory);

router.post('/tutor/profile', auth(UserRole.TUTOR), TutorController.createtutor);

router.put('/tutor/profile', auth(UserRole.TUTOR), TutorController.updateTutorController);

export const tutorRouter = router;