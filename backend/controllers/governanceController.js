import Policy from '../models/Policy.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';

// === POLICIES ===
export const getPolicies = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = { organization: req.user.organization._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    const policies = await Policy.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, policies });
  } catch (error) { next(error); }
};

export const createPolicy = async (req, res, next) => {
  try {
    const policy = await Policy.create({ ...req.body, organization: req.user.organization._id, createdBy: req.user._id });
    res.status(201).json({ success: true, policy });
  } catch (error) { next(error); }
};

export const updatePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found.' });
    res.status(200).json({ success: true, policy });
  } catch (error) { next(error); }
};

export const deletePolicy = async (req, res, next) => {
  try {
    await Policy.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    res.status(200).json({ success: true, message: 'Policy deleted.' });
  } catch (error) { next(error); }
};

// === AUDITS ===
export const getAudits = async (req, res, next) => {
  try {
    const audits = await Audit.find({ organization: req.user.organization._id })
      .populate('conductedBy', 'name')
      .sort({ startDate: -1 });
    res.status(200).json({ success: true, audits });
  } catch (error) { next(error); }
};

export const createAudit = async (req, res, next) => {
  try {
    const audit = await Audit.create({ ...req.body, organization: req.user.organization._id, conductedBy: req.user._id });
    res.status(201).json({ success: true, audit });
  } catch (error) { next(error); }
};

export const updateAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!audit) return res.status(404).json({ success: false, message: 'Audit not found.' });
    res.status(200).json({ success: true, audit });
  } catch (error) { next(error); }
};

// === COMPLIANCE ISSUES ===
export const getComplianceIssues = async (req, res, next) => {
  try {
    const { status, severity, category } = req.query;
    const filter = { organization: req.user.organization._id };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    const issues = await ComplianceIssue.find(filter)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, issues });
  } catch (error) { next(error); }
};

export const createComplianceIssue = async (req, res, next) => {
  try {
    const issue = await ComplianceIssue.create({
      ...req.body,
      organization: req.user.organization._id,
      reportedBy: req.user._id,
    });
    res.status(201).json({ success: true, issue });
  } catch (error) { next(error); }
};

export const updateComplianceIssue = async (req, res, next) => {
  try {
    if (req.body.status === 'resolved') req.body.resolvedAt = new Date();
    const issue = await ComplianceIssue.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found.' });
    res.status(200).json({ success: true, issue });
  } catch (error) { next(error); }
};
