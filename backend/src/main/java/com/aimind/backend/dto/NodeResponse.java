package com.aimind.backend.dto;

import com.aimind.backend.entity.Node;
import java.time.LocalDateTime;

public class NodeResponse {
    
    private Long id;
    private String mindId;
    private String parentId;
    private String nodeId;
    private String title;
    private String body;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 构造函数
    public NodeResponse() {}
    
    public NodeResponse(Node node) {
        this.id = node.getId();
        this.mindId = node.getMindId();
        this.parentId = node.getParentId();
        this.nodeId = node.getNodeId();
        this.title = node.getTitle();
        this.body = node.getBody();
        this.createdAt = node.getCreatedAt();
        this.updatedAt = node.getUpdatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
