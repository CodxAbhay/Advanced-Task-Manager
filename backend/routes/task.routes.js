const express = require('express');
const router = express.Router();
const {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTask);
router.get('/my-tasks', protect, getMyTasks);
router.get('/project/:projectId', protect, getProjectTasks);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
