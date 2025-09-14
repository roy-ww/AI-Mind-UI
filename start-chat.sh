#!/bin/bash

# 启动大模型问答页面
echo "正在启动大模型问答页面..."

# 检查后端是否运行
if ! curl -s http://localhost:8080/api/llm/health > /dev/null; then
    echo "后端服务未运行，请先启动后端服务"
    echo "运行命令: cd backend && ./start-backend.sh"
    exit 1
fi

# 打开聊天页面
open frontend/chat.html

echo "大模型问答页面已打开"
echo "请在浏览器中设置您的API Key以开始使用"
