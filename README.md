# 🚀 Real-Time Chat Application

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.2-orange.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, real-time chat application built with Node.js, Express, and Socket.IO. Features a beautiful, responsive UI with real-time messaging capabilities.

## ✨ Features

- **Real-time messaging** using Socket.IO
- **User authentication** with custom usernames
- **Live user list** showing online participants
- **Typing indicators** to show when someone is typing
- **System messages** for user join/leave notifications
- **Responsive design** that works on all devices
- **Modern UI** with smooth animations and gradients
- **Auto-scroll** to latest messages
- **Message timestamps** for each message

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/shin-math/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

### 4. Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

## 🌐 Live Demo

**GitHub Pages**: [https://shin-math.github.io/realtime-chat-app](https://shin-math.github.io/realtime-chat-app)

## 🎯 How to Use

### Getting Started
1. **Enter a Username**: Type your desired username and click "Join Chat"
2. **Start Chatting**: Begin typing messages in the input field
3. **See Online Users**: View the sidebar to see who's currently online
4. **Real-time Updates**: Messages appear instantly for all connected users

### Features
- **Send Messages**: Type your message and press Enter or click the send button
- **Typing Indicators**: See when other users are typing
- **User Notifications**: Get notified when users join or leave the chat
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🌐 Testing Multiple Users

To test the real-time functionality with multiple users:

1. **Open Multiple Browser Tabs/Windows**: Navigate to `http://localhost:3000` in different tabs
2. **Use Different Usernames**: Enter unique usernames for each tab
3. **Start Chatting**: Send messages from different tabs to see real-time updates
4. **Observe Features**: Watch typing indicators, user lists, and system messages

## 📱 Browser Compatibility

This application works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔧 Configuration

### Port Configuration
The default port is 3000. To change it:

1. **Environment Variable**: Set `PORT` environment variable
   ```bash
   PORT=8080 npm start
   ```

2. **Direct Modification**: Edit `server.js` and change the port number

### Customization
- **Colors**: Modify the CSS variables in `public/styles.css`
- **Features**: Add new Socket.IO events in `server.js`
- **UI**: Customize the HTML structure in `public/index.html`

## 📁 Project Structure

```
realtime-chat-app/
├── .github/              # GitHub Actions workflows
├── public/               # Frontend files
│   ├── index.html       # Main HTML page
│   ├── styles.css       # CSS styling
│   ├── script.js        # Client-side JavaScript
│   └── 404.html         # Custom 404 page
├── server.js            # Main server file with Express and Socket.IO
├── package.json         # Project dependencies and scripts
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🚀 Deployment

### GitHub Pages
This repository is configured with GitHub Actions to automatically deploy to GitHub Pages.

1. **Push to main branch**: Automatically triggers deployment
2. **Access your app**: `https://shin-math.github.io/realtime-chat-app`

### Local Network
To make the chat accessible to other devices on your local network:

1. **Find Your IP Address**:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Update Server Configuration**:
   ```javascript
   // In server.js, change the listen call
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on http://0.0.0.0:${PORT}`);
   });
   ```

3. **Access from Other Devices**:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

### Production Deployment
For production deployment, consider:
- Using a process manager like PM2
- Setting up environment variables
- Using a reverse proxy like Nginx
- Implementing SSL/TLS encryption

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill the process using port 3000
   npx kill-port 3000
   # Or change the port in server.js
   ```

2. **Dependencies Not Installed**
   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Socket.IO Connection Issues**
   - Check if the server is running
   - Ensure no firewall is blocking the connection
   - Check browser console for error messages

### Error Messages
- **"Cannot find module"**: Run `npm install`
- **"Port already in use"**: Change port or kill existing process
- **"Connection refused"**: Ensure server is running

## 🔒 Security Features

- **XSS Prevention**: HTML escaping for user input
- **Input Validation**: Server-side message validation
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contributing Guidelines
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [Express.js](https://expressjs.com/) for the web framework
- [Font Awesome](https://fontawesome.com/) for icons

## 📞 Support

If you have any questions or need help:

- **Create an issue** on GitHub
- **Star the repository** if you find it helpful
- **Share with others** who might benefit from it

## 🎉 Enjoy Your Chat!

Your real-time chat application is now ready! Open multiple browser tabs, invite friends on your local network, and start chatting in real-time.

---

**Happy Chatting! 🎊**

<div align="center">
  <sub>Built with ❤️ using Node.js, Express, and Socket.IO</sub>
</div>
