import express from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { TutorController } from './tutor.controller';


const router = express.Router();

// router.post('/', auth(UserRole.STUDENT, UserRole.ADMIN), TutorController.createtutor);

router.get('/profile', TutorController.getAlltetutor);

router.post('/profile', auth(UserRole.TUTOR), TutorController.createtutor);

router.put('/profile', auth(UserRole.TUTOR), TutorController.updateTutorController);

export const tutorRouter = router;