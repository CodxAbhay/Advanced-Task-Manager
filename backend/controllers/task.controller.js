const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Project Member)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, dueDate, tags, status } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project are required',
      });
    }

    // Verify project exists and user is a member
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isMember = projectDoc.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You must be a project member to create tasks',
      });
    }

    // If assignee provided, verify they are a project member
    if (assignee) {
      const isAssigneeMember = projectDoc.members.some(
        (m) => m.user.toString() === assignee
      );
      if (!isAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: 'Assignee must be a project member',
        });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project,
      assignee: assignee || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
      tags: tags || [],
    });

    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating task',
    });
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (Project Member)
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isMember = project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Build filter
    const filter = { project: projectId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignee) filter.assignee = req.query.assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tasks',
    });
  }
};

// @desc    Get all tasks assigned to current user
// @route   GET /api/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const filter = { assignee: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching tasks',
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color members');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching task',
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Assignee or Project Admin)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check permissions: assignee, creator, or project admin
    const project = await Project.findById(task.project);
    const member = project
      ? project.members.find(
          (m) => m.user.toString() === req.user._id.toString()
        )
      : null;

    const isAssignee =
      task.assignee && task.assignee.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = member && member.role === 'admin';

    if (!isAssignee && !isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only assignee, creator, or project admin can update this task',
      });
    }

    const { title, description, assignee, status, priority, dueDate, tags } =
      req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags) task.tags = tags;

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating task',
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Project Admin or Creator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check permissions
    const project = await Project.findById(task.project);
    const member = project
      ? project.members.find(
          (m) => m.user.toString() === req.user._id.toString()
        )
      : null;

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = member && member.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only creator or project admin can delete this task',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting task',
    });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
};
