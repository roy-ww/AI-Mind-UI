package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ChatRequest {

    @NotBlank(message = "模型不能为空")
    private String model;

    @NotBlank(message = "消息不能为空")
    private String message;

    @NotBlank(message = "API Key不能为空")
    private String apiKey;

    @NotNull(message = "温度参数不能为空")
    private Double temperature;

    private List<ChatMessage> conversationHistory;

    // 构造函数
    public ChatRequest() {}

    public ChatRequest(String model, String message, String apiKey, Double temperature, List<ChatMessage> conversationHistory) {
        this.model = model;
        this.message = message;
        this.apiKey = apiKey;
        this.temperature = temperature;
        this.conversationHistory = conversationHistory;
    }

    // Getters and Setters
    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public List<ChatMessage> getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(List<ChatMessage> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }

    // 内部类
    public static class ChatMessage {
        private String role;
        private String content;

        public ChatMessage() {}

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
