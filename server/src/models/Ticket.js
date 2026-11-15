const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'task', 'improvement'],
    default: 'bug',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
  order: {
    type: Number,
    default: 0,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // INNOVATIVE FEATURE 1: AI Diagnostics & Root Cause Analysis
  aiDiagnostics: {
    rootCause: { type: String, default: '' },
    suggestedFix: { type: String, default: '' },
    confidenceScore: { type: Number, default: 0 },
    complexity: { type: String, enum: ['Easy', 'Moderate', 'Complex'], default: 'Moderate' },
    analyzedAt: { type: Date },
  },
  // INNOVATIVE FEATURE 2: SLA & Sprint Health Deadlines
  slaDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default 3 days SLA
  },
  storyPoints: {
    type: Number,
    default: 3,
  },
  // INNOVATIVE FEATURE 3: Activity & Audit Trail
  activityLogs: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    details: String,
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
