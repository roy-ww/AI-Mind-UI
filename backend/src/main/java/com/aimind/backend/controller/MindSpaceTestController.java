package com.aimind.backend.controller;

import com.aimind.backend.dto.CreateMindSpaceRequest;
import com.aimind.backend.dto.MindSpaceResponse;
import com.aimind.backend.service.MindSpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test/mind-spaces")
@CrossOrigin(origins = "*")
public class MindSpaceTestController {
    
    @Autowired
    private MindSpaceService mindSpaceService;
    
    /**
     * 创建测试思维空间
     */
    @PostMapping("/create-test")
    public ResponseEntity<?> createTestMindSpace() {
        try {
            CreateMindSpaceRequest request = new CreateMindSpaceRequest();
            request.setUid("test-user-uid"); // 需要提供用户ID
            request.setMindName("测试思维空间");
            request.setMindConcepts("测试, 概念, 思维导图");
            
            MindSpaceResponse response = mindSpaceService.createMindSpace(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("创建测试思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有思维空间（用于测试）
     */
    @GetMapping("/list")
    public ResponseEntity<?> listAllMindSpaces() {
        try {
            List<MindSpaceResponse> response = mindSpaceService.getAllMindSpaces();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取思维空间列表失败: " + e.getMessage());
        }
    }
}
