import express from 'express';
import {
  getCsrActivities, createCsrActivity, updateCsrActivity, deleteCsrActivity,
  joinActivity, getUserParticipations, completeParticipation,
  getRewards, createReward,
} from '../controllers/socialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/activities').get(getCsrActivities).post(authorize('ceo', 'hr_manager'), createCsrActivity);
router.route('/activities/:id')
  .put(authorize('ceo', 'hr_manager'), updateCsrActivity)
  .delete(authorize('ceo', 'hr_manager'), deleteCsrActivity);

router.post('/activities/:id/join', joinActivity);
router.get('/participations', getUserParticipations);
router.get('/participations/:userId', authorize('ceo', 'hr_manager'), getUserParticipations);
router.put('/participations/:id/complete', authorize('ceo', 'hr_manager'), completeParticipation);

router.route('/rewards').get(getRewards).post(authorize('ceo', 'hr_manager'), createReward);
router.get('/rewards/:userId', authorize('ceo', 'hr_manager'), getRewards);

export default router;
