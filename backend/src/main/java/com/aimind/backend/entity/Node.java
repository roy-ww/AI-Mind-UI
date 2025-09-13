package com.aimind.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "nodes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"mind_id", "node_id"}))
public class Node {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "mind_id", nullable = false)
    @NotBlank(message = "思维空间ID不能为空")
    private String mindId;
    
    @Column(name = "parent_id")
    private String parentId;
    
    @Column(name = "node_id", nullable = false)
    @NotBlank(message = "节点ID不能为空")
    private String nodeId;
    
    @Column(name = "title", nullable = false, length = 500)
    @NotBlank(message = "标题不能为空")
    private String title;
    
    @Column(name = "body", columnDefinition = "TEXT")
    private String body;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // 构造函数
    public Node() {}
    
    public Node(String mindId, String parentId, String nodeId, String title, String body) {
        this.mindId = mindId;
        this.parentId = parentId;
        this.nodeId = nodeId;
        this.title = title;
        this.body = body;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMindId() {
        return mindId;
    }
    
    public void setMindId(String mindId) {
        this.mindId = mindId;
    }
    
    public String getParentId() {
        return parentId;
    }
    
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
    
    public String getNodeId() {
        return nodeId;
    }
    
    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
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
}