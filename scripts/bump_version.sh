#!/bin/bash

# 版本管理脚本
# 用于自动更新版本号

set -e

CURRENT_VERSION=$(grep '__version__ = ' dash_kline_charts/_version.py | cut -d '"' -f 2)
echo "Current version: $CURRENT_VERSION"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new_version>"
    echo "Example: $0 0.1.1"
    exit 1
fi

NEW_VERSION=$1

# 验证版本号格式
if ! echo "$NEW_VERSION" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9-]+)?$' > /dev/null; then
    echo "❌ Invalid version format. Use semantic versioning (e.g., 1.0.0, 1.0.0-alpha1)"
    exit 1
fi

echo "Updating version to: $NEW_VERSION"

# 更新 _version.py
sed -i.bak "s/__version__ = \"$CURRENT_VERSION\"/__version__ = \"$NEW_VERSION\"/" dash_kline_charts/_version.py
rm dash_kline_charts/_version.py.bak

# 更新 package.json
sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
rm package.json.bak

# 更新 pyproject.toml
sed -i.bak "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" pyproject.toml
rm pyproject.toml.bak

echo "✅ Version updated successfully!"
echo "📝 Don't forget to update CHANGELOG.md"

# 询问是否提交变更
read -p "🔄 Do you want to commit these changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add dash_kline_charts/_version.py package.json pyproject.toml
    git commit -m "bump version to $NEW_VERSION"
    echo "✅ Changes committed successfully!"
else
    echo "📝 Don't forget to commit the version changes manually"
fi