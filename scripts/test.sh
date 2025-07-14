#!/bin/bash

echo "🧪 运行 Dash KLineChart 组件测试"
echo "=================================="

# 检查是否有Python环境
if ! command -v python &> /dev/null; then
    echo "❌ Python 未安装"
    exit 1
fi

# 检查是否有Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查是否有npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 运行Python测试
echo "🐍 运行 Python 单元测试..."
python -m pytest tests/test_dash_kline_chart.py -v

if [ $? -eq 0 ]; then
    echo "✅ Python 测试通过"
else
    echo "❌ Python 测试失败"
    exit 1
fi

echo ""

# 检查是否安装了JavaScript测试依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装 JavaScript 测试依赖..."
    npm install
fi

# 运行JavaScript测试（如果存在）
if [ -f "tests/DashKLineChart.test.js" ]; then
    echo "🟨 运行 JavaScript 单元测试..."
    npm test
    
    if [ $? -eq 0 ]; then
        echo "✅ JavaScript 测试通过"
    else
        echo "❌ JavaScript 测试失败"
        exit 1
    fi
else
    echo "⚠️  JavaScript 测试文件不存在，跳过"
fi

echo ""
echo "🎉 所有测试通过！"
echo "=================================="
echo "测试覆盖："
echo "- ✅ Python 组件创建和属性测试"
echo "- ✅ 组件属性验证测试"
echo "- ✅ 数据格式测试"
echo "- ✅ 配置选项测试"
echo "- ✅ 技术指标测试"
echo "- ✅ 样式和响应式测试"
echo "- ✅ 继承和命名空间测试"
if [ -f "tests/DashKLineChart.test.js" ]; then
    echo "- ✅ JavaScript React 组件测试"
    echo "- ✅ 图表初始化和销毁测试"
    echo "- ✅ 属性变化响应测试"
    echo "- ✅ 错误处理测试"
fi