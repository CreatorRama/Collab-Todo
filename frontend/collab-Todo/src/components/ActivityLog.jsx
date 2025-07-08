import React from 'react';
import './ActivityLog.css';

const ActivityLog = ({ activities }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'Created task': return '➕';
      case 'Updated task': return '✏️';
      case 'Deleted task': return '🗑️';
      case 'Smart assigned task': return '🤖';
      default: return '📝';
    }
  };

  return (
    <div className="activity-log">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.length === 0 ? (
          <p className="no-activity">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-icon">
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>{activity.userId.username}</strong> {activity.action.toLowerCase()}
                  {activity.taskId && (
                    <span className="task-link"> "{activity.taskId.title}"</span>
                  )}
                </div>
                {activity.details && (
                  <div className="activity-details">{activity.details}</div>
                )}
                <div className="activity-time">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(ActivityLog);