import express from 'express';
import { getUsers, createUser, updateUser, resetUserPassword, toggleUserStatus } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getUsers).post(authorize('ceo', 'hr_manager'), createUser);
router.route('/:id').put(authorize('ceo', 'hr_manager'), updateUser);
router.put('/:id/reset-password', authorize('ceo', 'hr_manager'), resetUserPassword);
router.put('/:id/toggle-status', authorize('ceo', 'hr_manager'), toggleUserStatus);

export default router;
