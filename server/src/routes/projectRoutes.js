const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects for the current user (either owner or team member)
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', protect, async (req, res) => {
  try {
    const { title, key, description, teamMembers } = req.body;

    if (!title || !key) {
      return res.status(400).json({ success: false, message: 'Please provide project title and key' });
    }

    // Default owner into team members if not already included
    const initialMembers = teamMembers ? [...teamMembers] : [];
    if (!initialMembers.some(m => m.user && m.user.toString() === req.user._id.toString())) {
      initialMembers.push({ user: req.user._id, role: 'admin' });
    }

    const project = await Project.create({
      title,
      key: key.toUpperCase(),
      description,
      owner: req.user._id,
      teamMembers: initialMembers,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role');

    res.status(201).json({ success: true, data: populatedProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project details with ticket summary
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Authorization: User must be owner or team member
    const isMember = project.owner._id.toString() === req.user._id.toString() ||
      project.teamMembers.some(m => m.user._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can edit project details' });
    }

    const { title, description, teamMembers } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (teamMembers) project.teamMembers = teamMembers;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
router.post('/:id/members', protect, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const alreadyMember = project.teamMembers.some(
      m => m.user.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this project' });
    }

    project.teamMembers.push({ user: userId, role: role || 'developer' });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can remove members' });
    }

    project.teamMembers = project.teamMembers.filter(
      m => m.user.toString() !== req.params.userId.toString()
    );

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project and its tickets
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only project owner can delete this project' });
    }

    await Ticket.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ success: true, message: 'Project and associated tickets deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
