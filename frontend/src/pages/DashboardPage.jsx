import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Badge from '../components/UI/Badge';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton skeleton-text short" />
              <div className="skeleton skeleton-text" style={{ height: 32, width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'In Progress',
      value: stats?.statusCounts?.['in-progress'] || 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Overdue',
      value: stats?.overdueTasks || 0,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
  ];

  const totalActive = (stats?.statusCounts?.todo || 0) +
    (stats?.statusCounts?.['in-progress'] || 0) +
    (stats?.statusCounts?.review || 0) +
    (stats?.statusCounts?.done || 0);

  const getBarWidth = (count) => {
    if (totalActive === 0) return '0%';
    return `${(count / totalActive) * 100}%`;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your projects and tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Distribution */}
      <div className="dashboard-grid">
        <div className="dashboard-card animate-fade-in-up">
          <h3 className="card-title">Task Status Distribution</h3>
          <div className="status-bars">
            {[
              { key: 'todo', label: 'To Do', color: '#64748b' },
              { key: 'in-progress', label: 'In Progress', color: '#3b82f6' },
              { key: 'review', label: 'Review', color: '#f59e0b' },
              { key: 'done', label: 'Done', color: '#10b981' },
            ].map((status) => (
              <div key={status.key} className="status-bar-item">
                <div className="status-bar-header">
                  <span className="status-bar-label">
                    <span className="status-dot" style={{ background: status.color }} />
                    {status.label}
                  </span>
                  <span className="status-bar-count">
                    {stats?.statusCounts?.[status.key] || 0}
                  </span>
                </div>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: getBarWidth(stats?.statusCounts?.[status.key] || 0),
                      background: status.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="dashboard-card animate-fade-in-up">
          <h3 className="card-title">Priority Breakdown</h3>
          <div className="priority-grid">
            {[
              { key: 'critical', label: 'Critical', color: '#ef4444', icon: '🔴' },
              { key: 'high', label: 'High', color: '#f59e0b', icon: '🟠' },
              { key: 'medium', label: 'Medium', color: '#3b82f6', icon: '🔵' },
              { key: 'low', label: 'Low', color: '#6b7280', icon: '⚪' },
            ].map((p) => (
              <div key={p.key} className="priority-item">
                <span className="priority-icon">{p.icon}</span>
                <span className="priority-label">{p.label}</span>
                <span className="priority-count" style={{ color: p.color }}>
                  {stats?.priorityCounts?.[p.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks & Upcoming Deadlines */}
      <div className="dashboard-grid">
        <div className="dashboard-card animate-fade-in-up">
          <h3 className="card-title">Recent Activity</h3>
          <div className="task-list">
            {stats?.recentTasks?.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="task-list-item"
                  onClick={() => navigate(`/projects/${task.project?._id}`)}
                >
                  <div className="task-list-info">
                    <span className="task-list-name">{task.title}</span>
                    <span className="task-list-project">
                      <span
                        className="project-dot"
                        style={{ background: task.project?.color || '#6366f1' }}
                      />
                      {task.project?.name || 'Unknown'}
                    </span>
                  </div>
                  <Badge variant={task.status} size="sm">
                    {task.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="empty-state-small">
                <p>No tasks yet. Create a project to get started!</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card animate-fade-in-up">
          <h3 className="card-title">Upcoming Deadlines</h3>
          <div className="task-list">
            {stats?.upcomingTasks?.length > 0 ? (
              stats.upcomingTasks.map((task) => (
                <div key={task._id} className="task-list-item">
                  <div className="task-list-info">
                    <span className="task-list-name">{task.title}</span>
                    <span className={`task-list-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                      📅 {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <div className="task-list-avatar">
                    {task.assignee?.avatar || '?'}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-small">
                <p>No upcoming deadlines 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
