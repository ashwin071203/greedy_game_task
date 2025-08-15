#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Setting up Git repository for Todo Dashboard${NC}"

# Initialize Git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${GREEN}Initializing Git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Todo Dashboard with Next.js and Supabase"
    echo -e "${GREEN}✅ Git repository initialized with initial commit${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

# Check if remote is already set
if ! git remote -v | grep -q "origin"; then
    echo -e "\n${YELLOW}📌 Next steps to set up your remote repository:${NC}"
    echo "1. Create a new repository on GitHub/GitLab/Bitbucket"
    echo "2. Run the following commands:"
    echo "   git remote add origin <repository-url>"
    echo "   git push -u origin main"
else
    echo -e "\n${GREEN}✅ Remote repository is already set up${NC}"
    echo -e "Current remotes:"
    git remote -v
fi

# Add collaborator instructions
echo -e "\n${YELLOW}👥 To add a collaborator:${NC}"
echo "1. Go to your repository on GitHub/GitLab/Bitbucket"
echo "2. Navigate to Settings > Collaborators"
echo "3. Click 'Add people' and enter their username/email"
echo "4. Set the appropriate access level (usually 'Write' for collaborators)"

# Make the script executable
chmod +x setup-repo.sh

echo -e "\n${GREEN}✨ Repository setup complete!${NC}"
