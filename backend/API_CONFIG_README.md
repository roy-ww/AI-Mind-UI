# API配置说明

## 配置API Key

为了使用大模型功能，需要配置阿里百炼的API Key。

### 步骤

1. **复制配置文件**
   ```bash
   cp src/main/resources/application-secret.yml.example src/main/resources/application-secret.yml
   ```

2. **获取API Key**
   - 访问 [阿里百炼控制台](https://dashscope.aliyuncs.com/)
   - 注册/登录账号
   - 创建API Key

3. **配置API Key和提示词**
   编辑 `src/main/resources/application-secret.yml` 文件：
   ```yaml
   llm:
     api:
       bailian:
         api-key: "your-actual-api-key-here"
     
     prompt:
       system: |
         你是一个智能助手，请根据用户的问题提供准确、有用的回答。
         # 可以自定义系统提示词
   ```

4. **重启应用**
   配置完成后重启Spring Boot应用即可。

### 安全说明

- `application-secret.yml` 文件已添加到 `.gitignore`，不会被提交到代码仓库
- 请勿将真实的API Key提交到版本控制系统
- 建议定期轮换API Key以确保安全

### 提示词配置

系统提示词控制AI助手的行为和回答风格。你可以根据需要自定义：

1. **默认提示词**：如果未配置，系统会使用简单的默认提示词
2. **自定义提示词**：在配置文件中修改 `llm.prompt.system` 字段
3. **多行文本**：使用 YAML 的 `|` 语法支持多行提示词
4. **热更新**：修改提示词后需要重启应用

### 故障排除

如果遇到 "API Key未配置" 错误，请检查：
1. 配置文件是否存在
2. API Key是否正确设置
3. 配置文件格式是否正确
4. 应用是否已重启

如果AI回答不符合预期，请检查：
1. 提示词是否正确配置
2. 提示词格式是否正确（注意YAML缩进）
3. 应用是否已重启
