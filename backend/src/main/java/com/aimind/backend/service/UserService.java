package com.aimind.backend.service;

import com.aimind.backend.dto.CreateUserRequest;
import com.aimind.backend.dto.LoginRequest;
import com.aimind.backend.dto.LoginResponse;
import com.aimind.backend.dto.UpdateUserRequest;
import com.aimind.backend.dto.UserResponse;
import com.aimind.backend.entity.User;
import com.aimind.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 创建新用户
     */
    public UserResponse createUser(CreateUserRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("用户名已存在: " + request.getUsername());
        }
        
        // 检查昵称是否已存在（如果提供了昵称）
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("昵称已存在: " + request.getNickname());
            }
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 加密密码
        user.setNickname(request.getNickname());
        
        // 保存到数据库
        User savedUser = userRepository.save(user);
        
        return convertToResponse(savedUser);
    }
    
    /**
     * 根据UID获取用户
     */
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserByUid(String uid) {
        return userRepository.findById(uid)
                .map(this::convertToResponse);
    }
    
    /**
     * 根据用户名获取用户
     */
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::convertToResponse);
    }
    
    /**
     * 获取所有用户
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据用户名搜索用户
     */
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsersByUsername(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据昵称搜索用户
     */
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsersByNickname(String nickname) {
        return userRepository.findByNicknameContainingIgnoreCase(nickname)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 更新用户信息
     */
    public UserResponse updateUser(String uid, UpdateUserRequest request) {
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + uid));
        
        // 检查用户名是否与其他用户冲突
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("用户名已存在: " + request.getUsername());
            }
        }
        
        // 检查昵称是否与其他用户冲突
        if (request.getNickname() != null && !request.getNickname().equals(user.getNickname())) {
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("昵称已存在: " + request.getNickname());
            }
        }
        
        // 更新字段
        if (request.getUsername() != null) {
            user.setUsername(request.getUsername());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword())); // 加密新密码
        }
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        
        // 更新修改时间
        user.setUpdatedAt(LocalDateTime.now());
        
        // 保存更新
        User updatedUser = userRepository.save(user);
        
        return convertToResponse(updatedUser);
    }
    
    /**
     * 删除用户
     */
    public void deleteUser(String uid) {
        if (!userRepository.existsById(uid)) {
            throw new IllegalArgumentException("用户不存在: " + uid);
        }
        
        userRepository.deleteById(uid);
    }
    
    /**
     * 用户登录
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            // 查找用户
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            
            if (userOpt.isEmpty()) {
                return new LoginResponse(false, "用户名或密码错误");
            }
            
            User user = userOpt.get();
            
            // 验证密码
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return new LoginResponse(false, "用户名或密码错误");
            }
            
            // 登录成功
            return new LoginResponse(
                true, 
                "登录成功", 
                user.getUid(), 
                user.getUsername(), 
                user.getNickname(), 
                LocalDateTime.now()
            );
            
        } catch (Exception e) {
            return new LoginResponse(false, "登录失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsByUid(String uid) {
        return userRepository.existsById(uid);
    }
    
    /**
     * 检查用户名是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * 获取用户总数
     */
    @Transactional(readOnly = true)
    public long getUserCount() {
        return userRepository.count();
    }
    
    /**
     * 将User实体转换为UserResponse
     */
    private UserResponse convertToResponse(User user) {
        return new UserResponse(
                user.getUid(),
                user.getUsername(),
                user.getNickname(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
