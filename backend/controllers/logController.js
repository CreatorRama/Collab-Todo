import { ActionLog } from "../models/action.js";

export const actionLogs=async (req, res) => {
  try {
    const actions = await ActionLog.find({})
      .populate('userId', 'username')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .limit(20);
    console.log(actions);
    res.json(actions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}