#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Clear screen
clear

# CLPDash ASCII Logo
echo -e "${CYAN}"
cat << "EOF"
   ________    ____  ____              __  
  / ____/ /   / __ \/ __ \____ ______/ /_ 
 / /   / /   / /_/ / / / / __ `/ ___/ __ \
/ /___/ /___/ ____/ /_/ / /_/ (__  ) / / /
\____/_____/_/   /_____/\__,_/____/_/ /_/ 
                                          
EOF
echo -e "${NC}"
echo -e "${WHITE}Cloud Protected Dashboard - Server Management Tool${NC}"
echo -e "${YELLOW}Version: 1.0.0${NC}\n"

# Function to show help
show_help() {
    echo -e "${BOLD}Available Commands:${NC}"
    echo -e "${GREEN}start${NC}        - Start the CLPDash server"
    echo -e "${GREEN}dev${NC}          - Start development server"
    echo -e "${GREEN}build${NC}        - Build the application"
    echo -e "${GREEN}status${NC}       - Check server status"
    echo -e "${GREEN}logs${NC}         - View server logs"
    echo -e "${GREEN}update${NC}       - Update CLPDash to latest version"
    echo -e "${GREEN}backup${NC}       - Backup configuration"
    echo -e "${GREEN}restore${NC}      - Restore configuration"
    echo -e "${GREEN}config${NC}       - Edit configuration"
    echo -e "${GREEN}restart${NC}      - Restart the server"
    echo -e "${GREEN}stop${NC}         - Stop the server"
    echo -e "${GREEN}help${NC}         - Show this help message"
    echo
    echo -e "${BOLD}Examples:${NC}"
    echo -e "  ./start.sh start"
    echo -e "  ./start.sh dev"
    echo -e "  ./start.sh status"
}

# Function to check if pnpm is installed
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}Error: pnpm is not installed${NC}"
        echo -e "Installing pnpm..."
        npm install -g pnpm
    fi
}

# Function to start production server
start_server() {
    echo -e "${YELLOW}Starting CLPDash in production mode...${NC}"
    pnpm start
}

# Function to start development server
start_dev() {
    echo -e "${YELLOW}Starting CLPDash in development mode...${NC}"
    pnpm dev
}

# Function to build application
build_app() {
    echo -e "${YELLOW}Building CLPDash...${NC}"
    pnpm build
}

# Function to check server status
check_status() {
    if pgrep -f "pnpm.*start" > /dev/null; then
        echo -e "${GREEN}CLPDash is running${NC}"
        echo -e "Access the dashboard at: ${BLUE}http://localhost:6152${NC}"
    else
        echo -e "${RED}CLPDash is not running${NC}"
    fi
}

# Function to view logs
view_logs() {
    if [ -d ".next/logs" ]; then
        tail -f .next/logs/*.log
    else
        echo -e "${RED}No logs found${NC}"
    fi
}

# Function to update CLPDash
update_clpdash() {
    echo -e "${YELLOW}Updating CLPDash...${NC}"
    git pull
    pnpm install
    pnpm build
    echo -e "${GREEN}Update complete!${NC}"
}

# Function to backup configuration
backup_config() {
    echo -e "${YELLOW}Backing up configuration...${NC}"
    backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp .env.local "$backup_dir/" 2>/dev/null || echo -e "${RED}No .env.local found${NC}"
    cp next.config.js "$backup_dir/"
    echo -e "${GREEN}Backup created in: $backup_dir${NC}"
}

# Function to restore configuration
restore_config() {
    if [ -z "$1" ]; then
        echo -e "${RED}Please specify backup directory${NC}"
        return 1
    fi
    echo -e "${YELLOW}Restoring configuration from: $1${NC}"
    cp "$1/.env.local" . 2>/dev/null || echo -e "${RED}No .env.local found in backup${NC}"
    cp "$1/next.config.js" .
    echo -e "${GREEN}Configuration restored!${NC}"
}

# Function to edit configuration
edit_config() {
    if [ -z "$EDITOR" ]; then
        EDITOR="nano"
    fi
    $EDITOR .env.local
}

# Check if pnpm is installed
check_pnpm

# Parse command line arguments
case "$1" in
    "start")
        start_server
        ;;
    "dev")
        start_dev
        ;;
    "build")
        build_app
        ;;
    "status")
        check_status
        ;;
    "logs")
        view_logs
        ;;
    "update")
        update_clpdash
        ;;
    "backup")
        backup_config
        ;;
    "restore")
        restore_config "$2"
        ;;
    "config")
        edit_config
        ;;
    "restart")
        echo -e "${YELLOW}Restarting CLPDash...${NC}"
        pkill -f "pnpm.*start"
        sleep 2
        start_server
        ;;
    "stop")
        echo -e "${YELLOW}Stopping CLPDash...${NC}"
        pkill -f "pnpm.*start"
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo -e "Use ${YELLOW}./start.sh help${NC} to see available commands"
        exit 1
        ;;
esac 