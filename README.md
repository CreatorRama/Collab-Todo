# Real-Time Collaborative To-Do Board

A modern, real-time collaborative task management application built with React and Node.js. Multiple users can simultaneously manage tasks with live updates, conflict resolution, and intelligent task assignment.

## 🚀 Live Demo

**Live Application:** [https://collab-todo-black.vercel.app](https://collab-todo-black.vercel.app)

*Demo Video: [Add your demo video link here]*

## 📋 Project Overview

This full-stack application provides a Trello-like kanban board experience with real-time collaboration features. Users can create, edit, and manage tasks across three columns (Todo, In Progress, Done) while seeing changes from other users instantly through WebSocket connections.

### Key Features
- **Real-time synchronization** across all connected users
- **Smart task assignment** algorithm
- **Conflict resolution** when multiple users edit the same task
- **Activity logging** with live updates
- **Drag-and-drop** task management
- **Mobile responsive** design
- **Custom animations** and styling

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **Socket.IO Client** - Real-time communication
- **React DnD** - Drag and drop functionality
- **Custom CSS** - No third-party UI frameworks

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📁 Project Structure

```
project-root/
├── frontend/collab-Todo/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── ActivityLog.jsx
│   │   │   ├── ActivityLog.css
│   │   │   ├── ConflictModal.jsx
│   │   │   ├── ConflictModal.css
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanBoard.css
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Auth.css
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskCard.css
│   │   │   ├── TaskModal.jsx
│   │   │   └── TaskModal.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── backend/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Action.js
    │   ├── Task.js
    │   └── user.js
    ├── controllers/
    │   ├── authController.js
    │   ├── taskController.js
    │   └── logController.js
    ├── middlewares/
    │   └── authenticate.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── index.js
    │   ├── logs.js
    │   └── taskRoutes.js
    ├── utils/
    │   └── Log.js
    ├── server.js
    ├── .env
    └── package.json
```

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd project-root/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend root:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend/collab-Todo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the frontend root:
   ```env
   VITE_API_URL=http://localhost:5000
   # For production: VITE_API_URL=https://collab-todo-ntiz.onrender.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Running Both Servers

For development, run both servers simultaneously:
```bash
# Terminal 1 (Backend)
cd backend && npm start

# Terminal 2 (Frontend)
cd frontend/collab-Todo && npm run dev
```

## 🎯 Features and Usage Guide

### Authentication
- **Register:** Create a new account with email and password
- **Login:** Secure JWT-based authentication
- **Auto-logout:** Session management with token expiration

### Task Management
- **Create Tasks:** Add new tasks with title, description, priority, and assignment
- **Edit Tasks:** Real-time editing with conflict detection
- **Drag & Drop:** Move tasks between columns (Todo, In Progress, Done)
- **Delete Tasks:** Remove tasks with confirmation

### Real-Time Collaboration
- **Live Updates:** See changes from other users instantly
- **User Presence:** Know who's online and active
- **Synchronized State:** All users see the same board state

### Activity Logging
- **Action Tracking:** Every create, edit, delete, and assignment is logged
- **Live Activity Feed:** Real-time updates in the activity panel
- **User Attribution:** See who performed each action and when

## 🧠 Unique Logic Implementation

### Smart Assign Algorithm

The Smart Assign feature automatically assigns tasks to the user with the fewest active tasks:

```javascript
 const taskId = req.params.id;

        // Get all users
        const users = await User.find({});

        // Count active tasks per user
        const userTaskCounts = await Task.aggregate([
            { $match: { status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $ne: null } } },
            { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
        ]);

        // Find user with fewest active tasks
        let minCount = Infinity;
        let selectedUser = null;

        for (const user of users) {
            const userCount = userTaskCounts.find(uc => uc._id.toString() === user._id.toString());
            const count = userCount ? userCount.count : 0;

            if (count < minCount) {
                minCount = count;
                selectedUser = user;
            }
        }

        if (!selectedUser) {
            return res.status(400).json({ message: 'No users available for assignment' });
        }

        // Update task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                assignedUser: selectedUser._id,
                updatedAt: new Date(),
                $inc: { version: 1 }
            },
            { new: true }
        ).populate('assignedUser', 'username').populate('createdBy', 'username');

        // Log action
        await logAction(req.user.userId, 'Smart assigned task', taskId, `Smart assigned to ${selectedUser.username}`);

        // Emit to all connected clients
        io.emit('smartAssignedTask', updatedTask);
```

**How it works:**
1. Counts active tasks (Todo + In Progress) for each user
2. Finds the user with the minimum count
3. Assigns the task to that user
4. Updates all connected clients in real-time

### Conflict Handling System

When two users edit the same task simultaneously:

```javascript
// Conflict detection and resolution
const handleConflictResolve = async (resolution, mergedData = null) => {
    try {
      const dataToSend = resolution === 'merge' ? mergedData : conflict.newData;
      
      const response = await fetch(`${apiurl}/api/tasks/${conflict.taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...dataToSend,
          version: conflict.currentTask.version
        })
      });

      if (response.ok) {
        setConflict(null);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }
```

**Resolution Options:**
- **Merge:** Combine changes from both users intelligently
- **Overwrite:** Choose one version over the other
- **Cancel:** Discard changes and keep original

### Validation Rules

- **Unique Titles:** Task titles must be unique within the board
- **Column Name Restriction:** Task titles cannot match column names ("Todo", "In Progress", "Done")
- **Required Fields:** Title and description are mandatory
- **Priority Levels:** Must be one of: Low, Medium, High, Critical

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop:** Full-featured experience with drag-and-drop
- **Tablet:** Optimized layout with touch-friendly interactions
- **Mobile:** Compact view with essential features

## 🎨 Custom Animations

### Implemented Animations
1. **Card Flip Animation:** Tasks flip when status changes
2. **Smooth Drag Transitions:** Fluid movement during drag operations
3. **Fade In/Out:** Smooth appearance/disappearance of elements
4. **Pulse Effects:** Activity indicators and notifications

### CSS Animation Example
```css
.task-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.3s;
  animation: cardAppear 0.3s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/users` - get Users
### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/smart-assign` - Smart assign task

### Logs
- `GET /api/actions` - Get last 20 actions

## 🧪 Testing

### Manual Testing Scenarios
1. **Multi-user Collaboration:** Open multiple browser tabs/windows
2. **Real-time Updates:** Make changes in one tab, verify in others
3. **Conflict Resolution:** Edit same task simultaneously
4. **Smart Assignment:** Test with users having different task loads
5. **Responsive Design:** Test on various screen sizes

### Test User Accounts
Create multiple test accounts to simulate collaborative scenarios:
```
User 1: ap410485@gmail.com / Amanwa
User 2: ap41485@gmail.com / Amanwa


## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables in deployment platform
2. Update CORS settings for production domain
3. Configure MongoDB Atlas connection
4. Set up SSL certificates

### Frontend Deployment (Netlify/Vercel)
1. Build the application: `npm run build`
2. Update API URL in environment variables
3. Configure redirects for SPA routing
4. Deploy dist folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- React DnD for drag-and-drop functionality
- MongoDB for flexible data storage
- The open-source community for inspiration and resources

---

**Built with ❤️ by [Aman Pandey]**

*For questions or support, please open an issue or contact [ap410485@gmail.com]*