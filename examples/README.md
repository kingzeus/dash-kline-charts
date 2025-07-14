# 示例文件说明

本目录包含 Dash KLineChart 组件的使用示例。

## 文件说明

### `test_dash_app.py`
基础测试应用，展示组件的基本功能：
- 基础K线图显示
- 深色主题K线图
- 带技术指标的K线图
- 数据刷新功能

### `realtime_test.py`
实时数据更新测试应用，展示：
- 实时数据更新
- 手动添加数据点
- 自动更新控制
- 数据状态监控

### `complete_example.py`
完整功能示例应用，包含：
- 主题切换
- 图表类型选择
- 技术指标动态控制
- 显示选项配置
- 数据操作功能

### `react-klinechart-demo.html`
React中使用KLineChart的简单示例（v10接口）：
- 使用KLineChart v10最新API
- React Hooks实现状态管理
- 主题切换功能
- MA技术指标动态添加/移除
- 数据刷新功能
- 简洁的界面设计

### `react-example.html`
React中使用KLineChart的完整功能示例（v10接口）：
- 完整的组件功能测试，与TypeScript版本保持一致
- 分离式架构：初始化、数据更新、指标更新、主题更新独立处理
- 多种技术指标支持（MA、EMA等）动态添加/移除
- 主题切换功能（明亮/暗黑主题）
- 响应式设计和窗口大小自适应
- 完善的错误处理和生命周期管理
- 优化的性能和内存管理

## 运行示例

### Python示例
```bash
# 确保已正确安装依赖
pip install -e .

# 运行基础测试
python examples/test_dash_app.py

# 运行实时更新测试
python examples/realtime_test.py

# 运行完整示例
python examples/complete_example.py
```

### HTML示例
```bash
# 启动本地HTTP服务器
cd examples
python -m http.server 8001

# 然后在浏览器中访问
# http://localhost:8001/react-klinechart-demo.html
# 或
# http://localhost:8001/react-example.html
```

## 注意事项

1. 所有Python示例都需要在项目根目录运行
2. 确保已正确安装依赖包：`pip install -e .`
3. Python示例使用不同的端口避免冲突：
   - test_dash_app.py: 8052
   - realtime_test.py: 8053
   - complete_example.py: 8054
4. HTML示例需要启动本地HTTP服务器，因为浏览器的同源策略限制
5. 两个HTML示例的功能对比：

| 功能特性 | react-klinechart-demo.html | react-example.html |
|---------|---------------------------|-------------------|
| 适用场景 | 快速上手学习 | 企业级应用开发 |
| 代码复杂度 | 简单直观 | 完整架构 |
| 数据更新 | 基础实现 | 优化的分离式更新 |
| 技术指标 | MA指标演示 | 多种指标+动态管理 |
| 主题切换 | 简单切换 | 完整主题系统 |
| 错误处理 | 基础处理 | 企业级错误处理 |
| 性能优化 | 无 | 内存管理+性能优化 |
| 响应式设计 | 基础响应式 | 完整响应式方案 |
6. 推荐使用场景：
   - 初学者或快速原型：使用 `react-klinechart-demo.html`
   - 生产环境或复杂应用：参考 `react-example.html` 的架构设计
7. 所有HTML示例都使用本地的klinecharts.min.js文件
8. 确保examples目录下有klinecharts.min.js文件
