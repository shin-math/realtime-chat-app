const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('user_join', (username) => {
    users.set(socket.id, username);
    socket.username = username;
    
    // Broadcast user joined
    io.emit('user_joined', {
      username: username,
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    });

    // Send updated user list
    io.emit('user_list', Array.from(users.values()));
    
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('chat_message', (data) => {
    const message = {
      username: socket.username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user'
    };
    
    io.emit('chat_message', message);
    console.log(`Message from ${socket.username}: ${data.message}`);
  });

  // Handle typing indicators
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', {
      username: socket.username,
      isTyping: isTyping
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.id);
      
      // Broadcast user left
      io.emit('user_left', {
        username: socket.username,
        message: `${socket.username} left the chat`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
      });

      // Send updated user list
      io.emit('user_list', Array.from(users.values()));
      
      console.log(`${socket.username} left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get online users
app.get('/api/users', (req, res) => {
  res.json(Array.from(users.values()));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Chat server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
});
