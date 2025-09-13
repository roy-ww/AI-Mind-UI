package com.aimind.backend.controller;

import com.aimind.backend.dto.CreateNodeRequest;
import com.aimind.backend.dto.NodeResponse;
import com.aimind.backend.dto.UpdateNodeRequest;
import com.aimind.backend.service.NodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nodes")
@CrossOrigin(origins = "*")
public class NodeController {
    
    @Autowired
    private NodeService nodeService;
    
    /**
     * 创建思维空间
     */
    @PostMapping("/mind-space")
    public ResponseEntity<NodeResponse> createMindSpace(@RequestParam String mindId) {
        try {
            NodeResponse response = nodeService.createMindSpace(mindId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 创建节点
     */
    @PostMapping
    public ResponseEntity<NodeResponse> createNode(@Valid @RequestBody CreateNodeRequest request) {
        try {
            NodeResponse response = nodeService.createNode(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 获取所有节点
     */
    @GetMapping
    public ResponseEntity<List<NodeResponse>> getAllNodes() {
        try {
            List<NodeResponse> responses = nodeService.getAllNodes();
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 根据ID获取节点
     */
    @GetMapping("/{id}")
    public ResponseEntity<NodeResponse> getNodeById(@PathVariable Long id) {
        try {
            NodeResponse response = nodeService.getNodeById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 根据思维空间ID和节点ID获取节点
     */
    @GetMapping("/mind/{mindId}/node/{nodeId}")
    public ResponseEntity<NodeResponse> getNodeByMindIdAndNodeId(
            @PathVariable String mindId, 
            @PathVariable String nodeId) {
        try {
            NodeResponse response = nodeService.getNodeByMindIdAndNodeId(mindId, nodeId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 获取思维空间下的所有节点
     */
    @GetMapping("/mind/{mindId}")
    public ResponseEntity<List<NodeResponse>> getNodesByMindId(@PathVariable String mindId) {
        try {
            List<NodeResponse> responses = nodeService.getNodesByMindId(mindId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 获取子节点
     */
    @GetMapping("/mind/{mindId}/parent/{parentId}")
    public ResponseEntity<List<NodeResponse>> getChildNodes(
            @PathVariable String mindId, 
            @PathVariable String parentId) {
        try {
            List<NodeResponse> responses = nodeService.getChildNodes(mindId, parentId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 更新节点
     */
    @PutMapping("/{id}")
    public ResponseEntity<NodeResponse> updateNode(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateNodeRequest request) {
        try {
            NodeResponse response = nodeService.updateNode(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 删除节点
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable Long id) {
        try {
            nodeService.deleteNode(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 删除思维空间
     */
    @DeleteMapping("/mind/{mindId}")
    public ResponseEntity<Void> deleteMindSpace(@PathVariable String mindId) {
        try {
            nodeService.deleteMindSpace(mindId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 生成节点ID
     */
    @GetMapping("/generate-node-id")
    public ResponseEntity<String> generateNodeId() {
        String nodeId = nodeService.generateNodeId();
        return ResponseEntity.ok(nodeId);
    }
}