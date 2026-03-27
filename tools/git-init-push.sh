#!/bin/bash
# Git Init & Push | Usage: ./tools/git-init-push.sh [remote-url]
set -e
cd "$(dirname "$0")/.."

[ ! -d ".git" ] && git init

if [ ! -f ".gitignore" ]; then
cat > .gitignore << 'EOF'
node_modules/
android/app/build/
android/.gradle/
android/build/
android/local.properties
*.apk
*.aab
ios/Pods/
ios/build/
.idea/
.vscode/
.DS_Store
.env
.env.local
coverage/
*.log
.metro-health-check*
EOF
fi

[ -n "$1" ] && (git remote get-url origin &>/dev/null && git remote set-url origin "$1" || git remote add origin "$1")

git add -A
[ -z "$(git status --porcelain)" ] && echo "No changes to commit" && exit 0

git status --short
read -p "Commit message (default: 'chore: initial commit'): " MSG
git commit -m "${MSG:-chore: initial commit}"

git remote get-url origin &>/dev/null && git push -u origin "$(git branch --show-current)" || echo "No remote. Run: $0 <url>"
