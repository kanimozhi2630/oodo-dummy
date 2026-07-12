import express from 'express';
import { getCeoDashboard, getEsgDashboard, getHrDashboard, getComplianceDashboard, getEmployeeDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/ceo', authorize('ceo'), getCeoDashboard);
router.get('/esg', authorize('ceo', 'esg_manager'), getEsgDashboard);
router.get('/hr', authorize('ceo', 'hr_manager'), getHrDashboard);
router.get('/compliance', authorize('ceo', 'compliance_officer'), getComplianceDashboard);
router.get('/employee', getEmployeeDashboard);

export default router;
