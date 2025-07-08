import { ActionLog } from "../models/action.js";
import { io } from "../server.js";

export const logAction = async (userId, action, taskId = null, details = '') => {
  try {
    const actionLog = new ActionLog({
      userId,
      action,
      taskId,
      details
    });
    await actionLog.save();
    
    // Emit to all connected clients
    const populatedLog = await ActionLog.findById(actionLog._id)
      .populate('userId', 'username')
      .populate('taskId', 'title');
    
    // io.emit('actionLogged', populatedLog);
  } catch (error) {
    console.error('Error logging action:', error);
  }
};