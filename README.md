# AI-Mind-UI

AI-Mind-UI 是一个基于人工智能的思维导图应用，旨在帮助用户通过可视化的方式组织和表达思维。该应用结合了先进的AI技术与直观的用户界面，让用户能够轻松创建、编辑和分享思维导图。

## 项目概述

AI-Mind-UI 项目采用前后端分离的架构设计，包含以下主要特性：

- **智能思维导图生成**：基于AI技术，能够根据用户输入的关键词或主题自动生成思维导图结构
- **可视化编辑器**：提供直观易用的图形界面，支持拖拽、缩放、连接等操作
- **多格式导出**：支持将思维导图导出为PNG、PDF、Markdown等多种格式
- **用户管理系统**：完整的用户注册、登录和权限管理功能
- **云端同步**：支持思维导图的云端存储和多设备同步

## 技术架构

### 后端技术栈
- **Java 17**：后端主要开发语言
- **Spring Boot 3.2**：核心框架，提供Web服务和依赖注入
- **Spring Data JPA**：数据持久层框架
- **PostgreSQL**：关系型数据库
- **Spring Security**：安全框架，用于密码加密和认证
- **Flyway**：数据库迁移工具
- **Maven**：项目构建和依赖管理工具

### 前端技术栈
- **HTML5/CSS3/JavaScript**：前端基础技术
- **Tailwind CSS**：CSS框架，用于快速构建现代化界面
- **原生JavaScript**：无额外框架依赖，保持轻量级
- **响应式设计**：适配不同屏幕尺寸的设备

## 项目结构

```
AI-Mind-UI/
├── backend/           # 后端服务
│   ├── src/           # 源代码
│   │   ├── main/      # 主代码
│   │   │   ├── java/  # Java源文件
│   │   │   └── resources/ # 配置文件和资源
│   │   └── test/      # 测试代码
│   ├── pom.xml        # Maven配置文件
│   └── target/        # 构建输出目录
├── frontend/          # 前端页面
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript文件
│   ├── img/           # 图片资源
│   ├── fonts/         # 字体文件
│   ├── start.html     # 首页/登录页
│   ├── home.html      # 主应用页面
│   ├── chat.html      # AI对话页面
│   ├── admin.html     # 管理页面
│   └── mindmap.html   # 思维导图页面
├── README.md          # 项目说明文档
└── start-app.sh       # 启动脚本
```

## 后端详细说明

### 核心功能模块

#### 用户管理模块
后端提供了完整的用户管理系统，包括用户注册、登录、信息更新等功能。

**主要实体类：**
- `User`：用户实体类，包含用户的基本信息（用户名、密码、昵称等）

**主要服务类：**
- `UserService`：用户服务类，提供用户相关的业务逻辑处理
- `UserRepository`：用户数据访问接口，继承自JPA Repository

**主要控制器类：**
- `UserController`：用户控制器，处理用户相关的HTTP请求

### API接口

#### 用户相关接口
- `POST /api/users`：创建新用户
- `GET /api/users/{uid}`：根据用户ID获取用户信息
- `GET /api/users/username/{username}`：根据用户名获取用户信息
- `GET /api/users`：获取所有用户列表
- `PUT /api/users/{uid}`：更新用户信息
- `DELETE /api/users/{uid}`：删除用户
- `POST /api/users/login`：用户登录验证

### 数据库设计

项目使用PostgreSQL作为数据库，通过JPA和Hibernate进行数据持久化。

**用户表结构：**
- `uid`：用户唯一标识符（UUID）
- `username`：用户名（唯一）
- `password`：加密后的密码
- `nickname`：用户昵称
- `created_at`：创建时间
- `updated_at`：更新时间

### 安全机制

项目使用Spring Security进行安全控制：
- 密码通过BCryptPasswordEncoder进行加密存储
- 所有API接口均支持跨域访问（开发阶段）

### 配置文件

后端配置文件位于 `backend/src/main/resources/` 目录下：
- `application.yml`：主配置文件，包含数据库连接、服务器端口等配置
- `application-secret.yml.example`：API密钥配置示例文件

## 前端详细说明

### 页面结构

前端项目包含以下几个主要页面：

1. **start.html** - 首页/登录页
   - 包含用户登录功能
   - 提供搜索入口
   - 侧边栏菜单导航

2. **home.html** - 主应用页面
   - 用户登录后的主界面
   - 显示用户信息和搜索功能

3. **chat.html** - AI对话页面
   - 与AI大模型进行问答交互
   - 支持多种模型选择（通义千问、Kimi等）
   - 提供API设置功能

4. **mindmap.html** - 思维导图页面
   - 可视化展示思维导图
   - 支持拖拽、缩放等交互操作

5. **admin.html** - 管理页面
   - 系统管理功能

### 核心功能

#### 用户登录系统
- 基于用户名和密码的认证机制
- 通过AJAX调用后端API进行验证
- 登录成功后提供用户友好的提示信息

#### 搜索功能
- 提供搜索框供用户输入查询内容
- 支持热门搜索建议

#### AI对话系统
- 集成多种大语言模型
- 支持模型参数配置（温度等）
- 提供快捷操作按钮

#### 思维导图可视化
- 基于SVG的思维导图渲染
- 支持节点折叠/展开
- 支持鼠标拖拽和滚轮缩放

### 技术实现

#### 样式设计
- 使用Tailwind CSS框架进行样式设计
- 响应式布局适配不同设备
- 深色主题设计

#### 交互实现
- 原生JavaScript实现页面交互
- 使用Fetch API与后端进行数据交互
- 实现了模态框、提示框等UI组件

#### 第三方库
- **marked.js**：Markdown解析库，用于思维导图内容渲染
- **highlight.js**：代码高亮库，用于展示技术内容

## 安装和运行指南

### 环境要求

#### 后端环境
- **Java 17** 或更高版本
- **Maven 3.6+**
- **PostgreSQL 13+**

#### 前端环境
- 现代浏览器（Chrome、Firefox、Safari等）
- 本地HTTP服务器（用于开发测试）

#### 数据库配置
项目默认使用PostgreSQL数据库，需要预先创建数据库和用户：

```sql
CREATE DATABASE aimind_db;
CREATE USER aimind_user WITH PASSWORD 'aimind_password';
GRANT ALL PRIVILEGES ON DATABASE aimind_db TO aimind_user;
```

### 安装步骤

#### 1. 克隆项目
```bash
git clone <项目地址>
cd AI-Mind-UI
```

#### 2. 配置后端
1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 复制并配置密钥文件：
   ```bash
   cp src/main/resources/application-secret.yml.example src/main/resources/application-secret.yml
   ```
   编辑 `application-secret.yml` 文件，填入真实的API Key。

3. 检查数据库配置：
   确认 `src/main/resources/application.yml` 中的数据库连接配置正确。

#### 3. 安装后端依赖
```bash
mvn clean install
```

#### 4. 运行后端服务
有两种方式运行后端服务：

方式一：使用Maven命令
```bash
mvn spring-boot:run
```

方式二：使用启动脚本
```bash
cd ..
./start-app.sh
```

后端服务默认运行在 `http://localhost:8080`

#### 5. 运行前端页面
前端页面可以通过任何HTTP服务器运行，例如：

使用Python：
```bash
cd frontend
python3 -m http.server 8000
```

使用Node.js（需要安装http-server）：
```bash
cd frontend
npx http-server -p 8000
```

前端页面默认运行在 `http://localhost:8000`

### 默认用户

项目初始化时会自动创建一个默认管理员用户：
- **用户名**：admin
- **密码**：111111

### API密钥配置

为了使用AI大模型功能，需要配置相应的API密钥：

1. 编辑 `backend/src/main/resources/application-secret.yml` 文件
2. 填入阿里百炼平台的API Key：
   ```yaml
   llm:
     api:
       bailian:
         api-key: "你的API密钥"
   ```

### 访问应用

1. 启动后端服务：`http://localhost:8080`
2. 启动前端页面：`http://localhost:8000`
3. 打开浏览器访问前端页面
4. 使用默认用户登录或注册新用户

## API文档

### 基础URL
所有API接口的基础URL为：`http://localhost:8080/api`

### 通用响应格式
所有API响应都遵循以下格式：
```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {} // 具体数据，根据接口而定
}
```

### 用户相关接口

#### 1. 用户登录
- **URL**：`POST /users/login`
- **描述**：用户登录验证
- **请求参数**：
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应示例**：
  ```json
  {
    "success": true,
    "message": "登录成功",
    "uid": "用户唯一标识",
    "username": "用户名",
    "nickname": "昵称",
    "loginTime": "登录时间"
  }
  ```

#### 2. 创建用户
- **URL**：`POST /users`
- **描述**：创建新用户
- **请求参数**：
  ```json
  {
    "username": "用户名（3-50个字符）",
    "password": "密码（至少6个字符）",
    "nickname": "昵称（可选，最多100个字符）"
  }
  ```
- **响应示例**：
  ```json
  {
    "uid": "用户唯一标识",
    "username": "用户名",
    "nickname": "昵称",
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
  ```

#### 3. 获取用户信息
- **URL**：`GET /users/{uid}`
- **描述**：根据用户ID获取用户信息
- **响应示例**：
  ```json
  {
    "uid": "用户唯一标识",
    "username": "用户名",
    "nickname": "昵称",
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
  ```

#### 4. 根据用户名获取用户信息
- **URL**：`GET /users/username/{username}`
- **描述**：根据用户名获取用户信息
- **响应示例**：
  ```json
  {
    "uid": "用户唯一标识",
    "username": "用户名",
    "nickname": "昵称",
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
  ```

#### 5. 获取所有用户
- **URL**：`GET /users`
- **描述**：获取所有用户列表
- **响应示例**：
  ```json
  [
    {
      "uid": "用户唯一标识",
      "username": "用户名",
      "nickname": "昵称",
      "createdAt": "创建时间",
      "updatedAt": "更新时间"
    }
  ]
  ```

#### 6. 更新用户信息
- **URL**：`PUT /users/{uid}`
- **描述**：更新用户信息
- **请求参数**：
  ```json
  {
    "username": "新用户名（可选）",
    "password": "新密码（可选）",
    "nickname": "新昵称（可选）"
  }
  ```
- **响应示例**：
  ```json
  {
    "uid": "用户唯一标识",
    "username": "用户名",
    "nickname": "昵称",
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
  ```

#### 7. 删除用户
- **URL**：`DELETE /users/{uid}`
- **描述**：删除用户
- **响应示例**：
  ```json
  {
    "success": true,
    "message": "用户删除成功"
  }
  ```

#### 8. 检查用户是否存在
- **URL**：`GET /users/{uid}/exists`
- **描述**：检查指定ID的用户是否存在
- **响应示例**：
  ```json
  {
    "exists": true
  }
  ```

#### 9. 检查用户名是否存在
- **URL**：`GET /users/username/{username}/exists`
- **描述**：检查指定用户名的用户是否存在
- **响应示例**：
  ```json
  {
    "exists": true
  }
  ```

#### 10. 获取用户总数
- **URL**：`GET /users/count`
- **描述**：获取系统中用户的总数
- **响应示例**：
  ```json
  {
    "count": 10
  }
  ```

### 错误响应
当API调用出现错误时，会返回相应的错误信息：
```json
{
  "success": false,
  "message": "错误描述"
}
```

## 开发指南

### 项目结构说明

#### 后端结构
```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/aimind/backend/
│   │   │       ├── AImindBackendApplication.java  # 启动类
│   │   │       ├── config/                        # 配置类
│   │   │       ├── controller/                    # 控制器类
│   │   │       ├── dto/                           # 数据传输对象
│   │   │       ├── entity/                        # 实体类
│   │   │       ├── repository/                    # 数据访问接口
│   │   │       └── service/                       # 业务服务类
│   │   └── resources/                             # 资源文件
│   │       ├── application.yml                    # 主配置文件
│   │       ├── application-secret.yml.example     # 密钥配置示例
│   │       └── db/migration/                      # 数据库迁移脚本
│   └── test/                                      # 测试代码
├── pom.xml                                        # Maven配置文件
└── target/                                        # 构建输出目录
```

#### 前端结构
```
frontend/
├── css/                                           # 样式文件
├── js/                                            # JavaScript文件
├── img/                                           # 图片资源
├── fonts/                                         # 字体文件
├── start.html                                     # 首页/登录页
├── home.html                                      # 主应用页面
├── chat.html                                      # AI对话页面
├── mindmap.html                                   # 思维导图页面
└── admin.html                                     # 管理页面
```

### 后端开发

#### 添加新的API接口
1. 在`dto`目录下创建数据传输对象
2. 在`entity`目录下创建实体类（如需要）
3. 在`repository`目录下创建数据访问接口
4. 在`service`目录下创建业务服务类
5. 在`controller`目录下创建控制器类

#### 数据库迁移
项目使用Flyway进行数据库迁移管理：
1. 在`src/main/resources/db/migration/`目录下创建迁移脚本
2. 脚本命名格式：`V1__description.sql`、`V2__description.sql`等
3. 启动应用时会自动执行未执行的迁移脚本

#### 代码规范
- 遵循Java命名规范
- 使用Spring Boot注解进行依赖注入
- 控制器层只处理HTTP请求和响应
- 服务层处理业务逻辑
- 数据访问层只处理数据操作

### 前端开发

#### 添加新页面
1. 在`frontend`目录下创建新的HTML文件
2. 引入必要的CSS和JavaScript文件
3. 使用Tailwind CSS进行样式设计
4. 使用原生JavaScript实现交互逻辑

#### JavaScript模块化
- 将功能模块拆分为独立的JavaScript文件
- 在HTML中通过`<script>`标签引入
- 遵循ES6语法规范

#### 样式设计
- 使用Tailwind CSS工具类进行快速开发
- 遵循项目的深色主题设计
- 保持响应式设计适配不同设备

### 测试

#### 后端测试
- 单元测试：使用JUnit进行单元测试
- 集成测试：使用Spring Boot Test进行集成测试
- 测试代码位于`src/test`目录下

#### 前端测试
- 手动测试：在浏览器中测试页面功能
- 兼容性测试：在不同浏览器中测试页面显示效果

### 部署

#### 后端部署
1. 使用Maven构建项目：
   ```bash
   mvn clean package
   ```
2. 运行生成的JAR文件：
   ```bash
   java -jar target/ai-mind-backend-1.0.0.jar
   ```

#### 前端部署
1. 将`frontend`目录下的所有文件部署到Web服务器
2. 确保后端API地址配置正确

### 贡献指南
1. Fork项目到自己的仓库
2. 创建功能分支
3. 提交代码更改
4. 发起Pull Request