package com.aimind.backend.dto;

import com.aimind.backend.entity.Node;
import java.time.LocalDateTime;
import java.util.List;

public class MindSpaceResponse {
    
    private String mindId;
    private String uid;
    private String mindName;
    private String mindConcepts;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Node rootNode;
    private List<Node> nodes;
    
    // 默认构造函数
    public MindSpaceResponse() {}
    
    // 带参数的构造函数
    public MindSpaceResponse(String mindId, String uid, String mindName, String mindConcepts, 
                           LocalDateTime createTime, LocalDateTime updateTime, 
                           Node rootNode, List<Node> nodes) {
        this.mindId = mindId;
        this.uid = uid;
        this.mindName = mindName;
        this.mindConcepts = mindConcepts;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.rootNode = rootNode;
        this.nodes = nodes;
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
    
    @Override
    public String toString() {
        return "MindSpaceResponse{" +
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
