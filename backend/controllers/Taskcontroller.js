import { Task } from '../models/Task.js'
import { User } from '../models/user.js';
import { io } from '../server.js'
import { logAction } from '../utils/Log.js'
export const createTask = async (req, res) => {
    try {
        const { title, description, assignedUser, priority } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Check for unique title
        const existingTask = await Task.findOne({ title: title.trim() });
        if (existingTask) {
            return res.status(400).json({ message: 'Task title must be unique' });
        }

        // Check if title matches column names
        const columnNames = ['Todo', 'In Progress', 'Done'];
        if (columnNames.includes(title.trim())) {
            return res.status(400).json({ message: 'Task title cannot match column names' });
        }

        const task = new Task({
            title: title.trim(),
            description: description || '',
            assignedUser: assignedUser || null,
            priority: priority || 'Medium',
            createdBy: req.user.userId
        });

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('assignedUser', 'username')
            .populate('createdBy', 'username');

        // Log action
        await logAction(req.user.userId, 'Created task', task._id, `Created task: ${title}`);

        // Emit to all connected clients
        io.emit('taskCreated', populatedTask);
        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getAllTasks = async (req, res) => {
    try {
        // Get query parameters for filtering/sorting
        const { status, assignedUser, priority, sortBy, sortOrder } = req.query;

        // Build the query object
        const query = {};

        if (status) {
            query.status = status;
        }

        if (assignedUser) {
            query.assignedUser = assignedUser;
        }

        if (priority) {
            query.priority = priority;
        }

        // Build the sort object
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default sort by createdAt descending
            sortOptions.createdAt = -1;
        }

        // Get all tasks with optional filtering and sorting
        const tasks = await Task.find(query)
            .sort(sortOptions)
            .populate('assignedUser', 'username')
            .populate('createdBy', 'username');

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: 'Server error while fetching tasks',
            error: error.message
        });
    }
}

export const updateTask = async (req, res) => {
    try {
        const { title, description, assignedUser, status, priority, version } = req.body;
        const taskId = req.params.id;
        console.log(taskId, title, description, assignedUser, status, priority, version);

        // Find current task
        const currentTask = await Task.findById(taskId).populate('assignedUser', 'username').populate('createdBy', 'username')
        if (!currentTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check for version conflict
        if (version && currentTask.version !== version) {
            return res.status(409).json({
                message: 'Conflict detected',
                currentTask,
                conflict: true
            });
        }

        // Validation
        if (title && title.trim() !== currentTask.title) {
            const existingTask = await Task.findOne({ title: title.trim(), _id: { $ne: taskId } });
            if (existingTask) {
                return res.status(400).json({ message: 'Task title must be unique' });
            }

            const columnNames = ['Todo', 'In Progress', 'Done'];
            if (status && !columnNames.includes(status.trim())) {
                return res.status(400).json({ message: 'Task title cannot match column names' });
            }
        }

        // Update task
        const updateData = {
            updatedAt: new Date(),
            version: currentTask.version + 1
        };

        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (assignedUser !== undefined && assignedUser.length > 0) updateData.assignedUser = assignedUser;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        console.log("ram1", updateData);
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true }
        ).populate('assignedUser', 'username').populate('createdBy', 'username');
        console.log(updateTask);
        // Log action
        const changes = [];
        if (title !== undefined && title !== currentTask.title) changes.push(`title to "${title}"`);
        if (status !== undefined && status !== currentTask.status) changes.push(`status to "${status}"`);
        if (priority !== undefined && priority!==currentTask.priority) changes.push(`priority to ${priority}`); 
        if (assignedUser !== undefined && assignedUser !== currentTask.assignedUser?.toString()) {
            const newUser = assignedUser ? await User.findById(assignedUser) : null;
            changes.push(`assigned to ${newUser ? newUser.username : 'unassigned'}`);
        }
         
        await logAction(req.user.userId, 'Updated task', taskId, `Updated ${changes.join(', ')}`);

        // Emit to all connected clients
        io.emit('taskUpdated', updatedTask);

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await Task.findByIdAndDelete(taskId);

        // Log action
        await logAction(req.user.userId, 'Deleted task', taskId, `Deleted task: ${task.title}`);

        // Emit to all connected clients
        io.emit('taskDeleted', { _id: taskId });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const smartAssignTask = async (req, res) => {
    try {
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

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
