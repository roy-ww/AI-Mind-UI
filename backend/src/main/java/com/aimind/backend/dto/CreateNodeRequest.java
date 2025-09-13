package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateNodeRequest {
    
    @NotBlank(message = "思维空间ID不能为空")
    private String mindId;
    
    private String parentId;
    
    @NotBlank(message = "节点ID不能为空")
    private String nodeId;
    
    @NotBlank(message = "标题不能为空")
    private String title;
    
    private String body;
    
    // 构造函数
    public CreateNodeRequest() {}
    
    public CreateNodeRequest(String mindId, String parentId, String nodeId, String title, String body) {
        this.mindId = mindId;
        this.parentId = parentId;
        this.nodeId = nodeId;
        this.title = title;
        this.body = body;
    }
    
    // Getters and Setters
    public String getMindId() {
        return mindId;
    }
    
    public void setMindId(String mindId) {
        this.mindId = mindId;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    
    public String getNodeId() {
        return nodeId;
    }
    
    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }
    
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