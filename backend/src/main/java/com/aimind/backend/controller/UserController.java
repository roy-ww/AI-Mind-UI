package com.aimind.backend.controller;

import com.aimind.backend.dto.CreateUserRequest;
import com.aimind.backend.dto.LoginRequest;
import com.aimind.backend.dto.LoginResponse;
import com.aimind.backend.dto.UpdateUserRequest;
import com.aimind.backend.dto.UserResponse;
import com.aimind.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    /**
     * 创建新用户
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            UserResponse response = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("创建用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据UID获取用户
     */
    @GetMapping("/{uid}")
    public ResponseEntity<?> getUserByUid(@PathVariable String uid) {
        try {
            Optional<UserResponse> response = userService.getUserByUid(uid);
            if (response.isPresent()) {
                return ResponseEntity.ok(response.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据用户名获取用户
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            Optional<UserResponse> response = userService.getUserByUsername(username);
            if (response.isPresent()) {
                return ResponseEntity.ok(response.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有用户
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponse> response = userService.getAllUsers();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取用户列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据用户名搜索用户
     */
    @GetMapping("/search/username")
    public ResponseEntity<?> searchUsersByUsername(@RequestParam String username) {
        try {
            List<UserResponse> response = userService.searchUsersByUsername(username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("搜索用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据昵称搜索用户
     */
    @GetMapping("/search/nickname")
    public ResponseEntity<?> searchUsersByNickname(@RequestParam String nickname) {
        try {
            List<UserResponse> response = userService.searchUsersByNickname(nickname);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("搜索用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/{uid}")
    public ResponseEntity<?> updateUser(@PathVariable String uid, 
                                      @Valid @RequestBody UpdateUserRequest request) {
        try {
            UserResponse response = userService.updateUser(uid, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("更新用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/{uid}")
    public ResponseEntity<?> deleteUser(@PathVariable String uid) {
        try {
            userService.deleteUser(uid);
            return ResponseEntity.ok().body("用户删除成功");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("删除用户失败: " + e.getMessage());
        }
    }
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户是否存在
     */
    @GetMapping("/{uid}/exists")
    public ResponseEntity<?> checkUserExists(@PathVariable String uid) {
        try {
            boolean exists = userService.existsByUid(uid);
            return ResponseEntity.ok().body("{\"exists\": " + exists + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("检查用户存在性失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户名是否存在
     */
    @GetMapping("/username/{username}/exists")
    public ResponseEntity<?> checkUsernameExists(@PathVariable String username) {
        try {
            boolean exists = userService.existsByUsername(username);
            return ResponseEntity.ok().body("{\"exists\": " + exists + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("检查用户名存在性失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取用户总数
     */
    @GetMapping("/count")
    public ResponseEntity<?> getUserCount() {
        try {
            long count = userService.getUserCount();
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取用户总数失败: " + e.getMessage());
        }
    }
}
