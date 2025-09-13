#!/bin/bash

echo "🚀 启动思维导图管理后台"
echo "================================"

# 检查后端是否运行
if curl -s http://localhost:8080/api/nodes/generate-node-id > /dev/null 2>&1; then
    echo "✅ 后端服务已运行"
else
    echo "❌ 后端服务未运行，请先启动后端服务"
    echo "运行命令: cd backend && mvn spring-boot:run"
    exit 1
fi

# 启动前端服务器
echo "🌐 启动前端服务器..."
cd frontend

# 检查是否有Python
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动服务器"
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动服务器"
    python -m SimpleHTTPServer 3000
else
    echo "❌ 未找到Python，请手动打开 admin.html 文件"
    echo "文件路径: $(pwd)/admin.html"
    exit 1
fi
