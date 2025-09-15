package com.aimind.backend.service;

import com.aimind.backend.dto.ChatRequest;
import com.aimind.backend.dto.ChatResponse;
import com.aimind.backend.dto.LLMResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LLMService {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @Value("${llm.model:qwen-turbo}")
    private String defaultModel;

    @Value("${llm.temperature:0.7}")
    private Double defaultTemperature;

    @Value("${llm.api.bailian.api-key:}")
    private String bailianApiKey;

    @Value("${llm.prompt.system:}")
    private String systemPrompt;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 阿里百炼平台API配置
    private static final String BAILIAN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
    
    // 支持的模型配置
    private static final Map<String, String> MODEL_CONFIG = Map.of(
        "qwen-turbo", "qwen-turbo",
        "qwen-plus", "qwen-plus", 
        "kimi", "Moonshot-Kimi-K2-Instruct"
    );

    public ChatResponse chat(ChatRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            // 验证模型是否支持
            if (!MODEL_CONFIG.containsKey(defaultModel)) {
                throw new RuntimeException("不支持的模型: " + defaultModel + 
                    "，支持的模型: " + String.join(", ", MODEL_CONFIG.keySet()));
            }
            
            String response = callBailianAPI(request);
            long responseTime = System.currentTimeMillis() - startTime;
            
            // 尝试解析JSON响应为结构化对象
            LLMResponse structuredResponse = null;
            try {
                structuredResponse = objectMapper.readValue(response, LLMResponse.class);
                System.out.println("成功解析大模型响应为结构化对象: " + structuredResponse);
            } catch (Exception parseException) {
                System.out.println("无法解析大模型响应为JSON格式，使用原始文本: " + parseException.getMessage());
                // 如果解析失败，structuredResponse保持为null，使用原始文本
            }
            
            return new ChatResponse(response, defaultModel, null, responseTime, structuredResponse);
            
        } catch (Exception e) {
            throw new RuntimeException("调用大模型API失败: " + e.getMessage(), e);
        }
    }

    private String callBailianAPI(ChatRequest request) {
        try {
            // 检查API Key是否配置
            if (bailianApiKey == null || bailianApiKey.trim().isEmpty()) {
                throw new RuntimeException("阿里百炼API Key未配置，请在application-secret.yml中设置llm.api.bailian.api-key");
            }
            
            // 获取实际模型名称
            String actualModel = MODEL_CONFIG.get(defaultModel);
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", actualModel);
            requestBody.put("messages", buildMessages(request));
            requestBody.put("temperature", defaultTemperature);
            requestBody.put("max_tokens", 2000);
            requestBody.put("stream", false);

            WebClient webClient = webClientBuilder.build();
            
            String response = webClient.post()
                .uri(BAILIAN_API_URL)
                .header("Authorization", "Bearer " + bailianApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(30))
                .block();

            // 解析响应
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // 检查是否有错误
            if (jsonNode.has("error")) {
                JsonNode error = jsonNode.get("error");
                String errorMessage = error.has("message") ? 
                    error.get("message").asText() : "API调用失败";
                throw new RuntimeException("阿里百炼API错误: " + errorMessage);
            }
            
            // 解析成功响应
            JsonNode choices = jsonNode.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.get("message");
                if (message != null && message.has("content")) {
                    System.err.println("阿里百炼API响应: " + message.get("content").asText());
                    return message.get("content").asText();
                }
            }
            
            throw new RuntimeException("阿里百炼API响应格式错误");
            
        } catch (Exception e) {
            throw new RuntimeException("调用阿里百炼API失败: " + e.getMessage(), e);
        }
    }

    private List<Map<String, String>> buildMessages(ChatRequest request) {
        List<Map<String, String>> messages = new java.util.ArrayList<>();
        
        // 添加系统提示
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        
        // 使用配置文件中的提示词，如果未配置则使用默认值
        String prompt = systemPrompt;
        if (prompt == null || prompt.trim().isEmpty()) {
            prompt = "你是一个智能助手，请根据用户的问题提供准确、有用的回答。";
        }
        
        systemMessage.put("content", prompt);
        messages.add(systemMessage);
        
        // 添加对话历史
        if (request.getConversationHistory() != null) {
            for (ChatRequest.ChatMessage chatMessage : request.getConversationHistory()) {
                Map<String, String> message = new HashMap<>();
                message.put("role", chatMessage.getRole());
                message.put("content", chatMessage.getContent());
                messages.add(message);
            }
        }
        
        // 添加当前消息
        Map<String, String> currentMessage = new HashMap<>();
        currentMessage.put("role", "user");
        currentMessage.put("content", request.getMessage());
        messages.add(currentMessage);
        
        return messages;
    }
}
