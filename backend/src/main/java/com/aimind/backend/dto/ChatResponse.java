package com.aimind.backend.dto;

public class ChatResponse {

    private String content;
    private String model;
    private Integer tokensUsed;
    private Long responseTime;

    // 构造函数
    public ChatResponse() {}

    public ChatResponse(String content, String model, Integer tokensUsed, Long responseTime) {
        this.content = content;
        this.model = model;
        this.tokensUsed = tokensUsed;
        this.responseTime = responseTime;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getTokensUsed() {
        return tokensUsed;
    }

    public void setTokensUsed(Integer tokensUsed) {
        this.tokensUsed = tokensUsed;
    }

    public Long getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(Long responseTime) {
        this.responseTime = responseTime;
    }
}
