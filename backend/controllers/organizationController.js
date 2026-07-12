import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Leaderboard from '../models/Leaderboard.js';

// @desc  Get all organizations
// @route GET /api/organizations
// @access Private (Super Admin)
export const getOrganizations = async (req, res, next) => {
  try {
    const { search, isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const organizations = await Organization.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: organizations.length, organizations });
  } catch (error) {
    next(error);
  }
};

// @desc  Create an organization + create its CEO
// @route POST /api/organizations
// @access Private (Super Admin)
export const createOrganization = async (req, res, next) => {
  try {
    const {
      name, email, phone, industry, country, companySize, numberOfEmployees,
      adminName, adminEmail, password
    } = req.body;

    const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: 'Company email already exists.' });
    }

    const organization = await Organization.create({
      name,
      email,
      phone,
      industry,
      country,
      companySize,
      numberOfEmployees,
      isActive: true
    });

    let ceo = null;
    if (adminName && adminEmail && password) {
      ceo = await User.create({
        organization: organization._id,
        name: adminName,
        email: adminEmail,
        password,
        role: 'ceo',
      });
      await Leaderboard.create({ organization: organization._id, user: ceo._id });
    }

    res.status(201).json({ success: true, organization, ceo });
  } catch (error) {
    next(error);
  }
};

// @desc  Update organization (subscription/plan/status)
// @route PUT /api/organizations/:id
// @access Private (Super Admin)
export const updateOrganization = async (req, res, next) => {
  try {
    const { name, phone, industry, country, companySize, numberOfEmployees, isActive, subscriptionPlan } = req.body;

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const updated = await Organization.findByIdAndUpdate(
      req.params.id,
      {
        name, phone, industry, country, companySize, numberOfEmployees,
        isActive, subscriptionPlan,
        'subscription.plan': subscriptionPlan
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, organization: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete an organization
// @route DELETE /api/organizations/:id
// @access Private (Super Admin)
export const deleteOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // Clean up all data associated with this organization
    await User.deleteMany({ organization: org._id });
    await Leaderboard.deleteMany({ organization: org._id });
    await Organization.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Organization deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
