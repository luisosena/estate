#!/bin/bash

# Install Git Hooks for Documentation Sync
# Run this script to set up the pre-commit hook

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "📦 Installing git hooks for documentation sync..."

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy the pre-commit hook
if [ -f "$SCRIPT_DIR/hooks/pre-commit" ]; then
    cp "$SCRIPT_DIR/hooks/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Pre-commit hook installed"
else
    echo "❌ Pre-commit hook not found at hooks/pre-commit"
    echo "   Create hooks/pre-commit in project root and re-run this script"
    exit 1
fi

echo ""
echo "📝 To enable auto-sync on commit, set the environment variable:"
echo "   export DOCSYNC_ENABLED=true"
echo ""
echo "Or add to your .bashrc or .zshrc:"
echo "   export DOCSYNC_ENABLED=true"
echo ""
echo "To manually run documentation sync:"
echo "   php artisan docs:sync"
echo ""
echo "To check for discrepancies without updating:"
echo "   php artisan docs:sync --check"
echo ""
