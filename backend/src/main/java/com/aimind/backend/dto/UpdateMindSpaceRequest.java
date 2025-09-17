package com.aimind.backend.dto;

import jakarta.validation.constraints.Size;

public class UpdateMindSpaceRequest {
    
    @Size(max = 255, message = "思维空间名称长度不能超过255个字符")
    private String mindName;
    
    @Size(max = 1000, message = "思维概念长度不能超过1000个字符")
    private String mindConcepts;
    
    // 默认构造函数
    public UpdateMindSpaceRequest() {}
    
    // 带参数的构造函数
    public UpdateMindSpaceRequest(String mindName, String mindConcepts) {
        this.mindName = mindName;
        this.mindConcepts = mindConcepts;
    }
    
    // Getters and Setters
    public String getMindName() {
        return mindName;
    }
    
    public void setMindName(String mindName) {
        this.mindName = mindName;
    }
    
    public String getMindConcepts() {
        return mindConcepts;
    }
    
    public void setMindConcepts(String mindConcepts) {
        this.mindConcepts = mindConcepts;
    }
    
    
    @Override
    public String toString() {
        return "UpdateMindSpaceRequest{" +
                "mindName='" + mindName + '\'' +
                ", mindConcepts='" + mindConcepts + '\'' +
                '}';
    }
}
