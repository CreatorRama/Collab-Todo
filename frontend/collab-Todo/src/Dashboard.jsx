import  { useState, useEffect } from 'react';
import KanbanBoard from './KanbanBoard';
import ActivityLog from './ActivityLog';
import TaskModal from './TaskModal';
import ConflictModal from './ConflictModal';
import './Dashboard.css';

const Dashboard = ({ user, token, socket, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('taskCreated', (task) => {
        setTasks(prev => [task, ...prev]);
      });

      socket.on('taskUpdated', (task) => {
        setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      });

      socket.on('taskDeleted', (deletedTask) => {
        setTasks(prev => prev.filter(t => t._id !== deletedTask._id));
      });

      socket.on('actionLogged', (action) => {
        setActivities(prev => [action, ...prev.slice(0, 19)]);
      });
      socket.on('smartAssignedTask', (task) => {
        console.log(task);
        setTasks(prev => [task, ...prev]);
      });

      return () => {
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
        socket.off('actionLogged');
        socket.off('smartAssignedTask');
      };
    }
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/actions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setShowTaskModal(false);
      fetchTasks()
    } catch (error) {
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();
      
      if (response.status === 409) {
        setConflict({
          taskId,
          currentTask: data.currentTask,
          newData: taskData
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message);
      }

      setEditingTask(null);
      fetchTasks()
      return data;
    } catch (error) {
     throw error
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const smartAssign = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/smart-assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to smart assign task');
      }
    } catch (error) {
      console.error('Error smart assigning task:', error);
    }
  };

  const handleConflictResolve = async (resolution, mergedData = null) => {
    try {
      const dataToSend = resolution === 'merge' ? mergedData : conflict.newData;
      
      const response = await fetch(`http://localhost:5000/api/tasks/${conflict.taskId}`, {
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Collaborative To-Do Board</h1>
        <div className="header-actions">
          <span>Welcome, {user?.username}!</span>
          <button onClick={() => setShowActivityLog(!showActivityLog)}>
            {showActivityLog ? 'Hide' : 'Show'} Activity Log
          </button>
          <button onClick={() => setShowTaskModal(true)}>Add Task</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className={`main-content ${showActivityLog ? 'with-sidebar' : ''}`}>
          <KanbanBoard 
            tasks={tasks}
            users={users}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onEditTask={setEditingTask}
            onSmartAssign={smartAssign}
          />
        </div>
        
        {showActivityLog && (
          <div className="sidebar">
            <ActivityLog activities={activities} />
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          users={users}
          currentuser={user}
          onSubmit={createTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          task={editingTask}
          currentuser={user}
          users={users}
          onSubmit={(data) => updateTask(editingTask._id, { ...data, version: editingTask.version })}
          onClose={() => setEditingTask(null)}
        />
      )}

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={handleConflictResolve}
          onClose={() => setConflict(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;