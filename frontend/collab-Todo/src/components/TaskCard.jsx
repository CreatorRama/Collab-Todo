import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onDragStart, onEdit, onDelete, onSmartAssign }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4757';
      case 'Medium': return '#ffa502';
      case 'Low': return '#2ed573';
      default: return '#57606f';
    }
  };

  const getAssignedUserName = () => {
    if (task.assignedUser) {
      return task.assignedUser.username;
    }
    return 'Unassigned';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-menu">
          <button 
            className="menu-trigger"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⋮
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={() => {
                onEdit(task);
                setShowMenu(false);
              }}>Edit</button>
              <button onClick={() => {
                onSmartAssign(task._id);
                setShowMenu(false);
              }}>Smart Assign</button>
              <button 
                className="delete-btn"
                onClick={() => {
                  onDelete(task._id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      <div className="task-meta">
        <span 
          className="task-priority"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
        <span className="task-assigned">
          👤 {getAssignedUserName()}
        </span>
      </div>
      
      <div className="task-footer">
        <small className="task-created">
          Created: {formatDate(task.createdAt)}
        </small>
        {task.updatedAt !== task.createdAt && (
          <small className="task-updated">
            Updated: {formatDate(task.updatedAt)}
          </small>
        )}
      </div>
    </div>
  );
};

export default React.memo(TaskCard);