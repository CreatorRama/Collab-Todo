import React, { useState } from 'react';
import './ConflictModal.css';

const ConflictModal = ({ conflict, onResolve, onClose }) => {
  const [resolution, setResolution] = useState('current');
  const [mergedData, setMergedData] = useState({
    title: conflict.currentTask.title,
    description: conflict.currentTask.description,
    assignedUser: conflict.currentTask.assignedUser?._id || '',
    priority: conflict.currentTask.priority
  });

  const handleMergedDataChange = (field, value) => {
    setMergedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResolve = () => {
    if (resolution === 'merge') {
      onResolve('merge', mergedData);
    } else if (resolution === 'new') {
      onResolve('overwrite', conflict.newData);
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="conflict-modal">
        <div className="modal-header">
          <h2>⚠️ Conflict Detected</h2>
          <p>Another user has modified this task. Please resolve the conflict:</p>
        </div>

        <div className="conflict-content">
          <div className="conflict-options">
            <label>
              <input
                type="radio"
                name="resolution"
                value="current"
                checked={resolution === 'current'}
                onChange={(e) => setResolution(e.target.value)}
              />
              Keep current version (discard your changes)
            </label>
            
            <label>
              <input
                type="radio"
                name="resolution"
                value="new"
                checked={resolution === 'new'}
                onChange={(e) => setResolution(e.target.value)}
              />
              Use your version (overwrite current)
            </label>
            
            <label>
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={resolution === 'merge'}
                onChange={(e) => setResolution(e.target.value)}
              />
              Merge changes manually
            </label>
          </div>

          <div className="conflict-comparison">
            <div className="version-column">
              <h3>Current Version</h3>
              <div className="version-details">
                <p><strong>Title:</strong> {conflict.currentTask.title}</p>
                <p><strong>Description:</strong> {conflict.currentTask.description}</p>
                <p><strong>Assigned:</strong> {conflict.currentTask.assignedUser?.username || 'Unassigned'}</p>
                <p><strong>Priority:</strong> {conflict.currentTask.priority}</p>
              </div>
            </div>

            <div className="version-column">
              <h3>Your Version</h3>
              <div className="version-details">
                <p><strong>Title:</strong> {conflict.newData.title}</p>
                <p><strong>Description:</strong> {conflict.newData.description}</p>
                <p><strong>Assigned:</strong> {conflict.newData.assignedUser || 'Unassigned'}</p>
                <p><strong>Priority:</strong> {conflict.newData.priority}</p>
              </div>
            </div>
          </div>

          {resolution === 'merge' && (
            <div className="merge-editor">
              <h3>Merged Version</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={mergedData.title}
                  onChange={(e) => handleMergedDataChange('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={mergedData.description}
                  onChange={(e) => handleMergedDataChange('description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={mergedData.priority}
                  onChange={(e) => handleMergedDataChange('priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleResolve} className="resolve-btn">
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConflictModal);
