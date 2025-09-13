package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateNodeRequest {
    
    @NotBlank(message = "标题不能为空")
    private String title;
    
    private String body;
    
    // 构造函数
    public UpdateNodeRequest() {}
    
    public UpdateNodeRequest(String title, String body) {
        this.title = title;
        this.body = body;
    }
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
}