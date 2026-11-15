const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    let projectFilter = {};

    if (projectId && projectId !== 'all') {
      projectFilter.projectId = projectId;
    } else {
      const userProjects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'teamMembers.user': req.user._id }
        ]
      }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      projectFilter.projectId = { $in: projectIds };
    }

    const totalTickets = await Ticket.countDocuments(projectFilter);
    const todoTickets = await Ticket.countDocuments({ ...projectFilter, status: 'To Do' });
    const inProgressTickets = await Ticket.countDocuments({ ...projectFilter, status: 'In Progress' });
    const doneTickets = await Ticket.countDocuments({ ...projectFilter, status: 'Done' });

    // Priorities
    const lowPriority = await Ticket.countDocuments({ ...projectFilter, priority: 'low' });
    const mediumPriority = await Ticket.countDocuments({ ...projectFilter, priority: 'medium' });
    const highPriority = await Ticket.countDocuments({ ...projectFilter, priority: 'high' });
    const criticalPriority = await Ticket.countDocuments({ ...projectFilter, priority: 'critical' });

    // Types
    const bugsCount = await Ticket.countDocuments({ ...projectFilter, type: 'bug' });
    const featuresCount = await Ticket.countDocuments({ ...projectFilter, type: 'feature' });
    const tasksCount = await Ticket.countDocuments({ ...projectFilter, type: 'task' });
    const improvementsCount = await Ticket.countDocuments({ ...projectFilter, type: 'improvement' });

    // INNOVATION: SLA Health Monitoring (Breached vs On-Track)
    const now = new Date();
    const breachedSlaCount = await Ticket.countDocuments({
      ...projectFilter,
      status: { $ne: 'Done' },
      slaDeadline: { $lt: now }
    });

    const atRiskSlaCount = await Ticket.countDocuments({
      ...projectFilter,
      status: { $ne: 'Done' },
      slaDeadline: {
        $gte: now,
        $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Within next 24 hours
      }
    });

    // INNOVATION: Sprint Story Points & Velocity
    const allProjectTickets = await Ticket.find(projectFilter).select('storyPoints status');
    const totalStoryPoints = allProjectTickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = allProjectTickets
      .filter(t => t.status === 'Done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const sprintVelocity = totalStoryPoints > 0 
      ? Math.round((completedStoryPoints / totalStoryPoints) * 100) 
      : 0;

    // Assigned to me
    const assignedToMe = await Ticket.countDocuments({
      ...projectFilter,
      assignee: req.user._id,
      status: { $ne: 'Done' }
    });

    // Recent tickets
    const recentTickets = await Ticket.find(projectFilter)
      .populate('assignee', 'name email avatar')
      .populate('projectId', 'title key')
      .sort({ updatedAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        counts: {
          total: totalTickets,
          todo: todoTickets,
          inProgress: inProgressTickets,
          done: doneTickets,
          assignedToMe,
        },
        sla: {
          breached: breachedSlaCount,
          atRisk: atRiskSlaCount,
          healthScore: totalTickets > 0 ? Math.max(0, Math.round(((totalTickets - breachedSlaCount) / totalTickets) * 100)) : 100,
        },
        velocity: {
          totalPoints: totalStoryPoints,
          completedPoints: completedStoryPoints,
          percentage: sprintVelocity,
        },
        priorities: {
          low: lowPriority,
          medium: mediumPriority,
          high: highPriority,
          critical: criticalPriority,
        },
        types: {
          bug: bugsCount,
          feature: featuresCount,
          task: tasksCount,
          improvement: improvementsCount,
        },
        recentTickets,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
