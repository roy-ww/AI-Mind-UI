package com.aimind.backend.service;

import com.aimind.backend.dto.ChatRequest;
import com.aimind.backend.dto.ChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LLMService {

    @Autowired
    private WebClient.Builder webClientBuilder;

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
            if (!MODEL_CONFIG.containsKey(request.getModel())) {
                throw new RuntimeException("不支持的模型: " + request.getModel() + 
                    "，支持的模型: " + String.join(", ", MODEL_CONFIG.keySet()));
            }
            
            String response = callBailianAPI(request);
            long responseTime = System.currentTimeMillis() - startTime;
            
            return new ChatResponse(response, request.getModel(), null, responseTime);
            
        } catch (Exception e) {
            throw new RuntimeException("调用大模型API失败: " + e.getMessage(), e);
        }
    }

    private String callBailianAPI(ChatRequest request) {
        try {
            // 获取实际模型名称
            String actualModel = MODEL_CONFIG.get(request.getModel());
            
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", actualModel);
            requestBody.put("messages", buildMessages(request));
            requestBody.put("temperature", request.getTemperature());
            requestBody.put("max_tokens", 2000);
            requestBody.put("stream", false);

            WebClient webClient = webClientBuilder.build();
            
            String response = webClient.post()
                .uri(BAILIAN_API_URL)
                .header("Authorization", "Bearer " + request.getApiKey())
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
        systemMessage.put("content", "你是一个有用的AI助手，请用中文回答用户的问题。");
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
