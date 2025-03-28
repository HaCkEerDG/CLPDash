#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CLPDash setup...${NC}"

# Install Node.js and npm
echo -e "${YELLOW}Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
echo -e "${YELLOW}Installing pnpm...${NC}"
sudo npm install -g pnpm

# Install dependencies
echo -e "${YELLOW}Installing project dependencies...${NC}"
pnpm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << EOL
NEXTAUTH_URL=http://localhost:6152
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# SSH Configuration
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=$USER
SSH_PASSWORD=
# SSH_KEY=
EOL
fi

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
pnpm build

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To start the development server, run:${NC}"
echo -e "pnpm dev" 