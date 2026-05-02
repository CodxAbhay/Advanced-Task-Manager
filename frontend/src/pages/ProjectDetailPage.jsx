import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import toast from 'react-hot-toast';
import './ProjectDetailPage.css';

const STATUSES = [
  { key: 'todo', label: 'To Do', color: '#64748b' },
  { key: 'in-progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'review', label: 'Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('board');
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);

  const isAdmin = project?.members?.some(m => (m.user?._id || m.user) === user?._id && m.role === 'admin');

  useEffect(() => { fetchProject(); fetchTasks(); }, [id]);

  const fetchProject = async () => {
    try { const res = await API.get(`/projects/${id}`); setProject(res.data.data); }
    catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try { const res = await API.get(`/tasks/project/${id}`); setTasks(res.data.data); }
    catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) { toast.error('Title required'); return; }
    setCreating(true);
    try {
      await API.post('/tasks', { ...newTask, project: id, assignee: newTask.assignee || undefined, dueDate: newTask.dueDate || undefined });
      toast.success('Task created!');
      setShowCreateTask(false);
      setNewTask({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', status: 'todo' });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try { await API.put(`/tasks/${taskId}`, { status: newStatus }); setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t)); }
    catch { toast.error('Failed to update'); fetchTasks(); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${taskId}`); toast.success('Deleted'); fetchTasks(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try { await API.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole }); toast.success('Member added!'); setMemberEmail(''); setShowAddMember(false); fetchProject(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try { await API.delete(`/projects/${id}/members/${userId}`); toast.success('Removed'); fetchProject(); fetchTasks(); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all tasks?')) return;
    try { await API.delete(`/projects/${id}`); toast.success('Project deleted'); navigate('/projects'); }
    catch { toast.error('Failed'); }
  };

  const handleDragStart = (e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move'; e.target.classList.add('dragging'); };
  const handleDragEnd = (e) => { e.target.classList.remove('dragging'); setDraggedTask(null); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDragEnter = (e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
  const handleDragLeave = (e) => { e.currentTarget.classList.remove('drag-over'); };
  const handleDrop = (e, status) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); if (draggedTask && draggedTask.status !== status) handleUpdateTaskStatus(draggedTask._id, status); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const isOverdue = (d) => d ? new Date(d) < new Date() : false;

  if (loading) return <div className="project-detail"><div className="spinner" style={{margin:'40px auto'}} /></div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((a, s) => { a[s.key] = tasks.filter(t => t.status === s.key); return a; }, {});

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <div className="project-detail-info">
          <button className="back-btn" onClick={() => navigate('/projects')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="project-color-dot" style={{ background: project.color || '#6366f1' }} />
              <h1 className="page-title">{project.name}</h1>
            </div>
            {project.description && <p className="page-subtitle" style={{ marginTop: 4 }}>{project.description}</p>}
          </div>
        </div>
        <div className="project-detail-actions">
          <Button variant="primary" size="sm" onClick={() => setShowCreateTask(true)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}>Add Task</Button>
          {isAdmin && <>
            <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>Add Member</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteProject}>Delete</Button>
          </>}
        </div>
      </div>

      <div className="detail-tabs">
        <button className={`detail-tab ${activeTab === 'board' ? 'tab-active' : ''}`} onClick={() => setActiveTab('board')}>Board</button>
        <button className={`detail-tab ${activeTab === 'members' ? 'tab-active' : ''}`} onClick={() => setActiveTab('members')}>Members ({project.members?.length || 0})</button>
      </div>

      {activeTab === 'board' && (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div key={status.key} className="kanban-column" onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, status.key)}>
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <span className="kanban-dot" style={{ background: status.color }} />
                  <span>{status.label}</span>
                  <span className="kanban-count">{tasksByStatus[status.key]?.length || 0}</span>
                </div>
              </div>
              <div className="kanban-column-body">
                {tasksByStatus[status.key]?.map(task => (
                  <div key={task._id} className="kanban-card" draggable onDragStart={e => handleDragStart(e, task)} onDragEnd={handleDragEnd}>
                    <div className="kanban-card-header">
                      <Badge variant={task.priority} size="sm">{task.priority}</Badge>
                      <button className="kanban-card-delete" onClick={e => { e.stopPropagation(); handleDeleteTask(task._id); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                    <h4 className="kanban-card-title">{task.title}</h4>
                    {task.description && <p className="kanban-card-desc">{task.description}</p>}
                    <div className="kanban-card-footer">
                      {task.dueDate && <span className={`kanban-card-date ${isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : ''}`}>📅 {formatDate(task.dueDate)}</span>}
                      {task.assignee && <div className="kanban-card-assignee" title={task.assignee.name}>{task.assignee.avatar || '?'}</div>}
                    </div>
                  </div>
                ))}
                {tasksByStatus[status.key]?.length === 0 && <div className="kanban-empty"><p>No tasks</p></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="members-list animate-fade-in">
          {project.members?.map(member => (
            <div key={member.user?._id || member._id} className="member-item">
              <div className="member-info">
                <div className="member-avatar-lg">{member.user?.avatar || '?'}</div>
                <div><span className="member-name">{member.user?.name || 'Unknown'}</span><span className="member-email">{member.user?.email || ''}</span></div>
              </div>
              <div className="member-actions">
                <Badge variant={member.role} size="sm">{member.role}</Badge>
                {isAdmin && member.user?._id !== project.owner?._id && (
                  <button className="member-remove" onClick={() => handleRemoveMember(member.user?._id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task" size="lg">
        <form onSubmit={handleCreateTask} className="create-form">
          <Input id="task-title" label="Task Title" placeholder="What needs to be done?" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
          <div className="input-group"><label className="input-label">Description</label><textarea className="input-field textarea-field" placeholder="Add details..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={3} /></div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Assignee</label><select className="input-field select-field" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})}><option value="">Unassigned</option>{project.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}</select></div>
            <div className="input-group"><label className="input-label">Priority</label><select className="input-field select-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>{PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="input-group"><label className="input-label">Status</label><select className="input-field select-field" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>{STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
            <Input id="task-due-date" label="Due Date" type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
          </div>
          <div className="form-actions"><Button variant="secondary" onClick={() => setShowCreateTask(false)}>Cancel</Button><Button type="submit" variant="primary" loading={creating}>Create Task</Button></div>
        </form>
      </Modal>

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Team Member" size="sm">
        <form onSubmit={handleAddMember} className="create-form">
          <Input id="member-email" label="User Email" type="email" placeholder="colleague@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
          <div className="input-group"><label className="input-label">Role</label><select className="input-field select-field" value={memberRole} onChange={e => setMemberRole(e.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select></div>
          <div className="form-actions"><Button variant="secondary" onClick={() => setShowAddMember(false)}>Cancel</Button><Button type="submit" variant="primary" loading={addingMember}>Add Member</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
