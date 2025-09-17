package com.aimind.backend.dto;

import java.time.LocalDateTime;

public class UserResponse {
    
    private String uid;
    private String username;
    private String nickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 默认构造函数
    public UserResponse() {}
    
    // 带参数的构造函数
    public UserResponse(String uid, String username, String nickname, 
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.uid = uid;
        this.username = username;
        this.nickname = nickname;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
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
    
    @Override
    public String toString() {
        return "UserResponse{" +
                "uid='" + uid + '\'' +
                ", username='" + username + '\'' +
                ", nickname='" + nickname + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
