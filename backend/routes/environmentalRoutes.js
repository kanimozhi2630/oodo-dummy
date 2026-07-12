import express from 'express';
import {
  getEmissionFactors, createEmissionFactor, updateEmissionFactor, deleteEmissionFactor,
  getCarbonTransactions, createCarbonTransaction,
  getGoals, createGoal, updateGoal, deleteGoal,
  getEmissionsAnalytics,
} from '../controllers/environmentalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Emission factors
router.route('/emission-factors')
  .get(getEmissionFactors)
  .post(authorize('ceo', 'esg_manager'), createEmissionFactor);
router.route('/emission-factors/:id')
  .put(authorize('ceo', 'esg_manager'), updateEmissionFactor)
  .delete(authorize('ceo', 'esg_manager'), deleteEmissionFactor);

// Carbon transactions
router.route('/transactions').get(getCarbonTransactions).post(authorize('ceo', 'esg_manager'), createCarbonTransaction);

// Goals
router.route('/goals').get(getGoals).post(authorize('ceo', 'esg_manager'), createGoal);
router.route('/goals/:id').put(authorize('ceo', 'esg_manager'), updateGoal).delete(authorize('ceo', 'esg_manager'), deleteGoal);

// Analytics
router.get('/analytics', authorize('ceo', 'esg_manager'), getEmissionsAnalytics);

export default router;
