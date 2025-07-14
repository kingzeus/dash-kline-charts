#!/bin/bash

# 发布脚本
# 用于自动构建和发布 dash-kline-charts 包

set -e

echo "🚀 Starting dash-kline-charts release process..."

# 检查是否在正确的分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Please switch to main branch before releasing"
    exit 1
fi

# 检查工作区是否干净
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit your changes first."
    exit 1
fi

# 运行测试
echo "🧪 Running tests..."
npm test
python -m pytest tests/

# 代码检查
echo "🔍 Running linting..."
npm run lint
python -m flake8 dash_kline_charts/

# 类型检查
echo "📝 Running type check..."
npm run type-check

# 清理构建目录
echo "🧹 Cleaning build directories..."
rm -rf lib/
rm -rf dist/
rm -rf build/
rm -rf *.egg-info/

# 构建 JavaScript 组件
echo "📦 Building JavaScript components..."
npm run build

# 构建 Python 包
echo "🐍 Building Python package..."
python setup.py sdist bdist_wheel

# 检查构建结果
echo "🔍 Checking build results..."
if [ ! -f "lib/index.js" ]; then
    echo "❌ JavaScript build failed"
    exit 1
fi

if [ ! -f "dist/dash-kline-charts-0.1.0.tar.gz" ]; then
    echo "❌ Python build failed"
    exit 1
fi

echo "✅ Build completed successfully!"

# 询问是否发布
read -p "🚀 Do you want to publish to npm and PyPI? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Publishing to npm..."
    npm publish
    
    echo "🐍 Publishing to PyPI..."
    twine upload dist/*
    
    echo "🎉 Release completed successfully!"
    echo "📌 Don't forget to create a GitHub release with the changelog"
else
    echo "📦 Build completed. Run 'npm publish' and 'twine upload dist/*' to publish."
fi

echo "✨ Release process finished!"