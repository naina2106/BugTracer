const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeIssueWithAI } = require('../utils/aiAssistant');

// @route   GET /api/tickets
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, status, priority, type, assignee, search, slaBreached } = req.query;
    let query = {};

    if (projectId) query.projectId = projectId;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (type && type !== 'all') query.type = type;

    if (assignee && assignee !== 'all') {
      query.assignee = assignee === 'unassigned' ? null : assignee;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (slaBreached === 'true') {
      query.slaDeadline = { $lt: new Date() };
      query.status = { $ne: 'Done' };
    }

    const tickets = await Ticket.find(query)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, type, priority, status, projectId, assignee, storyPoints, slaDays } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Please provide ticket title and projectId' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Auto-generate AI root cause & suggested fix on creation
    const aiAnalysis = analyzeIssueWithAI(title, description || '', type || 'bug', priority || 'medium');

    const lastTicket = await Ticket.findOne({ projectId, status: status || 'To Do' }).sort({ order: -1 });
    const order = lastTicket ? lastTicket.order + 1 : 0;

    const days = slaDays ? parseInt(slaDays) : (priority === 'critical' ? 1 : priority === 'high' ? 2 : 5);
    const slaDeadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const ticket = await Ticket.create({
      title,
      description,
      type: type || 'bug',
      priority: priority || 'medium',
      status: status || 'To Do',
      projectId,
      reporter: req.user._id,
      assignee: assignee || null,
      storyPoints: storyPoints || 3,
      slaDeadline,
      aiDiagnostics: aiAnalysis,
      order,
      activityLogs: [{
        action: 'CREATED_ISSUE',
        user: req.user._id,
        details: `Issue created with initial status '${status || 'To Do'}' and AI Diagnostics applied.`,
      }],
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    res.status(201).json({ success: true, data: populatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tickets/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const comments = await Comment.find({ ticketId: ticket._id })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        ...ticket.toObject(),
        comments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets/:id/analyze-ai
// @desc    Trigger explicit AI re-analysis on demand
router.post('/:id/analyze-ai', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.aiDiagnostics = analyzeIssueWithAI(ticket.title, ticket.description, ticket.type, ticket.priority);
    ticket.activityLogs.push({
      action: 'AI_DIAGNOSIS_TRIGGERED',
      user: req.user._id,
      details: 'Triggered AI Root Cause and Solution re-analysis.',
    });

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tickets/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const { title, description, priority, status, assignee, type, storyPoints, order } = req.body;

    const changes = [];
    if (title !== undefined && title !== ticket.title) {
      changes.push(`Title changed to '${title}'`);
      ticket.title = title;
    }
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined && priority !== ticket.priority) {
      changes.push(`Priority changed from '${ticket.priority}' to '${priority}'`);
      ticket.priority = priority;
    }
    if (status !== undefined && status !== ticket.status) {
      changes.push(`Status moved to '${status}'`);
      ticket.status = status;
    }
    if (assignee !== undefined) {
      changes.push(`Assignee updated`);
      ticket.assignee = assignee || null;
    }
    if (type !== undefined) ticket.type = type;
    if (storyPoints !== undefined) ticket.storyPoints = storyPoints;
    if (order !== undefined) ticket.order = order;

    if (changes.length > 0) {
      ticket.activityLogs.push({
        action: 'UPDATED_ISSUE',
        user: req.user._id,
        details: changes.join(', '),
      });
    }

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/tickets/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, order } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const oldStatus = ticket.status;
    if (status) ticket.status = status;
    if (order !== undefined) ticket.order = order;

    if (oldStatus !== status) {
      ticket.activityLogs.push({
        action: 'STATUS_TRANSITION',
        user: req.user._id,
        details: `Moved from '${oldStatus}' to '${status}' via Sprint Board`,
      });
    }

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets/:id/attachments
router.post('/:id/attachments', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a file' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.attachments.push({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    ticket.activityLogs.push({
      action: 'ATTACHMENT_ADDED',
      user: req.user._id,
      details: `Attached file: ${req.file.originalname}`,
    });

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role')
      .populate('reporter', 'name email avatar role')
      .populate('projectId', 'title key')
      .populate('activityLogs.user', 'name avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tickets/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    await Comment.deleteMany({ ticketId: ticket._id });
    await Ticket.findByIdAndDelete(ticket._id);

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tickets/:id/comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') return res.status(400).json({ success: false, message: 'Comment text is required' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const comment = await Comment.create({
      ticketId: ticket._id,
      user: req.user._id,
      text,
    });

    ticket.activityLogs.push({
      action: 'COMMENT_POSTED',
      user: req.user._id,
      details: `Added a comment: "${text.slice(0, 40)}..."`,
    });
    await ticket.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar role');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tickets/:id/comments/:commentId
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
