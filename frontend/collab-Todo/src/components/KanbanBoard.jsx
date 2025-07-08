import React,{ useState } from 'react';
import { motion } from 'framer-motion'; 
import TaskCard from './TaskCard';
import './KanbanBoard.css';
import { useCallback } from 'react';

const KanbanBoard = ({ tasks, users, onUpdateTask, onDeleteTask, onEditTask, onSmartAssign }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  const columns = ['Todo', 'In Progress', 'Done'];

  const getTasksByStatus = useCallback((status) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setDraggedOver(status);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDraggedOver(null);
    }
  };

  const handleDrop = useCallback((e, status) => {
    e.preventDefault();
    setDraggedOver(null);

    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask(draggedTask._id, {
        status,
        version: draggedTask.version
      });
    }
    setDraggedTask(null);
  }, [draggedTask, onUpdateTask]);

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <motion.div 
          key={column}
          className={`kanban-column ${draggedOver === column ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, column)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column)}
          layout 
          transition={{ type: "spring", damping: 20, stiffness: 200 }} 
        >
          <div className="column-header">
            <h3>{column}</h3>
            <span className="task-count">{getTasksByStatus(column).length}</span>
          </div>
          <motion.div 
            className="column-content"
            layout 
          >
            {getTasksByStatus(column).map(task => (
              <TaskCard
                key={task._id}
                task={task}
                users={users}
                onDragStart={handleDragStart}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onSmartAssign={onSmartAssign}
              />
            ))}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default React.memo(KanbanBoard)