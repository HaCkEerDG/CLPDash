# CLPDash - Cloud Protected Dashboard

A **modern, secure, and feature-rich** web-based **server management dashboard** built with **Next.js 14**.  
CLPDash provides **SSH terminal access, real-time monitoring, service management, and robust security features**, all within an intuitive UI.  

---

## 🌟 Features  

### 🔹 Core Functionalities  
- **Secure Authentication**  
  - NextAuth.js integration  
  - Role-based access control (RBAC)  
  - Session management  
  - Secure password hashing  

- **Web Terminal**  
  - Full SSH terminal emulation  
  - Multi-session support  
  - Copy/paste functionality  
  - Custom themes  
  - Session persistence  

- **Service Management**  
  - Start/stop/restart services  
  - Real-time service status monitoring  
  - Automatic service discovery  
  - View service logs  
  - Configure startup services  

- **System Monitoring**  
  - Live CPU usage tracking  
  - Memory and disk space monitoring  
  - Network statistics  
  - Process management  

### 🔹 Enhanced Capabilities  
- **Real-time Notifications**  
  - Service state changes  
  - System alerts  
  - Software update notifications  
  - Custom notification rules  

- **Customizable UI & Themes**  
  - Dark/Light mode  
  - Custom color schemes  
  - Responsive design  
  - Configurable UI elements  

- **Advanced Security Features**  
  - HTTPS enforcement  
  - Rate limiting & brute force protection  
  - Input sanitization to prevent XSS/SQL injections  
  - Detailed audit logging  

---

## 📋 Prerequisites  

### ✅ System Requirements  
- **Node.js** 18.x or later  
- **pnpm** 8.x or later  
- **Linux/Unix** server with SSH access  
- **Web browser** with WebSocket support  

### ✅ Server Requirements  
- **OpenSSH server** (or compatible SSH daemon)  
- **systemd** for service management  
- **Administrator/root privileges** for service control  
- **Ensure port 22 is open** for SSH connections  

---

## 🚀 Quick Start  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/HaCkEerDG/CLPDash.git
cd clpdash
```

### 2️⃣ Install Dependencies  
```bash
./install.sh
```

## 📦 Ubuntu Installation

```bash
# Update system and install git
sudo apt update && sudo apt upgrade -y
sudo apt install -y git

# Clone and setup
git clone https://github.com/yourusername/clpdash.git
cd clpdash
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh

# Start development server
pnpm dev

# Or for production
pnpm build
pnpm start
```

The setup script will:
1. Install Node.js and npm
2. Install pnpm package manager
3. Install project dependencies
4. Create default configuration
5. Build the application

After installation, the dashboard will be available at:
- Development: http://localhost:6152
- Production: http://your-server-ip:6152