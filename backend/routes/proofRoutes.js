import express from 'express';
import {
  submitProof, getPendingProofs, getMyProofs, reviewProof
} from '../controllers/proofController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('employee'), submitProof);
router.get('/my', authorize('employee'), getMyProofs);

router.get('/pending', authorize('ceo', 'hr_manager'), getPendingProofs);
router.put('/:id/review', authorize('ceo', 'hr_manager'), reviewProof);

export default router;
