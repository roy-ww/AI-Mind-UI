package com.aimind.backend.controller;

import com.aimind.backend.dto.CreateUserRequest;
import com.aimind.backend.dto.LoginRequest;
import com.aimind.backend.dto.UserResponse;
import com.aimind.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test/users")
@CrossOrigin(origins = "*")
public class UserTestController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 创建测试用户
     */
    @PostMapping("/create-test")
    public ResponseEntity<?> createTestUser() {
        try {
            CreateUserRequest request = new CreateUserRequest();
            request.setUsername("testuser");
            request.setPassword("password123");
            request.setNickname("测试用户");
            
            UserResponse response = userService.createUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("创建测试用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 测试用户登录
     */
    @PostMapping("/login-test")
    public ResponseEntity<?> testLogin() {
        try {
            LoginRequest request = new LoginRequest();
            request.setUsername("testuser");
            request.setPassword("password123");
            
            return ResponseEntity.ok(userService.login(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("测试登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有用户（用于测试）
     */
    @GetMapping("/list")
    public ResponseEntity<?> listAllUsers() {
        try {
            List<UserResponse> response = userService.getAllUsers();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取用户列表失败: " + e.getMessage());
        }
    }
}
