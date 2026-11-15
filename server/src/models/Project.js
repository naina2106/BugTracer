const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  key: {
    type: String,
    required: [true, 'Project key is required (e.g. BUG, PROJ)'],
    uppercase: true,
    trim: true,
    maxlength: 10,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'developer', 'viewer'],
      default: 'developer',
    }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
