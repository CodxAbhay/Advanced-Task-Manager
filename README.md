# 🚀 Advanced Task Manager

A full-stack team task management application with role-based access control, Kanban boards, and real-time project tracking.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)

## ✨ Features

### Authentication & Authorization
- Secure JWT-based authentication (Signup/Login)
- Role-based access control (Admin/Member)
- Project-level permission management

### Project Management
- Create, update, and delete projects
- Add/remove team members with role assignment
- Color-coded project cards with task statistics
- Project archival support

### Task Management
- Kanban board with **drag-and-drop** status updates
- Task creation with assignee, priority, due date, and tags
- Four task statuses: To Do → In Progress → Review → Done
- Four priority levels: Low, Medium, High, Critical
- Overdue task tracking

### Dashboard
- Real-time statistics overview
- Task status distribution with visual progress bars
- Priority breakdown
- Recent activity feed
- Upcoming deadline alerts

### UI/UX
- Premium dark theme with glassmorphism design
- Micro-animations and smooth transitions
- Fully responsive (mobile, tablet, desktop)
- Custom-styled scrollbars
- Loading skeletons for better UX

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Styling** | Vanilla CSS with CSS Custom Properties |
| **Deployment** | Railway |

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/            # Auth & RBAC middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── server.js             # Express entry point
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth state management
│   │   └── pages/            # Application pages
│   └── index.html
├── .env.example
├── railway.toml
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Local Development

1. **Clone the repository**
```bash
git clone <repo-url>
cd advanced-task-manager
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. **Install dependencies**
```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

4. **Run in development mode**
```bash
# Terminal 1 — Start backend
npm run dev

# Terminal 2 — Start frontend
npm run dev-frontend
```

5. **Open the app**
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | List all users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/project/:projectId` | Get project tasks |
| GET | `/api/tasks/my-tasks` | Get assigned tasks |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## 🌐 Deployment (Railway)

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard:
   - `MONGO_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A secure random string
   - `NODE_ENV` — Set to `production`
5. Railway auto-detects the `railway.toml` and deploys

## 👥 Role-Based Access Control

| Action | Admin | Member |
|--------|:-----:|:------:|
| Create project | ✅ | ✅ |
| Update/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Create tasks | ✅ | ✅ |
| Update own tasks | ✅ | ✅ |
| Delete any task | ✅ | ❌ |
| View dashboard | ✅ | ✅ |

## 📝 License

MIT License — Abhay Pratap Verma
