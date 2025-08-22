// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const messagesContainer = document.getElementById('messagesContainer');
const userList = document.getElementById('userList');
const onlineUsersCount = document.getElementById('onlineUsers');
const logoutBtn = document.getElementById('logoutBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Global variables
let socket;
let currentUsername;
let typingTimeout;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Focus on username input
    usernameInput.focus();
    
    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    messageForm.addEventListener('submit', handleMessageSubmit);
    messageInput.addEventListener('input', handleTyping);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Enter key support for message input
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleMessageSubmit(e);
        }
    });
});

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    if (!username) return;
    
    currentUsername = username;
    
    // Initialize Socket.IO connection
    socket = io();
    
    // Socket event listeners
    setupSocketListeners();
    
    // Join the chat
    socket.emit('user_join', username);
    
    // Switch to chat screen
    showChatScreen();
    
    // Add welcome message
    addMessage({
        username: 'System',
        message: `Welcome to the chat, ${username}!`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'system'
    });
}

// Setup Socket.IO event listeners
function setupSocketListeners() {
    // Handle incoming messages
    socket.on('chat_message', (data) => {
        addMessage(data);
    });
    
    // Handle user joined
    socket.on('user_joined', (data) => {
        addMessage(data);
        updateUserList();
    });
    
    // Handle user left
    socket.on('user_left', (data) => {
        addMessage(data);
        updateUserList();
    });
    
    // Handle user list updates
    socket.on('user_list', (users) => {
        updateUserList(users);
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
        if (data.username !== currentUsername) {
            showTypingIndicator(data.username);
        }
    });
}

// Handle message submission
function handleMessageSubmit(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Send message through socket
    socket.emit('chat_message', { message });
    
    // Clear input
    messageInput.value = '';
    
    // Stop typing indicator
    socket.emit('typing', false);
    hideTypingIndicator();
    
    // Focus back to input
    messageInput.focus();
}

// Handle typing indicator
function handleTyping() {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    socket.emit('typing', true);
    
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
        hideTypingIndicator();
    }, 1000);
}

// Show typing indicator
function showTypingIndicator(username) {
    typingIndicator.innerHTML = `
        <div class="typing">
            <span>${username} is typing</span>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.innerHTML = '';
}

// Add message to chat
function addMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.username === currentUsername ? 'user-message' : 
                                   data.type === 'system' ? 'system-message' : 'other-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (data.type === 'system') {
        messageContent.textContent = data.message;
    } else {
        messageContent.innerHTML = `
            <div class="message-info">
                <span class="message-username">${data.username}</span>
                <span class="message-timestamp">${data.timestamp}</span>
            </div>
            <div class="message-text">${escapeHtml(data.message)}</div>
        `;
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
}

// Update user list
function updateUserList(users = null) {
    if (!users) {
        // Fetch users from server if not provided
        fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                displayUsers(users);
            })
            .catch(error => console.error('Error fetching users:', error));
    } else {
        displayUsers(users);
    }
}

// Display users in sidebar
function displayUsers(users) {
    userList.innerHTML = '';
    onlineUsersCount.textContent = users.length;
    
    users.forEach(username => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${escapeHtml(username)}</span>
        `;
        userList.appendChild(userDiv);
    });
}

// Show chat screen
function showChatScreen() {
    loginScreen.style.display = 'none';
    chatScreen.classList.remove('hidden');
    messageInput.focus();
}

// Handle logout
function handleLogout() {
    if (socket) {
        socket.disconnect();
    }
    
    // Reset state
    currentUsername = null;
    messagesContainer.innerHTML = '';
    userList.innerHTML = '';
    onlineUsersCount.textContent = '0';
    
    // Show login screen
    chatScreen.classList.add('hidden');
    loginScreen.style.display = 'block';
    usernameInput.value = '';
    usernameInput.focus();
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-scroll to bottom when new messages arrive
const observer = new MutationObserver(() => {
    scrollToBottom();
});

observer.observe(messagesContainer, {
    childList: true,
    subtree: true
});

// Handle page visibility change to maintain connection
document.addEventListener('visibilitychange', () => {
    if (document.hidden && socket) {
        // Page is hidden, could implement connection management here
    } else if (!document.hidden && socket) {
        // Page is visible again
        socket.connect();
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
    if (socket) {
        socket.disconnect();
    }
});
