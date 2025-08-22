// DEMO VERSION - Works without backend server
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
let currentUsername;
let typingTimeout;
let messageCount = 0;
let demoUsers = [];
let demoMessages = [];

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
    
    // Add demo users
    addDemoUsers();
});

// Add demo users
function addDemoUsers() {
    demoUsers = [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve'
    ];
}

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
    
    // Simulate connection delay
    setTimeout(() => {
        // Add user to demo users if not already there
        if (!demoUsers.includes(username)) {
            demoUsers.push(username);
        }
        
        // Switch to chat screen with animation
        showChatScreen();
        
        // Add welcome message
        addMessage({
            username: 'System',
            message: `Welcome to the chat, ${username}! 🎉`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'system'
        });
        
        // Add some demo messages
        addDemoMessages();
        
        // Update user list
        updateUserList();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1000);
}

// Add demo messages
function addDemoMessages() {
    const demoMessagesData = [
        {
            username: 'Alice',
            message: 'Hey everyone! 👋',
            timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
        },
        {
            username: 'Bob',
            message: 'Hi Alice! How are you doing?',
            timestamp: new Date(Date.now() - 240000).toLocaleTimeString()
        },
        {
            username: 'Charlie',
            message: 'Great to see you all here! 😊',
            timestamp: new Date(Date.now() - 180000).toLocaleTimeString()
        },
        {
            username: 'Diana',
            message: 'This is a demo chat app. Try sending a message!',
            timestamp: new Date(Date.now() - 120000).toLocaleTimeString()
        }
    ];
    
    demoMessagesData.forEach((msg, index) => {
        setTimeout(() => {
            addMessage(msg);
        }, index * 500);
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
    
    // Add message to demo messages
    const newMessage = {
        username: currentUsername,
        message: message,
        timestamp: new Date().toLocaleTimeString()
    };
    
    demoMessages.push(newMessage);
    
    // Add message to chat
    addMessage(newMessage);
    
    // Clear input
    messageInput.value = '';
    
    // Stop typing indicator
    hideTypingIndicator();
    
    // Reset button after short delay
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.focus();
    }, 500);
    
    // Focus back to input
    messageInput.focus();
    
    // Simulate other users typing and responding
    simulateOtherUsersResponse(message);
}

// Simulate other users responding
function simulateOtherUsersResponse(userMessage) {
    const responses = [
        'That\'s interesting! 🤔',
        'I agree with you! 👍',
        'Thanks for sharing! 😊',
        'Great point! 💡',
        'I see what you mean! 👀'
    ];
    
    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;
    
    setTimeout(() => {
        // Show typing indicator
        const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
        if (randomUser !== currentUsername) {
            showTypingIndicator(randomUser);
            
            // Hide typing indicator after 2 seconds and show response
            setTimeout(() => {
                hideTypingIndicator();
                
                const response = {
                    username: randomUser,
                    message: responses[Math.floor(Math.random() * responses.length)],
                    timestamp: new Date().toLocaleTimeString()
                };
                
                addMessage(response);
                demoMessages.push(response);
            }, 2000);
        }
    }, delay);
}

// Handle typing indicator
function handleTyping() {
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    // Show typing indicator for current user
    showTypingIndicator(currentUsername);
    
    typingTimeout = setTimeout(() => {
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
function updateUserList() {
    displayUsers(demoUsers);
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
        demoMessages = [];
        
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
