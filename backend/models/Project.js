const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  {
    timestamps: true,
  }
);

// Add owner as admin member on creation
projectSchema.pre('save', function (next) {
  if (this.isNew) {
    const ownerExists = this.members.some(
      (m) => m.user.toString() === this.owner.toString()
    );
    if (!ownerExists) {
      this.members.push({ user: this.owner, role: 'admin' });
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
