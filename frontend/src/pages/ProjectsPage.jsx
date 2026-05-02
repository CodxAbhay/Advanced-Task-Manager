import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Badge from '../components/UI/Badge';
import toast from 'react-hot-toast';
import './ProjectsPage.css';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#3b82f6', '#06b6d4',
];

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setCreating(true);
    try {
      await API.post('/projects', newProject);
      toast.success('Project created!');
      setShowCreate(false);
      setNewProject({ name: '', description: '', color: '#6366f1' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team projects</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreate(true)}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="projects-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="project-card">
              <div className="skeleton skeleton-text" style={{ height: 20, width: '60%' }} />
              <div className="skeleton skeleton-text medium" />
              <div className="skeleton skeleton-text short" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2>No Projects Yet</h2>
          <p>Create your first project to start managing tasks with your team.</p>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, i) => (
            <div
              key={project._id}
              className={`project-card animate-fade-in-up stagger-${(i % 5) + 1}`}
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              <div className="project-card-header">
                <div className="project-color-bar" style={{ background: project.color || '#6366f1' }} />
                <div className="project-card-title">
                  <h3>{project.name}</h3>
                  <Badge variant={project.status === 'active' ? 'done' : 'default'} size="sm">
                    {project.status}
                  </Badge>
                </div>
              </div>

              {project.description && (
                <p className="project-card-desc">{project.description}</p>
              )}

              <div className="project-card-stats">
                <div className="project-stat">
                  <span className="project-stat-value">{project.taskCounts?.total || 0}</span>
                  <span className="project-stat-label">Tasks</span>
                </div>
                <div className="project-stat">
                  <span className="project-stat-value">{project.taskCounts?.done || 0}</span>
                  <span className="project-stat-label">Done</span>
                </div>
                <div className="project-stat">
                  <span className="project-stat-value">{project.taskCounts?.['in-progress'] || 0}</span>
                  <span className="project-stat-label">Active</span>
                </div>
              </div>

              <div className="project-card-footer">
                <div className="project-members">
                  {project.members?.slice(0, 4).map((m, idx) => (
                    <div
                      key={m.user?._id || idx}
                      className="member-avatar-sm"
                      title={m.user?.name}
                      style={{ zIndex: 4 - idx }}
                    >
                      {m.user?.avatar || '?'}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="member-avatar-sm member-more">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="project-date">
                  {new Date(project.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="create-form">
          <Input
            id="project-name"
            label="Project Name"
            placeholder="e.g., Marketing Campaign"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="input-field textarea-field"
              placeholder="Brief description of your project..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Project Color</label>
            <div className="color-picker">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${newProject.color === color ? 'color-active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setNewProject({ ...newProject, color })}
                />
              ))}
            </div>
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
