package com.aimind.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "mind_spaces")
public class MindSpace {
    
    @Id
    @Column(name = "mind_id", length = 36)
    private String mindId;
    
    @Column(name = "uid", nullable = false, length = 36)
    @NotBlank(message = "用户ID不能为空")
    private String uid;
    
    @Column(name = "mind_name", nullable = false, length = 255)
    private String mindName;
    
    @Column(name = "mind_concepts", columnDefinition = "TEXT")
    private String mindConcepts;
    
    @Column(name = "create_time", nullable = false)
    private LocalDateTime createTime;
    
    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;
    
    // 关联的根节点（通过查询获取）
    @Transient
    private Node rootNode;
    
    // 关联的所有节点（通过查询获取）
    @Transient
    private List<Node> nodes = new ArrayList<>();
    
    // 默认构造函数
    public MindSpace() {
        this.mindId = UUID.randomUUID().toString();
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }
    
    // 带参数的构造函数
    public MindSpace(String uid, String mindName, String mindConcepts) {
        this();
        this.uid = uid;
        this.mindName = mindName;
        this.mindConcepts = mindConcepts;
    }
    
    // Getters and Setters
    public String getMindId() {
        return mindId;
    }
    
    public void setMindId(String mindId) {
        this.mindId = mindId;
    }
    
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public String getMindName() {
        return mindName;
    }
    
    public void setMindName(String mindName) {
        this.mindName = mindName;
    }
    
    public String getMindConcepts() {
        return mindConcepts;
    }
    
    public void setMindConcepts(String mindConcepts) {
        this.mindConcepts = mindConcepts;
    }
    
    public Node getRootNode() {
        return rootNode;
    }
    
    public void setRootNode(Node rootNode) {
        this.rootNode = rootNode;
    }
    
    public List<Node> getNodes() {
        return nodes;
    }
    
    public void setNodes(List<Node> nodes) {
        this.nodes = nodes;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
    
    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
    
    // 更新修改时间的方法
    @PreUpdate
    public void preUpdate() {
        this.updateTime = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "MindSpace{" +
                "mindId='" + mindId + '\'' +
                ", uid='" + uid + '\'' +
                ", mindName='" + mindName + '\'' +
                ", mindConcepts='" + mindConcepts + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", rootNode=" + (rootNode != null ? rootNode.getNodeId() : "null") +
                ", nodesCount=" + (nodes != null ? nodes.size() : 0) +
                '}';
    }
}
