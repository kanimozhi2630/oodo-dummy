import Department from '../models/Department.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ organization: req.user.organization._id })
      .populate('head', 'name email')
      .sort({ name: 1 });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (error) { next(error); }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, head, carbonBudget, color } = req.body;
    const dept = await Department.create({
      organization: req.user.organization._id,
      name, description, head, carbonBudget, color,
    });
    await dept.populate('head', 'name email');
    res.status(201).json({ success: true, department: dept });
  } catch (error) { next(error); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('head', 'name email');
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.status(200).json({ success: true, department: dept });
  } catch (error) { next(error); }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });
    res.status(200).json({ success: true, message: 'Department deleted.' });
  } catch (error) { next(error); }
};
