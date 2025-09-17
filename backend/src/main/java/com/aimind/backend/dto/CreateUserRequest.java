package com.aimind.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateUserRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度必须在3-50个字符之间")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度至少6个字符")
    private String password;
    
    @Size(max = 100, message = "昵称长度不能超过100个字符")
    private String nickname;
    
    // 默认构造函数
    public CreateUserRequest() {}
    
    // 带参数的构造函数
    public CreateUserRequest(String username, String password, String nickname) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
    }
    
    // Getters and Setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getNickname() {
        return nickname;
    }
    
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }
    
    @Override
    public String toString() {
        return "CreateUserRequest{" +
                "username='" + username + '\'' +
                ", nickname='" + nickname + '\'' +
                '}';
    }
}
