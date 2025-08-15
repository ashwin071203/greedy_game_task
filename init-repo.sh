#!/bin/bash

# Initialize Git repository
git init

# Add all files to staging
git add .

# Make initial commit
git commit -m "Initial commit: Todo Dashboard with Next.js and Supabase"

echo "✅ Git repository initialized with initial commit"
echo "Next steps:"
echo "1. Create a new repository on GitHub/GitLab"
echo "2. Add the remote repository: git remote add origin <repository-url>"
echo "3. Push your code: git push -u origin main"

# Make the script executable
chmod +x init-repo.sh
