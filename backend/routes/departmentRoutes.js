import express from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getDepartments).post(authorize('ceo', 'hr_manager'), createDepartment);
router.route('/:id')
  .put(authorize('ceo', 'hr_manager'), updateDepartment)
  .delete(authorize('ceo'), deleteDepartment);

export default router;
