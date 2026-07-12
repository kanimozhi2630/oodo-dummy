import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve path for .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import all models
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import EmissionFactor from '../models/EmissionFactor.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import Goal from '../models/Goal.js';
import CsrActivity from '../models/CsrActivity.js';
import Participation from '../models/Participation.js';
import Policy from '../models/Policy.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import Challenge from '../models/Challenge.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import Leaderboard from '../models/Leaderboard.js';
import Notification from '../models/Notification.js';

// Random data generators
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const INDIAN_NAMES = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kavya', 'Ishaan', 'Aryan', 'Riya', 'Aarohi', 'Aaditya', 'Karthik', 'Priya', 'Neha', 'Rohit', 'Siddharth', 'Aditi', 'Nisha', 'Rahul', 'Amit', 'Sneha', 'Pooja', 'Sunil', 'Kiran', 'Sanjay', 'Geeta', 'Anil', 'Meena', 'Rakesh', 'Rekha', 'Ashok', 'Sushma', 'Manoj', 'Aarti', 'Ramesh', 'Poonam', 'Vijay', 'Jyoti', 'Tarun', 'Swati', 'Vishal', 'Neelam', 'Rajeev', 'Shweta', 'Nitin', 'Divya', 'Gaurav', 'Shikha', 'Alok'];
const INDIAN_SURNAMES = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Kaur', 'Singh', 'Patel', 'Reddy', 'Rao', 'Das', 'Kumar', 'Joshi', 'Chauhan', 'Thakur', 'Yadav', 'Mishra', 'Pandey', 'Nair', 'Menon'];

const generateName = () => `${randomChoice(INDIAN_NAMES)} ${randomChoice(INDIAN_SURNAMES)}`;

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing existing data...');
    const models = [Organization, User, Department, EmissionFactor, CarbonTransaction, Goal, CsrActivity, Participation, Policy, Audit, ComplianceIssue, Challenge, Badge, Reward, Leaderboard, Notification];
    for (let model of models) {
      await model.deleteMany({});
    }

    console.log('Creating Organization...');
    const org = await Organization.create({
      name: 'GreenTech Industries Pvt Ltd',
      email: 'contact@greentech.com',
      phone: '+91 9876543210',
      industry: 'Manufacturing',
      country: 'India',
      companySize: '201-500',
      numberOfEmployees: 500,
      esgScore: 0,
      subscriptionPlan: 'enterprise'
    });

    console.log('Creating Departments...');
    const deptNames = ['Manufacturing', 'Production', 'HR', 'Finance', 'Sales', 'Marketing', 'IT', 'Administration', 'Logistics', 'Quality Control'];
    const departments = [];
    for (let name of deptNames) {
      const dept = await Department.create({
        name,
        organization: org._id,
        description: `${name} Department`,
        esgScore: randomInt(50, 95),
        carbonBudget: randomInt(1000, 5000),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      departments.push(dept);
    }

    console.log('Creating Users...');
    const RAW_PASSWORD = 'admin123'; // pre-save hook will bcrypt this once
    const users = [];

    // Super Admin User
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@ecosphere.com',
      password: RAW_PASSWORD,
      role: 'super_admin',
      isActive: true
    });

    // Core Users
    const coreUsersData = [
      { name: 'Rajesh Kumar',  email: 'ceo@greentech.com',        role: 'ceo',                department: randomChoice(departments)._id },
      { name: 'Priya Sharma',  email: 'esg@greentech.com',        role: 'esg_manager',        department: randomChoice(departments)._id },
      { name: 'Deepika Rao',   email: 'hr@greentech.com',         role: 'hr_manager',         department: randomChoice(departments)._id },
      { name: 'Arun Prakash',  email: 'compliance@greentech.com', role: 'compliance_officer', department: randomChoice(departments)._id },
      { name: 'John Doe',      email: 'employee1@greentech.com',  role: 'employee',           department: randomChoice(departments)._id },
    ];

    for (let u of coreUsersData) {
      const user = await User.create({
        ...u,
        organization: org._id,
        password: RAW_PASSWORD,
        isActive: true
      });
      users.push(user);
    }

    // 99 Employees (since employee1 is already added)
    for (let i = 0; i < 99; i++) {
      const name = generateName();
      const email = `${name.split(' ').join('.').toLowerCase()}${i}@greentech.com`;
      const dept = randomChoice(departments);
      const user = await User.create({
        name,
        email,
        password: RAW_PASSWORD,
        role: 'employee',
        organization: org._id,
        department: dept._id,
        phone: `+91 9${randomInt(100000000, 999999999)}`,
        isActive: true
      });
      users.push(user);
    }

    // Assign random heads to departments
    for (let dept of departments) {
      dept.head = randomChoice(users)._id;
      await dept.save();
    }

    console.log('Creating Emission Factors...');
    const factorsData = [
      { name: 'Diesel', category: 'Scope 1', subCategory: 'Fuel', factorValue: 2.68, unit: 'liters', source: 'DEFRA', year: 2024 },
      { name: 'Petrol', category: 'Scope 1', subCategory: 'Fuel', factorValue: 2.31, unit: 'liters', source: 'DEFRA', year: 2024 },
      { name: 'Electricity', category: 'Scope 2', subCategory: 'Grid', factorValue: 0.85, unit: 'kWh', source: 'CEA India', year: 2024 },
      { name: 'Natural Gas', category: 'Scope 1', subCategory: 'Fuel', factorValue: 2.02, unit: 'm3', source: 'DEFRA', year: 2024 },
      { name: 'Paper', category: 'Scope 3', subCategory: 'Material', factorValue: 0.95, unit: 'kg', source: 'EPA', year: 2024 },
      { name: 'Plastic', category: 'Scope 3', subCategory: 'Material', factorValue: 3.1, unit: 'kg', source: 'EPA', year: 2024 },
      { name: 'Steel', category: 'Scope 3', subCategory: 'Material', factorValue: 1.8, unit: 'kg', source: 'EPA', year: 2024 },
      { name: 'Water', category: 'Scope 3', subCategory: 'Utilities', factorValue: 0.34, unit: 'm3', source: 'DEFRA', year: 2024 },
      { name: 'Air Travel', category: 'Scope 3', subCategory: 'Transport', factorValue: 0.15, unit: 'km', source: 'DEFRA', year: 2024 }
    ];
    const factors = [];
    for (let f of factorsData) {
      factors.push(await EmissionFactor.create({ ...f, organization: org._id }));
    }

    console.log('Creating Carbon Transactions...');
    const transactions = [];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    for (let i = 0; i < 300; i++) {
      const factor = randomChoice(factors);
      const quantity = randomInt(50, 5000);
      transactions.push({
        organization: org._id,
        department: randomChoice(departments)._id,
        description: `Usage of ${factor.name} - Batch ${i}`,
        emissionFactor: factor._id,
        scope: factor.category,
        quantity,
        unit: factor.unit,
        co2Equivalent: quantity * factor.factorValue,
        date: randomDate(oneYearAgo, new Date()),
        recordedBy: randomChoice(users)._id,
        status: randomChoice(['pending', 'approved', 'approved', 'approved', 'rejected'])
      });
    }
    await CarbonTransaction.insertMany(transactions);

    console.log('Creating Environmental Goals...');
    const goalsData = [
      { title: 'Reduce Carbon by 20%', category: 'Environmental', targetValue: 20, unit: '% reduction' },
      { title: 'Reduce Electricity Consumption', category: 'Environmental', targetValue: 10000, unit: 'kWh' },
      { title: 'Plant 500 Trees', category: 'Social', targetValue: 500, unit: 'trees' },
      { title: 'Reduce Fuel Usage', category: 'Environmental', targetValue: 5000, unit: 'liters' },
      { title: 'Increase Recycling Rate', category: 'Environmental', targetValue: 50, unit: '%' }
    ];
    
    for (let g of goalsData) {
      await Goal.create({
        ...g,
        organization: org._id,
        description: `Strategic goal to ${g.title.toLowerCase()}`,
        currentValue: randomInt(0, g.targetValue),
        baselineValue: 0,
        startDate: oneYearAgo,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        createdBy: randomChoice(users)._id,
        status: randomChoice(['active', 'completed', 'overdue', 'cancelled'])
      });
    }

    console.log('Creating CSR Activities...');
    const csrActivities = [];
    const csrTitles = ['Tree Plantation', 'Blood Donation', 'Beach Cleanup', 'Road Safety Awareness', 'Food Donation', 'Women Empowerment', 'School Visit', 'Health Camp', 'Park Cleanup', 'Digital Literacy Drive', 'Animal Shelter Volunteer', 'Clothing Drive', 'Elderly Care Visit', 'Disaster Relief Fundraiser', 'Skill Development Workshop'];
    
    for (let title of csrTitles) {
      const activity = await CsrActivity.create({
        title,
        organization: org._id,
        description: `Community engagement: ${title}`,
        category: randomChoice(['Environment', 'Health', 'Education', 'Community', 'Volunteering']),
        startDate: randomDate(oneYearAgo, new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)),
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        location: randomChoice(['Office HQ', 'City Center', 'Local Community', 'Virtual']),
        points: randomInt(50, 200),
        maxParticipants: randomInt(20, 100),
        currentParticipants: 0,
        status: randomChoice(['upcoming', 'ongoing', 'completed', 'completed']),
        createdBy: randomChoice(users)._id
      });
      csrActivities.push(activity);
    }

    console.log('Creating Employee Participation...');
    const participationSet = new Set();
    for (let i = 0; i < 200; i++) {
      let activity = randomChoice(csrActivities);
      let user = randomChoice(users);
      let pairKey = `${user._id}_${activity._id}`;
      let retries = 0;
      while (participationSet.has(pairKey) && retries < 10) {
        activity = randomChoice(csrActivities);
        user = randomChoice(users);
        pairKey = `${user._id}_${activity._id}`;
        retries++;
      }
      if (participationSet.has(pairKey)) continue;
      
      participationSet.add(pairKey);
      await Participation.create({
        organization: org._id,
        user: user._id,
        activity: activity._id,
        status: randomChoice(['registered', 'attended', 'completed']),
        pointsEarned: randomChoice([0, activity.points]),
        feedback: 'Great event!',
        completedAt: randomDate(oneYearAgo, new Date())
      });
      await CsrActivity.findByIdAndUpdate(activity._id, { $inc: { currentParticipants: 1 } });
    }

    console.log('Creating Policies...');
    const policyTitles = ['Environmental Policy', 'Data Privacy', 'Workplace Safety', 'Waste Management', 'Anti Harassment', 'Code of Conduct', 'Diversity & Inclusion', 'Remote Work Policy', 'Travel Policy', 'Procurement Policy'];
    for (let title of policyTitles) {
      await Policy.create({
        title,
        organization: org._id,
        description: `Official guidelines for ${title}`,
        category: randomChoice(['Environmental', 'Social', 'Governance']),
        version: `1.${randomInt(0, 5)}`,
        status: randomChoice(['draft', 'active', 'active', 'active', 'archived']),
        effectiveDate: oneYearAgo,
        reviewDate: new Date(),
        documentUrl: 'https://example.com/policy.pdf',
        createdBy: randomChoice(users)._id
      });
    }

    console.log('Creating Audits...');
    const auditTitles = ['Internal Audit', 'Environmental Audit', 'Safety Audit', 'Financial Audit', 'Compliance Audit', 'IT Security Audit', 'Energy Audit', 'Waste Audit', 'Supplier Audit', 'Quality Audit', 'HR Audit', 'Health & Safety Audit', 'Carbon Footprint Audit', 'Diversity Audit', 'Data Privacy Audit'];
    for (let title of auditTitles) {
      await Audit.create({
        title,
        description: `Audit for ${title}`,
        organization: org._id,
        type: randomChoice(['Internal', 'External', 'Certification']),
        scope: 'Organization Wide',
        department: randomChoice(departments)._id,
        startDate: randomDate(oneYearAgo, new Date()),
        endDate: new Date(),
        conductedBy: randomChoice(users)._id,
        status: randomChoice(['planned', 'in_progress', 'completed']),
        score: randomInt(60, 100),
        findings: 'Minor issues found, mostly compliant.',
        reportUrl: 'https://example.com/audit.pdf'
      });
    }

    console.log('Creating Compliance Issues...');
    for (let i = 0; i < 25; i++) {
      await ComplianceIssue.create({
        title: `Compliance Issue #${i+1}`,
        organization: org._id,
        description: `Description for compliance issue #${i+1}`,
        category: randomChoice(['Environmental', 'Social', 'Governance']),
        severity: randomChoice(['low', 'medium', 'high', 'critical']),
        status: randomChoice(['open', 'in_progress', 'resolved', 'closed']),
        department: randomChoice(departments)._id,
        reportedBy: randomChoice(users)._id,
        assignedTo: randomChoice(users)._id,
        dueDate: randomDate(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 3)))
      });
    }

    console.log('Creating Challenges...');
    const challenges = [];
    const challengeCategories = ['Environmental', 'Social'];
    for (let i = 1; i <= 50; i++) {
      const challenge = await Challenge.create({
        title: `Challenge ${i}: Sustainability Initiative`,
        organization: org._id,
        description: `Join the Challenge ${i} and contribute to sustainability!`,
        category: randomChoice(challengeCategories),
        difficulty: randomChoice(['easy', 'medium', 'hard']),
        points: randomInt(50, 500),
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
        status: randomChoice(['upcoming', 'active', 'completed']),
        createdBy: randomChoice(users)._id
      });
      challenges.push(challenge);
    }

    console.log('Creating Badges & Rewards...');
    const badges = [];
    for (let i = 1; i <= 50; i++) {
      badges.push(await Badge.create({
        name: `Badge Level ${i}`,
        organization: org._id,
        description: `Awarded for achieving level ${i} milestones`,
        icon: randomChoice(['🌿', '🏆', '💧', '⚡', '🌟', '🤝', '🌍']),
        criteria: 'Achieve significant milestones',
        rarity: randomChoice(['common', 'rare', 'epic', 'legendary']),
        category: randomChoice(['Environmental', 'Social', 'Governance', 'Achievement', 'Special'])
      }));
    }

    const rewardTitles = ['Amazon Voucher', 'Coffee Coupon', 'Extra Leave', 'Movie Ticket', 'Gift Card', 'Lunch Coupon', 'Eco Bottle', 'Plant Kit'];
    for (let i = 0; i < 30; i++) {
      const title = randomChoice(rewardTitles);
      await Reward.create({
        organization: org._id,
        user: randomChoice(users)._id,
        points: randomInt(100, 1000),
        reason: `Redeemed for ${title}`,
        type: 'gift',
        awardedBy: randomChoice(users)._id
      });
    }

    console.log('Creating Leaderboards & Generating Notifications...');
    const notifications = [];
    for (let user of users) {
      const xp = randomInt(100, 5000);
      const level = Math.floor(xp / 200) + 1;
      
      const userBadges = [];
      const numBadges = randomInt(0, 3);
      for(let i=0; i<numBadges; i++) {
        userBadges.push(randomChoice(badges)._id);
      }
      await Leaderboard.create({
        organization: org._id,
        user: user._id,
        totalPoints: xp,
        level,
        badges: userBadges,
        activitiesCompleted: randomInt(0, 10),
        challengesCompleted: randomInt(0, 5)
      });

      for(let i=0; i<2; i++) {
        notifications.push({
          organization: org._id,
          recipient: user._id,
          title: randomChoice(['New CSR Activity', 'Policy Updated', 'Challenge Completed', 'Reward Redeemed', 'Audit Assigned']),
          message: 'Check out the latest updates in your dashboard.',
          type: randomChoice(['info', 'success', 'warning', 'achievement']),
          link: '/dashboard',
          isRead: Math.random() > 0.5
        });
      }
    }
    await Notification.insertMany(notifications);

    org.esgScore = randomInt(65, 90);
    await org.save();

    console.log('====================================');
    console.log('🌱 Database seeded successfully! 🌱');
    console.log('Login with:');
    console.log('Super Admin: admin@ecosphere.com / admin123');
    console.log('CEO: ceo@greentech.com / admin123');
    console.log('ESG Manager: esg@greentech.com / admin123');
    console.log('HR Manager: hr@greentech.com / admin123');
    console.log('Compliance Officer: compliance@greentech.com / admin123');
    console.log('====================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
