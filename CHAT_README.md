# AI 大模型问答系统

这是一个基于Spring Boot和现代前端技术的大模型问答系统，支持阿里通义千问(Qwen)和Kimi两种大模型。

## 功能特性

- 🤖 支持多种大模型：阿里通义千问、Kimi
- 💬 实时对话界面，支持多轮对话
- ⚙️ 灵活的API Key配置
- 🎨 现代化的UI设计，响应式布局
- 🔧 可调节的温度参数
- 📱 移动端友好

## 快速开始

### 1. 启动后端服务

```bash
cd backend
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### 2. 启动聊天页面

```bash
# 方法1：使用启动脚本
./start-chat.sh

# 方法2：直接打开
open frontend/chat.html
```

### 3. 配置API Key

1. 点击页面右下角的设置按钮
2. 输入您的大模型API Key：
   - **通义千问**：在[阿里云控制台](https://dashscope.aliyuncs.com/)获取API Key
   - **Kimi**：在[月之暗面官网](https://www.moonshot.cn/)获取API Key
3. 调整温度参数（0-1，控制回答的随机性）
4. 保存设置

### 4. 开始对话

1. 选择您想要使用的模型
2. 在输入框中输入问题
3. 按回车或点击发送按钮
4. 等待AI回复

## API 接口

### 聊天接口
```
POST /api/llm/chat
Content-Type: application/json

{
  "model": "qwen|kimi",
  "message": "用户问题",
  "apiKey": "您的API Key",
  "temperature": 0.7,
  "conversationHistory": [
    {"role": "user", "content": "之前的问题"},
    {"role": "assistant", "content": "之前的回答"}
  ]
}
```

### 健康检查
```
GET /api/llm/health
```

### 获取支持的模型
```
GET /api/llm/models
```

## 技术栈

### 后端
- **框架**：Spring Boot 3.2.0
- **数据库**：PostgreSQL
- **HTTP客户端**：WebFlux
- **构建工具**：Maven

### 前端
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **响应式设计**
- **现代UI组件**

## 文件结构

```
AI-Mind-UI/
├── backend/                    # 后端代码
│   ├── src/main/java/com/aimind/backend/
│   │   ├── controller/         # 控制器
│   │   ├── service/           # 服务层
│   │   ├── dto/              # 数据传输对象
│   │   └── config/           # 配置类
│   └── src/main/resources/
│       └── application.yml    # 配置文件
├── frontend/                  # 前端代码
│   ├── chat.html             # 聊天页面
│   ├── chat-styles.css       # 样式文件
│   └── chat-script.js        # JavaScript逻辑
├── start-chat.sh             # 启动脚本
└── CHAT_README.md           # 说明文档
```

## 使用说明

### 获取API Key

#### 阿里通义千问 (Qwen)
1. 访问 [阿里云控制台](https://dashscope.aliyuncs.com/)
2. 注册/登录账号
3. 创建API Key
4. 复制API Key到设置中

#### Kimi (月之暗面)
1. 访问 [月之暗面官网](https://www.moonshot.cn/)
2. 注册/登录账号
3. 获取API Key
4. 复制API Key到设置中

### 温度参数说明

- **0.0-0.3**：回答更加确定性和一致
- **0.4-0.7**：平衡创造性和一致性（推荐）
- **0.8-1.0**：回答更加随机和创造性

### 快捷键

- **Enter**：发送消息
- **Shift + Enter**：换行
- **快捷按钮**：点击预设问题快速输入

## 故障排除

### 后端启动失败
1. 确保Java 17已安装
2. 确保PostgreSQL数据库正在运行
3. 检查端口8080是否被占用

### API调用失败
1. 检查API Key是否正确
2. 检查网络连接
3. 查看浏览器控制台错误信息

### 页面无法加载
1. 确保后端服务正在运行
2. 检查浏览器控制台是否有CORS错误
3. 尝试刷新页面

## 开发说明

### 添加新的大模型

1. 在`LLMService`中添加新的API调用方法
2. 在`LLMController`中更新支持的模型列表
3. 在前端`chat-script.js`中添加模型选项

### 自定义样式

修改`frontend/chat-styles.css`文件来自定义界面样式。

## 许可证

MIT License
