package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GenerateNodeRequest {
    
    @NotBlank(message = "父节点ID不能为空")
    private String parentId;
    
    @NotBlank(message = "节点标题不能为空")
    private String title;
    
    public GenerateNodeRequest() {}
    
    public GenerateNodeRequest(String parentId, String title) {
        this.parentId = parentId;
        this.title = title;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
}
