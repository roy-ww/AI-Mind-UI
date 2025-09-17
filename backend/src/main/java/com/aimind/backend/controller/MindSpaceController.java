package com.aimind.backend.controller;

import com.aimind.backend.dto.CreateMindSpaceRequest;
import com.aimind.backend.dto.MindSpaceResponse;
import com.aimind.backend.dto.UpdateMindSpaceRequest;
import com.aimind.backend.service.MindSpaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mind-spaces")
@CrossOrigin(origins = "*")
public class MindSpaceController {
    
    @Autowired
    private MindSpaceService mindSpaceService;
    
    /**
     * 创建新的思维空间
     */
    @PostMapping
    public ResponseEntity<?> createMindSpace(@Valid @RequestBody CreateMindSpaceRequest request) {
        try {
            MindSpaceResponse response = mindSpaceService.createMindSpace(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("创建思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID获取思维空间
     */
    @GetMapping("/{mindId}")
    public ResponseEntity<?> getMindSpaceById(@PathVariable String mindId) {
        try {
            Optional<MindSpaceResponse> response = mindSpaceService.getMindSpaceById(mindId);
            if (response.isPresent()) {
                return ResponseEntity.ok(response.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有思维空间
     */
    @GetMapping
    public ResponseEntity<?> getAllMindSpaces() {
        try {
            List<MindSpaceResponse> response = mindSpaceService.getAllMindSpaces();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取思维空间列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据用户ID获取思维空间
     */
    @GetMapping("/user/{uid}")
    public ResponseEntity<?> getMindSpacesByUid(@PathVariable String uid) {
        try {
            List<MindSpaceResponse> response = mindSpaceService.getMindSpacesByUid(uid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取用户思维空间列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据名称搜索思维空间
     */
    @GetMapping("/search/name")
    public ResponseEntity<?> searchMindSpacesByName(@RequestParam String name) {
        try {
            List<MindSpaceResponse> response = mindSpaceService.searchMindSpacesByName(name);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("搜索思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据概念搜索思维空间
     */
    @GetMapping("/search/concept")
    public ResponseEntity<?> searchMindSpacesByConcept(@RequestParam String concept) {
        try {
            List<MindSpaceResponse> response = mindSpaceService.searchMindSpacesByConcept(concept);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("搜索思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新思维空间
     */
    @PutMapping("/{mindId}")
    public ResponseEntity<?> updateMindSpace(@PathVariable String mindId, 
                                           @Valid @RequestBody UpdateMindSpaceRequest request) {
        try {
            MindSpaceResponse response = mindSpaceService.updateMindSpace(mindId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("更新思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除思维空间
     */
    @DeleteMapping("/{mindId}")
    public ResponseEntity<?> deleteMindSpace(@PathVariable String mindId) {
        try {
            mindSpaceService.deleteMindSpace(mindId);
            return ResponseEntity.ok().body("思维空间删除成功");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("错误: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("删除思维空间失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查思维空间是否存在
     */
    @GetMapping("/{mindId}/exists")
    public ResponseEntity<?> checkMindSpaceExists(@PathVariable String mindId) {
        try {
            boolean exists = mindSpaceService.existsById(mindId);
            return ResponseEntity.ok().body("{\"exists\": " + exists + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("检查思维空间存在性失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取思维空间总数
     */
    @GetMapping("/count")
    public ResponseEntity<?> getMindSpaceCount() {
        try {
            long count = mindSpaceService.getMindSpaceCount();
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("获取思维空间总数失败: " + e.getMessage());
        }
    }
    
}
