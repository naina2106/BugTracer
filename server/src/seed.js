const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Ticket = require('./models/Ticket');
const Comment = require('./models/Comment');
const { analyzeIssueWithAI } = require('./utils/aiAssistant');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bugtracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for BugTracer seeding...');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Ticket.deleteMany({});
    await Comment.deleteMany({});

    // Demo Users
    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@bugtracer.io',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const dev1 = await User.create({
      name: 'Alex Rivera (Dev)',
      email: 'alex@bugtracer.io',
      password: 'password123',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    const dev2 = await User.create({
      name: 'Maya Patel (Dev)',
      email: 'maya@bugtracer.io',
      password: 'password123',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    });

    const pm = await User.create({
      name: 'David Chen (PM)',
      email: 'david@bugtracer.io',
      password: 'password123',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    });

    // Enterprise Projects
    const projectCloud = await Project.create({
      title: 'Distributed Cloud Microservices',
      key: 'DCM',
      description: 'Zero-downtime Kubernetes cluster deployment with distributed Redis caching and Kafka streaming.',
      owner: admin._id,
      teamMembers: [
        { user: admin._id, role: 'admin' },
        { user: pm._id, role: 'manager' },
        { user: dev1._id, role: 'developer' },
        { user: dev2._id, role: 'developer' },
      ],
    });

    const projectMobile = await Project.create({
      title: 'Fintech Mobile Engine',
      key: 'FME',
      description: 'Native mobile banking and biometric payments client with offline cryptographic storage.',
      owner: pm._id,
      teamMembers: [
        { user: pm._id, role: 'manager' },
        { user: dev1._id, role: 'developer' },
        { user: admin._id, role: 'admin' },
      ],
    });

    // Sample Tickets with AI Diagnostics & SLA
    const ticket1 = await Ticket.create({
      title: 'Memory leak in Redis caching tier during batch sync',
      description: 'Workers are terminating with OOM killer when syncing more than 50k item payloads in a single transaction. Memory heap dumps spike over 2.4GB.',
      type: 'bug',
      priority: 'critical',
      status: 'In Progress',
      projectId: projectCloud._id,
      reporter: pm._id,
      assignee: dev1._id,
      storyPoints: 5,
      slaDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000), // Breached SLA!
      aiDiagnostics: analyzeIssueWithAI('Memory leak in Redis caching tier during batch sync', 'Workers are terminating with OOM killer', 'bug', 'critical'),
      order: 0,
      activityLogs: [
        { action: 'CREATED_ISSUE', user: pm._id, details: 'Reported production critical crash' },
        { action: 'STATUS_TRANSITION', user: dev1._id, details: 'Moved from To Do to In Progress' }
      ]
    });

    const ticket2 = await Ticket.create({
      title: 'Implement OAuth2 / SSO Google authentication',
      description: 'Allow team users to sign in using their Google Workspace single sign-on credentials.',
      type: 'feature',
      priority: 'high',
      status: 'To Do',
      projectId: projectCloud._id,
      reporter: admin._id,
      assignee: dev2._id,
      storyPoints: 8,
      slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // At Risk!
      aiDiagnostics: analyzeIssueWithAI('Implement OAuth2 / SSO Google authentication', 'Google Workspace SSO', 'feature', 'high'),
      order: 0,
    });

    const ticket3 = await Ticket.create({
      title: 'Optimize SQL indexing for audit activity logs',
      description: 'Query execution time exceeds 2400ms on the audit log view when filtering by date range.',
      type: 'improvement',
      priority: 'medium',
      status: 'To Do',
      projectId: projectCloud._id,
      reporter: dev1._id,
      assignee: dev1._id,
      storyPoints: 3,
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      aiDiagnostics: analyzeIssueWithAI('Optimize SQL indexing for audit activity logs', 'slow query execution time', 'improvement', 'medium'),
      order: 1,
    });

    const ticket4 = await Ticket.create({
      title: 'CORS policy headers blocking staging webhook triggers',
      description: 'Staging webhooks from Stripe simulator are returning 403 Forbidden with CORS origin mismatch.',
      type: 'bug',
      priority: 'high',
      status: 'Done',
      projectId: projectCloud._id,
      reporter: pm._id,
      assignee: dev2._id,
      storyPoints: 2,
      slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
      aiDiagnostics: analyzeIssueWithAI('CORS policy headers blocking staging webhook', 'CORS origin mismatch 403', 'bug', 'high'),
      order: 0,
    });

    // Mobile App Tickets
    await Ticket.create({
      title: 'Push notification deep links failing on iOS 18',
      description: 'Universal links do not navigate directly to ticket detail when notification is tapped from cold launch state.',
      type: 'bug',
      priority: 'high',
      status: 'In Progress',
      projectId: projectMobile._id,
      reporter: pm._id,
      assignee: dev1._id,
      storyPoints: 5,
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      aiDiagnostics: analyzeIssueWithAI('Push notification deep links failing on iOS 18', 'Universal links fail from cold launch', 'bug', 'high'),
      order: 0,
    });

    // Sample comments
    await Comment.create({
      ticketId: ticket1._id,
      user: dev1._id,
      text: 'AI Diagnosis pointed directly to the JSON stream allocation. I applied the proposed fix in pull request #14.',
    });

    console.log('✅ BugTracer seeding complete!');
    console.log('Demo Credentials:');
    console.log('Email: admin@bugtracer.io | Password: password123');
    console.log('Email: alex@bugtracer.io  | Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
