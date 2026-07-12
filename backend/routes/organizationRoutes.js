import express from 'express';
import {
  getOrganizations, createOrganization, updateOrganization, deleteOrganization
} from '../controllers/organizationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.route('/')
  .get(getOrganizations)
  .post(createOrganization);

router.route('/:id')
  .put(updateOrganization)
  .delete(deleteOrganization);

export default router;
