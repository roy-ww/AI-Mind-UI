package com.aimind.backend.dto;

public class ChatResponse {

    private String content;
    private String model;
    private Integer tokensUsed;
    private Long responseTime;
    private LLMResponse structuredResponse;

    // 构造函数
    public ChatResponse() {}

    public ChatResponse(String content, String model, Integer tokensUsed, Long responseTime) {
        this.content = content;
        this.model = model;
        this.tokensUsed = tokensUsed;
        this.responseTime = responseTime;
    }

    public ChatResponse(String content, String model, Integer tokensUsed, Long responseTime, LLMResponse structuredResponse) {
        this.content = content;
        this.model = model;
        this.tokensUsed = tokensUsed;
        this.responseTime = responseTime;
        this.structuredResponse = structuredResponse;
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

    public LLMResponse getStructuredResponse() {
        return structuredResponse;
    }

    public void setStructuredResponse(LLMResponse structuredResponse) {
        this.structuredResponse = structuredResponse;
    }
}
