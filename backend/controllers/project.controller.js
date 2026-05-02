const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const project = await Project.create({
      name,
      description: description || '',
      color: color || '#6366f1',
      owner: req.user._id,
    });

    await project.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating project',
    });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Add task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { project: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]);

        const counts = {
          total: 0,
          todo: 0,
          'in-progress': 0,
          review: 0,
          done: 0,
        };

        taskCounts.forEach((tc) => {
          counts[tc._id] = tc.count;
          counts.total += tc.count;
        });

        return {
          ...project.toObject(),
          taskCounts: counts,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: projectsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching projects',
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private (Project Member)
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check membership
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Get task counts
    const taskCounts = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      total: 0,
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };

    taskCounts.forEach((tc) => {
      counts[tc._id] = tc.count;
      counts.total += tc.count;
    });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        taskCounts: counts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching project',
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Project Admin)
const updateProject = async (req, res) => {
  try {
    const { name, description, status, color } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check admin
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can update the project',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (color) project.color = color;

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating project',
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Project Admin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check admin
    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can delete the project',
      });
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting project',
    });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Project Admin)
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check admin
    const adminMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!adminMember || adminMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can add members',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with that email',
      });
    }

    // Check if already a member
    const existingMember = project.members.find(
      (m) => m.user.toString() === user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push({
      user: user._id,
      role: role || 'member',
    });

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error adding member',
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Project Admin)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check admin
    const adminMember = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!adminMember || adminMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project admins can remove members',
      });
    }

    // Can't remove the owner
    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner',
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    // Unassign tasks from removed member
    await Task.updateMany(
      { project: project._id, assignee: req.params.userId },
      { assignee: null }
    );

    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error removing member',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
