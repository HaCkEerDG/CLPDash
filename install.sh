#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Progress bar function
progress_bar() {
    local duration=$1
    local width=50
    local progress=0
    local step=$((width * 100 / (duration * 100)))
    
    printf "["
    while [ $progress -lt $width ]; do
        printf "#"
        progress=$((progress + step))
        sleep 0.01
    done
    printf "] "
}

# Print centered text
print_centered() {
    local text="$1"
    local width=$(tput cols)
    local padding=$(( (width - ${#text}) / 2 ))
    printf "%${padding}s$text\n"
}

# Error handler
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Function to print status messages
print_status() {
    echo -e "${GREEN}[+]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[x]${NC} $1"
}

# Clear screen and show header
clear
echo -e "${BLUE}"
print_centered "╔═══════════════════════════════════════════════╗"
print_centered "║             CLPDash Installation             ║"
print_centered "║           Security Configuration             ║"
print_centered "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root"
    exit 1
fi

# System requirements check
echo -e "\n${BOLD}Checking system requirements...${NC}"
sleep 1

# Create installation directory
INSTALL_DIR="/opt/clpdash"
print_status "Creating installation directory at ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit 1

# Install system dependencies
print_status "Installing system dependencies..."
if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y curl git openssh-server
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum update -y
    yum install -y curl git openssh-server
else
    print_error "Unsupported package manager. Please install dependencies manually."
    exit 1
fi

# Install Node.js using nvm
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
fi

# Install pnpm
print_status "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    source ~/.bashrc
fi

# Clone repository
print_status "Cloning repository..."
if [ ! -d "$INSTALL_DIR/.git" ]; then
    git clone https://github.com/yourusername/clpdash.git .
else
    git pull
fi

# Install project dependencies
print_status "Installing project dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOL
NEXTAUTH_URL=http://localhost:6152
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# SSH Configuration
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=$SUDO_USER
SSH_PASSWORD=
# SSH_KEY=

# Optional Configuration
ENABLE_HTTPS=false
RATE_LIMIT=100
SESSION_TIMEOUT=3600
EOL
    print_warning "Please update SSH credentials in .env.local"
fi

# Build the application
print_status "Building the application..."
pnpm build

# Install and configure PM2
print_status "Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'clpdash',
    script: 'pnpm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 6152
    },
    max_memory_restart: '300M'
  }]
}
EOL

# Setup systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/clpdash.service << EOL
[Unit]
Description=ClpDash Server Management Dashboard
After=network.target

[Service]
Type=forking
User=$SUDO_USER
WorkingDirectory=$INSTALL_DIR
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=PM2_HOME=$INSTALL_DIR/.pm2
ExecStart=/usr/local/bin/pm2 start ecosystem.config.js
ExecReload=/usr/local/bin/pm2 reload ecosystem.config.js
ExecStop=/usr/local/bin/pm2 stop ecosystem.config.js

[Install]
WantedBy=multi-user.target
EOL

# Set permissions
print_status "Setting permissions..."
chown -R "$SUDO_USER:$SUDO_USER" "$INSTALL_DIR"
chmod -R 755 "$INSTALL_DIR"

# Start the service
print_status "Starting ClpDash service..."
systemctl daemon-reload
systemctl enable clpdash
systemctl start clpdash

# Configure sudoers for service management
print_status "Configuring sudo permissions..."
cat > /etc/sudoers.d/clpdash << EOL
$SUDO_USER ALL=(ALL) NOPASSWD: /bin/systemctl status *
$SUDO_USER ALL=(ALL) NOPASSWD: /bin/systemctl start *
$SUDO_USER ALL=(ALL) NOPASSWD: /bin/systemctl stop *
$SUDO_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart *
EOL
chmod 440 /etc/sudoers.d/clpdash

print_status "Installation complete!"
echo -e "${GREEN}ClpDash is now running at http://localhost:6152${NC}"
echo -e "${YELLOW}Please update your SSH credentials in $INSTALL_DIR/.env.local${NC}"
echo -e "${YELLOW}For security, consider setting up HTTPS and updating the admin password${NC}"

# Display completion message
echo -e "\n${GREEN}${BOLD}Installation completed successfully!${NC}"
echo -e "\n${YELLOW}Security Credentials:${NC}"
echo -e "Username: ${BOLD}alpha_commander_9571${NC}"
echo -e "Password: ${BOLD}Kj8#mP9\$vL2@nX5${NC}"
echo -e "\n${BLUE}The server is running at:${NC}"
echo -e "${BOLD}https://${DOMAIN_NAME}${NC}"

# Security warning
echo -e "\n${RED}${BOLD}IMPORTANT SECURITY NOTICE:${NC}"
echo "1. Change the default password after first login"
echo "2. Keep these credentials secure"
echo "3. Configure your firewall to restrict access"
echo "4. Regularly update the system"

# Save credentials to a secure file
echo -e "\n${YELLOW}Saving credentials to /root/.clpdash_credentials${NC}"
cat > /root/.clpdash_credentials << EOL
CLPDash Credentials
-------------------
Username: alpha_commander_9571
Password: Kj8#mP9\$vL2@nX5
Installation Date: $(date)
Server URL: https://${DOMAIN_NAME}
EOL
chmod 600 /root/.clpdash_credentials

echo -e "\n${BLUE}${BOLD}Thank you for installing CLPDash!${NC}"
echo -e "\n${GREEN}The service is running and will start automatically on system boot.${NC}"
echo -e "To check service status: ${BOLD}systemctl status clpdash${NC}" 