package com.aimind.backend.service;

import com.aimind.backend.dto.CreateNodeRequest;
import com.aimind.backend.dto.NodeResponse;
import com.aimind.backend.dto.UpdateNodeRequest;
import com.aimind.backend.entity.Node;
import com.aimind.backend.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class NodeService {
    
    @Autowired
    private NodeRepository nodeRepository;
    
    /**
     * 创建思维空间（创建根节点）
     */
    public NodeResponse createMindSpace(String mindId) {
        // 检查思维空间是否已存在
        if (nodeRepository.existsByMindIdAndNodeId(mindId, "root")) {
            throw new RuntimeException("思维空间已存在: " + mindId);
        }
        
        // 创建根节点
        Node rootNode = new Node(mindId, null, "root", "根节点", "这是思维导图的根节点");
        Node savedNode = nodeRepository.save(rootNode);
        
        return new NodeResponse(savedNode);
    }
    
    /**
     * 创建节点
     */
    public NodeResponse createNode(CreateNodeRequest request) {
        // 检查节点是否已存在
        if (nodeRepository.existsByMindIdAndNodeId(request.getMindId(), request.getNodeId())) {
            throw new RuntimeException("节点已存在: " + request.getNodeId());
        }

        // 如果要创建根节点（parentId为null或空），检查该思维空间是否已有根节点
        if (request.getParentId() == null || request.getParentId().isEmpty()) {
            Optional<Node> existingRoot = nodeRepository.findRootNodeByMindId(request.getMindId());
            if (existingRoot.isPresent()) {
                throw new RuntimeException("思维空间已存在根节点，不能创建多个根节点");
            }
        } else {
            // 如果有父节点，验证父节点是否存在
            Optional<Node> parentNode = nodeRepository.findByMindIdAndNodeId(
                request.getMindId(), request.getParentId());
            if (parentNode.isEmpty()) {
                throw new RuntimeException("父节点不存在: " + request.getParentId());
            }
        }

        Node node = new Node(
            request.getMindId(),
            request.getParentId(),
            request.getNodeId(),
            request.getTitle(),
            request.getBody()
        );

        Node savedNode = nodeRepository.save(node);
        return new NodeResponse(savedNode);
    }
    
    /**
     * 获取所有节点
     */
    @Transactional(readOnly = true)
    public List<NodeResponse> getAllNodes() {
        List<Node> nodes = nodeRepository.findAll();
        return nodes.stream()
            .map(NodeResponse::new)
            .collect(Collectors.toList());
    }
    
    /**
     * 根据ID获取节点
     */
    @Transactional(readOnly = true)
    public NodeResponse getNodeById(Long id) {
        Node node = nodeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("节点不存在: " + id));
        return new NodeResponse(node);
    }
    
    /**
     * 根据思维空间ID和节点ID获取节点
     */
    @Transactional(readOnly = true)
    public NodeResponse getNodeByMindIdAndNodeId(String mindId, String nodeId) {
        Node node = nodeRepository.findByMindIdAndNodeId(mindId, nodeId)
            .orElseThrow(() -> new RuntimeException("节点不存在: " + nodeId));
        return new NodeResponse(node);
    }
    
    /**
     * 获取思维空间下的所有节点
     */
    @Transactional(readOnly = true)
    public List<NodeResponse> getNodesByMindId(String mindId) {
        List<Node> nodes = nodeRepository.findByMindId(mindId);
        return nodes.stream()
            .map(NodeResponse::new)
            .collect(Collectors.toList());
    }
    
    /**
     * 获取子节点
     */
    @Transactional(readOnly = true)
    public List<NodeResponse> getChildNodes(String mindId, String parentId) {
        List<Node> nodes = nodeRepository.findByMindIdAndParentId(mindId, parentId);
        return nodes.stream()
            .map(NodeResponse::new)
            .collect(Collectors.toList());
    }
    
    /**
     * 更新节点
     */
    public NodeResponse updateNode(Long id, UpdateNodeRequest request) {
        Node node = nodeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("节点不存在: " + id));
        
        node.setTitle(request.getTitle());
        node.setBody(request.getBody());
        
        Node updatedNode = nodeRepository.save(node);
        return new NodeResponse(updatedNode);
    }
    
    /**
     * 删除节点
     */
    public void deleteNode(Long id) {
        if (!nodeRepository.existsById(id)) {
            throw new RuntimeException("节点不存在: " + id);
        }
        nodeRepository.deleteById(id);
    }
    
    /**
     * 删除思维空间（删除所有节点）
     */
    public void deleteMindSpace(String mindId) {
        nodeRepository.deleteByMindId(mindId);
    }
    
    /**
     * 生成唯一节点ID
     */
    public String generateNodeId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}