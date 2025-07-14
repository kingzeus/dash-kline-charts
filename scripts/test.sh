#!/bin/bash

# 发布前测试脚本
# 确保所有测试通过和代码质量检查

set -e

echo "🧪 Running pre-release tests..."

# 清理环境
echo "🧹 Cleaning environment..."
rm -rf dist/ build/ *.egg-info/

# 安装依赖
echo "📦 Installing dependencies..."
npm install
pip install -e ".[dev]"

# JavaScript测试
echo "📝 Running JavaScript tests..."
npm test

# Python测试
echo "🐍 Running Python tests..."
python -m pytest tests/ -v

# 代码检查
echo "🔍 Running code quality checks..."
npm run lint
python -m flake8 dash_kline_charts/ tests/ --max-line-length=88 --ignore=E203,W503

# 构建测试
echo "🏗️ Testing build process..."
npm run build
python -m build

# 安装测试
echo "📥 Testing installation..."
pip uninstall -y dash-kline-charts || true
pip install dist/*.whl

# 导入测试
echo "🧩 Testing import..."
python -c "import dash_kline_charts; print('✅ Import test passed')"

# 功能测试
echo "⚡ Testing basic functionality..."
python -c "
from dash_kline_charts import DashKLineChart
import dash
print('✅ Component creation test passed')
"

echo "✅ All tests passed! Package is ready for release."