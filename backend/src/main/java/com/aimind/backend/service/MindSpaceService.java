package com.aimind.backend.service;

import com.aimind.backend.dto.CreateMindSpaceRequest;
import com.aimind.backend.dto.MindSpaceResponse;
import com.aimind.backend.dto.UpdateMindSpaceRequest;
import com.aimind.backend.entity.MindSpace;
import com.aimind.backend.entity.Node;
import com.aimind.backend.repository.MindSpaceRepository;
import com.aimind.backend.repository.NodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MindSpaceService {
    
    @Autowired
    private MindSpaceRepository mindSpaceRepository;
    
    @Autowired
    private NodeRepository nodeRepository;

    @Autowired
    private NodeService nodeService;
    
    /**
     * 创建新的思维空间
     */
    public MindSpaceResponse createMindSpace(CreateMindSpaceRequest request) {
        // 检查思维空间名称是否已存在（在同一用户下）
        if (mindSpaceRepository.findByUidAndMindName(request.getUid(), request.getMindName()).isPresent()) {
            throw new IllegalArgumentException("思维空间名称已存在: " + request.getMindName());
        }
        
        // 创建新的思维空间
        MindSpace mindSpace = new MindSpace();
        mindSpace.setUid(request.getUid());
        mindSpace.setMindName(request.getMindName());
        mindSpace.setMindConcepts(request.getMindConcepts());
        
        // 保存到数据库
        MindSpace savedMindSpace = mindSpaceRepository.save(mindSpace);
        nodeService.generateRootNode(mindSpace.getMindId(), mindSpace.getMindName());
        return convertToResponse(savedMindSpace);
    }
    
    /**
     * 根据ID获取思维空间
     */
    @Transactional(readOnly = true)
    public Optional<MindSpaceResponse> getMindSpaceById(String mindId) {
        return mindSpaceRepository.findById(mindId)
                .map(this::convertToResponse);
    }
    
    /**
     * 获取所有思维空间
     */
    @Transactional(readOnly = true)
    public List<MindSpaceResponse> getAllMindSpaces() {
        return mindSpaceRepository.findAllByOrderByCreateTimeDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据用户ID获取思维空间
     */
    @Transactional(readOnly = true)
    public List<MindSpaceResponse> getMindSpacesByUid(String uid) {
        return mindSpaceRepository.findByUid(uid)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据名称搜索思维空间
     */
    @Transactional(readOnly = true)
    public List<MindSpaceResponse> searchMindSpacesByName(String name) {
        return mindSpaceRepository.findByMindNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据概念搜索思维空间
     */
    @Transactional(readOnly = true)
    public List<MindSpaceResponse> searchMindSpacesByConcept(String concept) {
        return mindSpaceRepository.findByMindConceptsContaining(concept)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 更新思维空间
     */
    public MindSpaceResponse updateMindSpace(String mindId, UpdateMindSpaceRequest request) {
        MindSpace mindSpace = mindSpaceRepository.findById(mindId)
                .orElseThrow(() -> new IllegalArgumentException("思维空间不存在: " + mindId));
        
        // 检查名称是否与其他思维空间冲突
        if (request.getMindName() != null && !request.getMindName().equals(mindSpace.getMindName())) {
            if (mindSpaceRepository.existsByMindNameAndMindIdNot(request.getMindName(), mindId)) {
                throw new IllegalArgumentException("思维空间名称已存在: " + request.getMindName());
            }
        }
        
        
        // 更新字段
        if (request.getMindName() != null) {
            mindSpace.setMindName(request.getMindName());
        }
        if (request.getMindConcepts() != null) {
            mindSpace.setMindConcepts(request.getMindConcepts());
        }
        
        // 更新修改时间
        mindSpace.setUpdateTime(LocalDateTime.now());
        
        // 保存更新
        MindSpace updatedMindSpace = mindSpaceRepository.save(mindSpace);
        
        return convertToResponse(updatedMindSpace);
    }
    
    /**
     * 删除思维空间
     */
    public void deleteMindSpace(String mindId) {
        if (!mindSpaceRepository.existsById(mindId)) {
            throw new IllegalArgumentException("思维空间不存在: " + mindId);
        }
        
        mindSpaceRepository.deleteById(mindId);
    }
    
    /**
     * 检查思维空间是否存在
     */
    @Transactional(readOnly = true)
    public boolean existsById(String mindId) {
        return mindSpaceRepository.existsById(mindId);
    }
    
    /**
     * 获取思维空间总数
     */
    @Transactional(readOnly = true)
    public long getMindSpaceCount() {
        return mindSpaceRepository.count();
    }
    
    
    /**
     * 将MindSpace实体转换为MindSpaceResponse
     */
    private MindSpaceResponse convertToResponse(MindSpace mindSpace) {
        // 加载关联的节点数据
        loadAssociatedNodes(mindSpace);
        
        return new MindSpaceResponse(
                mindSpace.getMindId(),
                mindSpace.getUid(),
                mindSpace.getMindName(),
                mindSpace.getMindConcepts(),
                mindSpace.getCreateTime(),
                mindSpace.getUpdateTime(),
                mindSpace.getRootNode(),
                mindSpace.getNodes()
        );
    }
    
    /**
     * 加载思维空间关联的节点数据
     */
    private void loadAssociatedNodes(MindSpace mindSpace) {
        // 获取该思维空间下的所有节点
        List<Node> allNodes = nodeRepository.findByMindId(mindSpace.getMindId());
        mindSpace.setNodes(allNodes);
        
        // 查找根节点（parentId为null的节点）
        Optional<Node> rootNode = allNodes.stream()
                .filter(node -> node.getParentId() == null || node.getParentId().trim().isEmpty())
                .findFirst();
        
        mindSpace.setRootNode(rootNode.orElse(null));
    }
}
