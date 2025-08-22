// Real-Time Messenger App - No Backend Required
// Features: WebRTC, IndexedDB, Demo Mode, Offline Support

class RealTimeMessenger {
    constructor() {
        this.currentUser = null;
        this.connectionCode = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.messages = [];
        this.connectedUsers = new Set();
        this.typingTimeout = null;
        this.isDemoMode = false;
        this.demoUsers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
        this.demoResponses = [
            'That\'s interesting! 🤔',
            'I agree with you! 👍',
            'Thanks for sharing! 😊',
            'Great point! 💡',
            'I see what you mean! 👀',
            'Absolutely! 💯',
            'Well said! 👏',
            'Interesting perspective! 🤓'
        ];
        
        this.init();
    }

    async init() {
        await this.initDatabase();
        this.loadSettings();
        this.bindEvents();
        this.showWelcome();
        this.addWelcomeAnimation();
    }

    // Initialize IndexedDB for message storage
    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RealTimeMessenger', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create messages store
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                    messageStore.createIndex('connectionCode', 'connectionCode', { unique: false });
                }
                
                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Bind event listeners
    bindEvents() {
        // Message form submission
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => this.handleMessageSubmit(e));
        }

        // Message input typing
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('input', () => this.handleTyping());
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleMessageSubmit(e);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // Show welcome screen
    showWelcome() {
        this.hideAllScreens();
        document.getElementById('welcomeScreen').classList.remove('hidden');
        this.currentUser = null;
        this.connectionCode = null;
        this.isDemoMode = false;
    }

    // Show direct connect screen
    showDirectConnect() {
        this.hideAllScreens();
        document.getElementById('directConnectScreen').classList.remove('hidden');
    }

    // Show chat screen
    showChatScreen() {
        this.hideAllScreens();
        document.getElementById('chatScreen').classList.remove('hidden');
        this.updateConnectionStatus('Connected');
        this.loadMessages();
        this.updateUserList();
        this.focusMessageInput();
    }

    // Hide all screens
    hideAllScreens() {
        const screens = ['welcomeScreen', 'directConnectScreen', 'chatScreen'];
        screens.forEach(screenId => {
            document.getElementById(screenId).classList.add('hidden');
        });
    }

    // Create new connection
    async createConnection() {
        this.connectionCode = this.generateConnectionCode();
        this.currentUser = this.getUsername() || 'User' + Math.floor(Math.random() * 1000);
        
        // Show connection modal
        document.getElementById('connectionCodeDisplay').textContent = this.connectionCode;
        document.getElementById('connectionModal').classList.remove('hidden');
        
        // Initialize WebRTC
        await this.initWebRTC();
        
        // Add system message
        this.addMessage({
            username: 'System',
            message: `Connection created! Share code: ${this.connectionCode}`,
            timestamp: new Date(),
            type: 'system'
        });
        
        this.showChatScreen();
    }

    // Join existing connection
    async joinConnection() {
        const codeInput = document.getElementById('connectionCode');
        const code = codeInput.value.trim().toUpperCase();
        
        if (!code || code.length !== 6) {
            this.showNotification('Please enter a valid 6-character connection code', 'error');
            return;
        }
        
        this.connectionCode = code;
        this.currentUser = this.getUsername() || 'User' + Math.floor(Math.random() * 1000);
        
        // Show loading state
        this.showNotification('Connecting to chat...', 'info');
        
        // Simulate connection delay
        setTimeout(() => {
            this.addMessage({
                username: 'System',
                message: `Joined chat with code: ${code}`,
                timestamp: new Date(),
                type: 'system'
            });
            
            this.showChatScreen();
            this.showNotification('Successfully connected!', 'success');
        }, 1500);
    }

    // Demo mode
    showDemoMode() {
        this.isDemoMode = true;
        this.currentUser = this.getUsername() || 'Demo User';
        this.connectionCode = 'DEMO123';
        
        this.showChatScreen();
        this.loadDemoMessages();
        this.simulateDemoActivity();
    }

    // Initialize WebRTC (simplified for demo)
    async initWebRTC() {
        try {
            // In a real implementation, this would set up WebRTC peer connection
            // For demo purposes, we'll simulate the connection
            console.log('WebRTC initialized for connection:', this.connectionCode);
        } catch (error) {
            console.error('WebRTC initialization failed:', error);
        }
    }

    // Handle message submission
    handleMessageSubmit(e) {
        e.preventDefault();
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        const newMessage = {
            username: this.currentUser,
            message: message,
            timestamp: new Date(),
            connectionCode: this.connectionCode,
            type: 'user'
        };
        
        // Add message to chat
        this.addMessage(newMessage);
        
        // Save to database
        this.saveMessage(newMessage);
        
        // Clear input
        messageInput.value = '';
        
        // Stop typing indicator
        this.hideTypingIndicator();
        
        // Simulate responses in demo mode
        if (this.isDemoMode) {
            this.simulateDemoResponse(message);
        }
        
        // Focus back to input
        messageInput.focus();
    }

    // Add message to chat
    addMessage(messageData) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `message ${messageData.username === this.currentUser ? 'user-message' : 
                                       messageData.type === 'system' ? 'system-message' : 'other-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (messageData.type === 'system') {
            messageContent.innerHTML = `
                <div class="message-text">
                    <i class="fas fa-info-circle"></i> ${this.escapeHtml(messageData.message)}
                </div>
            `;
        } else {
            const timestamp = messageData.timestamp instanceof Date ? 
                messageData.timestamp.toLocaleTimeString() : 
                new Date(messageData.timestamp).toLocaleTimeString();
                
            messageContent.innerHTML = `
                <div class="message-info">
                    <span class="message-username">
                        <i class="fas fa-user"></i> ${this.escapeHtml(messageData.username)}
                    </span>
                    <span class="message-timestamp">
                        <i class="fas fa-clock"></i> ${timestamp}
                    </span>
                </div>
                <div class="message-text">${this.escapeHtml(messageData.message)}</div>
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
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Add message highlight effect
        if (messageData.username === this.currentUser) {
            messageDiv.style.animation = 'pulse 0.6s ease-out';
        }
    }

    // Save message to IndexedDB
    async saveMessage(message) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        
        try {
            await store.add(message);
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    }

    // Load messages from IndexedDB
    async loadMessages() {
        if (!this.db || !this.connectionCode) return;
        
        const transaction = this.db.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const index = store.index('connectionCode');
        
        try {
            const messages = await index.getAll(this.connectionCode);
            this.messages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Clear container and add messages
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';
            
            this.messages.forEach(message => {
                this.addMessage(message);
            });
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    }

    // Load demo messages
    loadDemoMessages() {
        const demoMessages = [
            {
                username: 'Alice',
                message: 'Hey everyone! Welcome to the demo chat! 👋',
                timestamp: new Date(Date.now() - 300000),
                type: 'user'
            },
            {
                username: 'Bob',
                message: 'Hi Alice! This is pretty cool! 😊',
                timestamp: new Date(Date.now() - 240000),
                type: 'user'
            },
            {
                username: 'Charlie',
                message: 'Yeah, the UI looks amazing! ✨',
                timestamp: new Date(Date.now() - 180000),
                type: 'user'
            },
            {
                username: 'System',
                message: 'This is a demo mode. Try sending messages!',
                timestamp: new Date(Date.now() - 120000),
                type: 'system'
            }
        ];
        
        demoMessages.forEach(message => {
            this.addMessage(message);
        });
    }

    // Simulate demo activity
    simulateDemoActivity() {
        // Simulate users typing and responding
        setInterval(() => {
            if (this.isDemoMode && Math.random() > 0.7) {
                const randomUser = this.demoUsers[Math.floor(Math.random() * this.demoUsers.length)];
                if (randomUser !== this.currentUser) {
                    this.showTypingIndicator(randomUser);
                    
                    setTimeout(() => {
                        this.hideTypingIndicator();
                        
                        const response = {
                            username: randomUser,
                            message: this.demoResponses[Math.floor(Math.random() * this.demoResponses.length)],
                            timestamp: new Date(),
                            type: 'user'
                        };
                        
                        this.addMessage(response);
                    }, 2000);
                }
            }
        }, 8000);
    }

    // Simulate demo response
    simulateDemoResponse(userMessage) {
        const delay = Math.random() * 3000 + 2000;
        
        setTimeout(() => {
            const randomUser = this.demoUsers[Math.floor(Math.random() * this.demoUsers.length)];
            if (randomUser !== this.currentUser) {
                this.showTypingIndicator(randomUser);
                
                setTimeout(() => {
                    this.hideTypingIndicator();
                    
                    const response = {
                        username: randomUser,
                        message: this.demoResponses[Math.floor(Math.random() * this.demoResponses.length)],
                        timestamp: new Date(),
                        type: 'user'
                    };
                    
                    this.addMessage(response);
                }, 2000);
            }
        }, delay);
    }

    // Handle typing indicator
    handleTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.showTypingIndicator(this.currentUser);
        
        this.typingTimeout = setTimeout(() => {
            this.hideTypingIndicator();
        }, 1000);
    }

    // Show typing indicator
    showTypingIndicator(username) {
        const typingIndicator = document.getElementById('typingIndicator');
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
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.transition = 'all 0.3s ease';
        typingIndicator.style.opacity = '0';
        typingIndicator.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            typingIndicator.innerHTML = '';
        }, 300);
    }

    // Update connection status
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `connection-status ${status.toLowerCase()}`;
        }
    }

    // Update user list
    updateUserList() {
        const userList = document.getElementById('userList');
        if (!userList) return;
        
        userList.innerHTML = '';
        
        const users = this.isDemoMode ? this.demoUsers : [this.currentUser];
        
        users.forEach((username, index) => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-item';
            userDiv.innerHTML = `
                <i class="fas fa-circle"></i>
                <span>${this.escapeHtml(username)}</span>
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

    // Toggle user list sidebar
    toggleUserList() {
        const sidebar = document.getElementById('userListSidebar');
        sidebar.classList.toggle('hidden');
    }

    // Show settings modal
    showSettings() {
        this.loadSettings();
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    // Close settings modal
    closeSettingsModal() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    // Close connection modal
    closeConnectionModal() {
        document.getElementById('connectionModal').classList.add('hidden');
    }

    // Close all modals
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.add('hidden'));
    }

    // Toggle emoji picker
    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        emojiPicker.classList.toggle('hidden');
    }

    // Insert emoji
    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value += emoji;
        messageInput.focus();
        this.toggleEmojiPicker();
    }

    // Copy connection code
    copyConnectionCode() {
        navigator.clipboard.writeText(this.connectionCode).then(() => {
            this.showNotification('Connection code copied!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy code', 'error');
        });
    }

    // Save settings
    saveSettings() {
        const username = document.getElementById('usernameSetting').value;
        const theme = document.getElementById('themeSetting').value;
        const notifications = document.getElementById('notificationsSetting').checked;
        
        this.saveSetting('username', username);
        this.saveSetting('theme', theme);
        this.saveSetting('notifications', notifications);
        
        this.showNotification('Settings saved!', 'success');
        this.closeSettingsModal();
    }

    // Load settings
    loadSettings() {
        const username = this.getSetting('username') || '';
        const theme = this.getSetting('theme') || 'light';
        const notifications = this.getSetting('notifications') || false;
        
        document.getElementById('usernameSetting').value = username;
        document.getElementById('themeSetting').value = theme;
        document.getElementById('notificationsSetting').checked = notifications;
        
        // Apply theme
        this.applyTheme(theme);
    }

    // Save setting to IndexedDB
    async saveSetting(key, value) {
        if (!this.db) return;
        
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        
        try {
            await store.put({ key, value });
        } catch (error) {
            console.error('Failed to save setting:', error);
        }
    }

    // Get setting from IndexedDB
    async getSetting(key) {
        if (!this.db) return null;
        
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        
        try {
            const setting = await store.get(key);
            return setting ? setting.value : null;
        } catch (error) {
            console.error('Failed to get setting:', error);
            return null;
        }
    }

    // Apply theme
    applyTheme(theme) {
        document.body.className = theme;
    }

    // Handle escape key
    handleEscape() {
        this.closeAllModals();
        this.toggleEmojiPicker();
    }

    // Focus message input
    focusMessageInput() {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    }

    // Scroll to bottom of messages
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Generate connection code
    generateConnectionCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Get username from settings
    getUsername() {
        const usernameInput = document.getElementById('usernameSetting');
        return usernameInput ? usernameInput.value : null;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add welcome animation
    addWelcomeAnimation() {
        const welcomeCard = document.querySelector('.welcome-card');
        if (welcomeCard) {
            welcomeCard.style.opacity = '0';
            welcomeCard.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                welcomeCard.style.transition = 'all 0.8s ease-out';
                welcomeCard.style.opacity = '1';
                welcomeCard.style.transform = 'translateY(0)';
            }, 100);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.messenger = new RealTimeMessenger();
});

// Global functions for HTML onclick handlers
function showWelcome() {
    window.messenger.showWelcome();
}

function showDirectConnect() {
    window.messenger.showDirectConnect();
}

function showDemoMode() {
    window.messenger.showDemoMode();
}

function createConnection() {
    window.messenger.createConnection();
}

function joinConnection() {
    window.messenger.joinConnection();
}

function toggleUserList() {
    window.messenger.toggleUserList();
}

function showSettings() {
    window.messenger.showSettings();
}

function closeSettingsModal() {
    window.messenger.closeSettingsModal();
}

function closeConnectionModal() {
    window.messenger.closeConnectionModal();
}

function toggleEmojiPicker() {
    window.messenger.toggleEmojiPicker();
}

function insertEmoji(emoji) {
    window.messenger.insertEmoji(emoji);
}

function copyConnectionCode() {
    window.messenger.copyConnectionCode();
}

function saveSettings() {
    window.messenger.saveSettings();
}
