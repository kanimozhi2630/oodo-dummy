import express from 'express';
import {
  getPolicies, createPolicy, updatePolicy, deletePolicy,
  getAudits, createAudit, updateAudit,
  getComplianceIssues, createComplianceIssue, updateComplianceIssue,
} from '../controllers/governanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/policies').get(getPolicies).post(authorize('ceo', 'compliance_officer'), createPolicy);
router.route('/policies/:id')
  .put(authorize('ceo', 'compliance_officer'), updatePolicy)
  .delete(authorize('ceo', 'compliance_officer'), deletePolicy);

router.route('/audits').get(getAudits).post(authorize('ceo', 'compliance_officer'), createAudit);
router.route('/audits/:id').put(authorize('ceo', 'compliance_officer'), updateAudit);

router.route('/issues').get(getComplianceIssues).post(createComplianceIssue);
router.route('/issues/:id').put(authorize('ceo', 'compliance_officer'), updateComplianceIssue);

export default router;
