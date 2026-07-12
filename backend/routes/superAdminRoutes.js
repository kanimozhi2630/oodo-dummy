import express from 'express';
import { getSuperAdminDashboard } from '../controllers/superAdminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.get('/dashboard', getSuperAdminDashboard);

export default router;
