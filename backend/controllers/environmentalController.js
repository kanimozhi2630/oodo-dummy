import EmissionFactor from '../models/EmissionFactor.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import Goal from '../models/Goal.js';

// === EMISSION FACTORS ===
export const getEmissionFactors = async (req, res, next) => {
  try {
    const factors = await EmissionFactor.find({ organization: req.user.organization._id, isActive: true });
    res.status(200).json({ success: true, factors });
  } catch (error) { next(error); }
};

export const createEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, factor });
  } catch (error) { next(error); }
};

export const updateEmissionFactor = async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!factor) return res.status(404).json({ success: false, message: 'Emission factor not found.' });
    res.status(200).json({ success: true, factor });
  } catch (error) { next(error); }
};

export const deleteEmissionFactor = async (req, res, next) => {
  try {
    await EmissionFactor.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    res.status(200).json({ success: true, message: 'Emission factor deleted.' });
  } catch (error) { next(error); }
};

// === CARBON TRANSACTIONS ===
export const getCarbonTransactions = async (req, res, next) => {
  try {
    const { scope, department, status, startDate, endDate } = req.query;
    const filter = { organization: req.user.organization._id };
    if (scope) filter.scope = scope;
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const transactions = await CarbonTransaction.find(filter)
      .populate('department', 'name')
      .populate('recordedBy', 'name')
      .populate('emissionFactor', 'name category')
      .sort({ date: -1 });

    const totalCO2 = transactions.reduce((sum, t) => sum + t.co2Equivalent, 0);
    res.status(200).json({ success: true, count: transactions.length, totalCO2, transactions });
  } catch (error) { next(error); }
};

export const createCarbonTransaction = async (req, res, next) => {
  try {
    const { emissionFactor: factorId, quantity } = req.body;
    const factor = await EmissionFactor.findById(factorId);
    if (!factor) return res.status(404).json({ success: false, message: 'Emission factor not found.' });

    const co2Equivalent = quantity * factor.factorValue;

    const transaction = await CarbonTransaction.create({
      ...req.body,
      organization: req.user.organization._id,
      recordedBy: req.user._id,
      co2Equivalent,
      scope: factor.category,
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) { next(error); }
};

// === GOALS ===
export const getGoals = async (req, res, next) => {
  try {
    const { category, status, department } = req.query;
    const filter = { organization: req.user.organization._id };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;

    const goals = await Goal.find(filter)
      .populate('department', 'name')
      .populate('createdBy', 'name')
      .sort({ targetDate: 1 });
    res.status(200).json({ success: true, goals });
  } catch (error) { next(error); }
};

export const createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, organization: req.user.organization._id, createdBy: req.user._id });
    res.status(201).json({ success: true, goal });
  } catch (error) { next(error); }
};

export const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
    res.status(200).json({ success: true, goal });
  } catch (error) { next(error); }
};

export const deleteGoal = async (req, res, next) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    res.status(200).json({ success: true, message: 'Goal deleted.' });
  } catch (error) { next(error); }
};

// === ANALYTICS ===
export const getEmissionsAnalytics = async (req, res, next) => {
  try {
    const orgId = req.user.organization._id;

    const byScope = await CarbonTransaction.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: '$scope', total: { $sum: '$co2Equivalent' } } },
    ]);

    const byMonth = await CarbonTransaction.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$co2Equivalent' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const byDept = await CarbonTransaction.aggregate([
      { $match: { organization: orgId } },
      { $group: { _id: '$department', total: { $sum: '$co2Equivalent' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: '$dept' },
      { $project: { name: '$dept.name', total: 1 } },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({ success: true, byScope, byMonth, byDept });
  } catch (error) { next(error); }
};
