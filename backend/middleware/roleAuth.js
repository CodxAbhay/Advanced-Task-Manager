const Project = require('../models/Project');

// Check if user is a member of the project
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message: 'Access denied — you are not a member of this project',
      });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking project access',
    });
  }
};

// Check if user is an admin of the project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied — admin privileges required',
      });
    }

    req.project = project;
    req.memberRole = member.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error checking project access',
    });
  }
};

module.exports = { requireProjectMember, requireProjectAdmin };
