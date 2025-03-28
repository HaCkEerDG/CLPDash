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
echo "                                         ╔═══════════════════════════════════════════════╗"
echo "                                         ║             CLPDash Installation             ║"
echo "                                         ║           Security Configuration             ║"
echo "                                         ╚═══════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (sudo ./install.sh)"
    exit 1
fi

# Function to wait for apt to be available
wait_for_apt() {
    while fuser /var/lib/dpkg/lock >/dev/null 2>&1 || fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || fuser /var/cache/apt/archives/lock >/dev/null 2>&1; do
        print_warning "Waiting for other package managers to finish..."
        sleep 1
    done
}

# Install system dependencies
print_status "Installing system dependencies..."
wait_for_apt
apt-get update
apt-get install -y curl git openssh-server build-essential

# Install Node.js
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    wait_for_apt
    apt-get install -y nodejs
fi

# Install pnpm
print_status "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

# Create installation directory
INSTALL_DIR="/opt/clpdash"
print_status "Creating installation directory at ${INSTALL_DIR}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR" || exit 1

# Clone repository using HTTPS
print_status "Cloning repository..."
if [ ! -d "$INSTALL_DIR/.git" ]; then
    print_warning "Please enter your GitHub Personal Access Token:"
    read -r github_token
    git clone https://oauth2:${github_token}@github.com/HaCkEerDG/CLPDash.git .
else
    git pull
fi

# Set permissions
chown -R $SUDO_USER:$SUDO_USER "$INSTALL_DIR"

# Switch to the user who ran sudo
su - $SUDO_USER << 'EOF'
cd "$INSTALL_DIR"

# Install dependencies
print_status "Installing project dependencies..."
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOFENV
NEXTAUTH_URL=http://localhost:6152
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# SSH Configuration
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=$USER
SSH_PASSWORD=
# SSH_KEY=
EOFENV
fi

# Build the application
print_status "Building the application..."
pnpm build
EOF

# Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/clpdash.service << EOL
[Unit]
Description=CLPDash Server Management Dashboard
After=network.target

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which pnpm) start
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Configure permissions
print_status "Configuring permissions..."
systemctl daemon-reload
systemctl enable clpdash
systemctl start clpdash

print_status "Installation complete!"
echo -e "${GREEN}CLPDash is now running at http://localhost:6152${NC}"
echo -e "${YELLOW}Please update your SSH credentials in $INSTALL_DIR/.env.local${NC}"

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