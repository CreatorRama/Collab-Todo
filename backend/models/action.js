
import mongoose from "mongoose";

const actionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});



export const ActionLog = mongoose.model('ActionLog', actionSchema);