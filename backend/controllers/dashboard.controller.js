const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's projects
    const projects = await Project.find({ 'members.user': userId });
    const projectIds = projects.map((p) => p._id);

    // Total counts
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;

    // Task statistics
    const allTasks = await Task.find({ project: { $in: projectIds } });
    const myTasks = await Task.find({ assignee: userId });

    const totalTasks = allTasks.length;
    const myTaskCount = myTasks.length;

    // Tasks by status
    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
    };

    allTasks.forEach((task) => {
      statusCounts[task.status]++;
    });

    // Overdue tasks (not done, past due date)
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'done'
    ).length;

    const myOverdueTasks = myTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'done'
    ).length;

    // Priority breakdown
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    allTasks.forEach((task) => {
      if (task.status !== 'done') {
        priorityCounts[task.priority]++;
      }
    });

    // Recent tasks (last 10)
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $gte: now, $lte: nextWeek },
      status: { $ne: 'done' },
    })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color')
      .sort({ dueDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        myTaskCount,
        statusCounts,
        overdueTasks,
        myOverdueTasks,
        priorityCounts,
        recentTasks,
        upcomingTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching dashboard stats',
    });
  }
};

module.exports = { getStats };
