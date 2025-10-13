#!/bin/bash
# validate-standards.sh - Enforce project standards

echo "Validating project standards..."

# Check for emojis in code files
if grep -r "🎯\|✅\|🚀\|💡\|⚡\|📝\|🔧\|🛠️\|🎉\|💼\|🌟\|🔥\|📦\|🎨\|🚨\|⭐\|❌\|✨" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"; then
    echo "❌ ERROR: Emojis found in source code!"
    exit 1
fi

# Check commit message format
COMMIT_MSG=$(git log -1 --pretty=%B)
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
    echo "❌ ERROR: Commit message doesn't follow conventional format!"
    exit 1
fi

echo "✅ All standards validated!"