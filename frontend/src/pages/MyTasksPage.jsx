import { useState, useEffect } from 'react';
import API from '../api/axios';
import Badge from '../components/UI/Badge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './MyTasksPage.css';

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try { const res = await API.get('/tasks/my-tasks'); setTasks(res.data.data); }
    catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date';
  const isOverdue = (d) => d ? new Date(d) < new Date() : false;

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="my-tasks-page"><div className="page-header"><h1 className="page-title">My Tasks</h1></div><div className="spinner" style={{margin:'40px auto'}} /></div>;

  return (
    <div className="my-tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you</p>
        </div>
      </div>

      <div className="filter-bar">
        {[{ key: 'all', label: 'All' }, { key: 'todo', label: 'To Do' }, { key: 'in-progress', label: 'In Progress' }, { key: 'review', label: 'Review' }, { key: 'done', label: 'Done' }].map(f => (
          <button key={f.key} className={`filter-btn ${filter === f.key ? 'filter-active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.key !== 'all' && <span className="filter-count">{tasks.filter(t => f.key === 'all' ? true : t.status === f.key).length}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
          <h2>{filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}</h2>
          <p>Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="tasks-table">
          <div className="table-header">
            <span className="col-title">Task</span>
            <span className="col-project">Project</span>
            <span className="col-priority">Priority</span>
            <span className="col-date">Due Date</span>
            <span className="col-status">Status</span>
          </div>
          {filtered.map((task, i) => (
            <div key={task._id} className={`table-row animate-fade-in-up stagger-${(i % 5) + 1}`} onClick={() => navigate(`/projects/${task.project?._id}`)}>
              <div className="col-title">
                <span className="task-name">{task.title}</span>
                {task.description && <span className="task-desc-preview">{task.description}</span>}
              </div>
              <div className="col-project">
                <span className="project-dot" style={{ background: task.project?.color || '#6366f1' }} />
                <span>{task.project?.name || 'Unknown'}</span>
              </div>
              <div className="col-priority"><Badge variant={task.priority} size="sm">{task.priority}</Badge></div>
              <div className="col-date">
                <span className={isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : ''}>{formatDate(task.dueDate)}</span>
              </div>
              <div className="col-status" onClick={e => e.stopPropagation()}>
                <select className="status-select" value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)} style={{ color: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#3b82f6' : task.status === 'review' ? '#f59e0b' : '#94a3b8' }}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
