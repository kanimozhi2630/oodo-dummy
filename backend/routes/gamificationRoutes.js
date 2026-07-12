import express from 'express';
import {
  getChallenges, createChallenge, joinChallenge, completeChallenge,
  getBadges, createBadge,
  getLeaderboard, getMyStats,
} from '../controllers/gamificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/challenges').get(getChallenges).post(authorize('ceo', 'hr_manager', 'esg_manager'), createChallenge);
router.post('/challenges/:id/join', joinChallenge);
router.post('/challenges/:id/complete', completeChallenge);

router.route('/badges').get(getBadges).post(authorize('ceo', 'hr_manager'), createBadge);

router.get('/leaderboard', getLeaderboard);
router.get('/my-stats', getMyStats);

export default router;
