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
let messageCount = 0;

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

    // Add some initial animations
    addWelcomeAnimation();
});

// Add welcome animation
function addWelcomeAnimation() {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            loginCard.style.transition = 'all 0.8s ease-out';
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Handle user login
function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    if (!username) return;
    
    currentUsername = username;
    
    // Add loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
    submitBtn.disabled = true;
    
    // Initialize Socket.IO connection
    socket = io();
    
    // Socket event listeners
    setupSocketListeners();
    
    // Join the chat
    socket.emit('user_join', username);
    
    // Switch to chat screen with animation
    setTimeout(() => {
        showChatScreen();
        
        // Add welcome message
        addMessage({
            username: 'System',
            message: `Welcome to the chat, ${username}! 🎉`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'system'
        });
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
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
        addUserJoinedAnimation();
    });
    
    // Handle user left
    socket.on('user_left', (data) => {
        addMessage(data);
        updateUserList();
        addUserLeftAnimation();
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
    
    // Add loading state to button
    const submitBtn = messageForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    // Send message through socket
    socket.emit('chat_message', { message });
    
    // Clear input
    messageInput.value = '';
    
    // Stop typing indicator
    socket.emit('typing', false);
    hideTypingIndicator();
    
    // Reset button after short delay
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.focus();
    }, 500);
    
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
    
    // Add fade in animation
    typingIndicator.style.opacity = '0';
    typingIndicator.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        typingIndicator.style.transition = 'all 0.3s ease';
        typingIndicator.style.opacity = '1';
        typingIndicator.style.transform = 'translateY(0)';
    }, 10);
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.transition = 'all 0.3s ease';
    typingIndicator.style.opacity = '0';
    typingIndicator.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        typingIndicator.innerHTML = '';
    }, 300);
}

// Add message to chat with enhanced animations
function addMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.username === currentUsername ? 'user-message' : 
                                   data.type === 'system' ? 'system-message' : 'other-message'}`;
    
    // Add message ID for animations
    messageDiv.id = `message-${++messageCount}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (data.type === 'system') {
        messageContent.innerHTML = `
            <div class="message-text">
                <i class="fas fa-info-circle"></i> ${escapeHtml(data.message)}
            </div>
        `;
    } else {
        messageContent.innerHTML = `
            <div class="message-info">
                <span class="message-username">
                    <i class="fas fa-user"></i> ${escapeHtml(data.username)}
                </span>
                <span class="message-timestamp">
                    <i class="fas fa-clock"></i> ${data.timestamp}
                </span>
            </div>
            <div class="message-text">${escapeHtml(data.message)}</div>
        `;
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Add entrance animation
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.5s ease-out';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 50);
    
    // Scroll to bottom with smooth animation
    scrollToBottom();
    
    // Add message highlight effect
    if (data.username === currentUsername) {
        messageDiv.style.animation = 'pulse 0.6s ease-out';
    }
}

// Update user list with animations
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

// Display users in sidebar with animations
function displayUsers(users) {
    userList.innerHTML = '';
    onlineUsersCount.textContent = users.length;
    
    users.forEach((username, index) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        userDiv.innerHTML = `
            <i class="fas fa-circle"></i>
            <span>${escapeHtml(username)}</span>
        `;
        
        // Add staggered animation
        userDiv.style.opacity = '0';
        userDiv.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            userDiv.style.transition = 'all 0.4s ease-out';
            userDiv.style.opacity = '1';
            userDiv.style.transform = 'translateX(0)';
        }, index * 100);
        
        userList.appendChild(userDiv);
    });
}

// Show chat screen with smooth transition
function showChatScreen() {
    loginScreen.style.opacity = '1';
    loginScreen.style.transform = 'scale(1)';
    
    // Fade out login screen
    loginScreen.style.transition = 'all 0.5s ease-out';
    loginScreen.style.opacity = '0';
    loginScreen.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        loginScreen.style.display = 'none';
        chatScreen.classList.remove('hidden');
        
        // Fade in chat screen
        chatScreen.style.opacity = '0';
        chatScreen.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            chatScreen.style.transition = 'all 0.6s ease-out';
            chatScreen.style.opacity = '1';
            chatScreen.style.transform = 'translateY(0)';
            messageInput.focus();
        }, 100);
    }, 500);
}

// Handle logout with animations
function handleLogout() {
    if (socket) {
        socket.disconnect();
    }
    
    // Add fade out animation
    chatScreen.style.transition = 'all 0.5s ease-out';
    chatScreen.style.opacity = '0';
    chatScreen.style.transform = 'translateY(-50px)';
    
    setTimeout(() => {
        // Reset state
        currentUsername = null;
        messagesContainer.innerHTML = '';
        userList.innerHTML = '';
        onlineUsersCount.textContent = '0';
        messageCount = 0;
        
        // Show login screen
        chatScreen.classList.add('hidden');
        loginScreen.style.display = 'block';
        loginScreen.style.opacity = '0';
        loginScreen.style.transform = 'scale(0.9)';
        
        // Fade in login screen
        setTimeout(() => {
            loginScreen.style.transition = 'all 0.5s ease-out';
            loginScreen.style.opacity = '1';
            loginScreen.style.transform = 'scale(1)';
            usernameInput.value = '';
            usernameInput.focus();
        }, 100);
    }, 500);
}

// Scroll to bottom of messages with smooth animation
function scrollToBottom() {
    const scrollHeight = messagesContainer.scrollHeight;
    const clientHeight = messagesContainer.clientHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    
    messagesContainer.scrollTo({
        top: maxScrollTop,
        behavior: 'smooth'
    });
}

// Add user joined animation
function addUserJoinedAnimation() {
    const userCount = document.getElementById('onlineUsers');
    userCount.style.animation = 'pulse 0.6s ease-out';
    
    setTimeout(() => {
        userCount.style.animation = '';
    }, 600);
}

// Add user left animation
function addUserLeftAnimation() {
    const userCount = document.getElementById('onlineUsers');
    userCount.style.animation = 'pulse 0.6s ease-out';
    
    setTimeout(() => {
        userCount.style.animation = '';
    }, 600);
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

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && messageInput === document.activeElement) {
        e.preventDefault();
        handleMessageSubmit(e);
    }
    
    // Escape to logout
    if (e.key === 'Escape' && currentUsername) {
        handleLogout();
    }
});

// Add smooth hover effects for interactive elements
document.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('btn') || e.target.classList.contains('user-item')) {
        e.target.style.transition = 'all 0.3s ease';
    }
});

// Add loading states for better UX
function showLoading(element, text = 'Loading...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    element.disabled = true;
    return originalContent;
}

function hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
    element.disabled = false;
}
