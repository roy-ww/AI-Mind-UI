package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateMindSpaceRequest {
    
    @NotBlank(message = "根节点标题不能为空")
    private String rootTitle;
    
    private String rootBody;
    
    public CreateMindSpaceRequest() {}
    
    public CreateMindSpaceRequest(String rootTitle, String rootBody) {
        this.rootTitle = rootTitle;
        this.rootBody = rootBody;
    }
    
    public String getRootTitle() {
        return rootTitle;
    }
    
    public void setRootTitle(String rootTitle) {
        this.rootTitle = rootTitle;
    }
    
    public String getRootBody() {
        return rootBody;
    }
    
    public void setRootBody(String rootBody) {
        this.rootBody = rootBody;
    }
}
