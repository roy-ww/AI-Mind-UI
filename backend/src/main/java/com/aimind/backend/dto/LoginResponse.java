package com.aimind.backend.dto;

import java.time.LocalDateTime;

public class LoginResponse {
    
    private boolean success;
    private String message;
    private String uid;
    private String username;
    private String nickname;
    private LocalDateTime loginTime;
    
    // 默认构造函数
    public LoginResponse() {}
    
    // 成功登录构造函数
    public LoginResponse(boolean success, String message, String uid, 
                        String username, String nickname, LocalDateTime loginTime) {
        this.success = success;
        this.message = message;
        this.uid = uid;
        this.username = username;
        this.nickname = nickname;
        this.loginTime = loginTime;
    }
    
    // 失败登录构造函数
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
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
    
    public LocalDateTime getLoginTime() {
        return loginTime;
    }
    
    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }
    
    @Override
    public String toString() {
        return "LoginResponse{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", uid='" + uid + '\'' +
                ", username='" + username + '\'' +
                ", nickname='" + nickname + '\'' +
                ", loginTime=" + loginTime +
                '}';
    }
}
