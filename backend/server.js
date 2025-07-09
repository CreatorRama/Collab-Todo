
import  express from 'express'
import  cors from 'cors'
import  http from 'http'
import  {Server} from 'socket.io'
import  rateLimit from 'express-rate-limit'
import {Routes} from './routes/index.js'
import connectToDatabase from './config/db.js'
const {TaskRoutes,authroutes,logRoutes} =Routes

const app = express();
connectToDatabase()
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","http://192.168.57.161:5173","https://collab-todo-black.vercel.app"],
    methods: ["GET", "POST"]
  }
});
// Middleware
app.use(cors({
  origin:["http://192.168.57.161:5173","http://localhost:5173","https://collab-todo-black.vercel.app"]
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200 
});
app.use(limiter);

app.use('/api',authroutes)
app.use('/api',logRoutes)
app.use('/api',TaskRoutes)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});