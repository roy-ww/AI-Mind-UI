package com.aimind.backend.repository;

import com.aimind.backend.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {
    
    /**
     * 根据思维空间ID查找所有节点
     */
    List<Node> findByMindId(String mindId);
    
    /**
     * 根据思维空间ID和节点ID查找节点
     */
    Optional<Node> findByMindIdAndNodeId(String mindId, String nodeId);
    
    /**
     * 根据思维空间ID和父节点ID查找子节点
     */
    List<Node> findByMindIdAndParentId(String mindId, String parentId);
    
    /**
     * 查找根节点（parentId为null）
     */
    @Query("SELECT n FROM Node n WHERE n.mindId = :mindId AND n.parentId IS NULL")
    Optional<Node> findRootNodeByMindId(@Param("mindId") String mindId);

    /**
     * 根据节点ID查找节点
     */
    @Query("SELECT n FROM Node n WHERE n.nodeId = :nodeId")
    Optional<Node> findByNodeId(String nodeId);
    
    /**
     * 检查节点是否存在
     */
    boolean existsByMindIdAndNodeId(String mindId, String nodeId);
    
    /**
     * 删除思维空间下的所有节点
     */
    void deleteByMindId(String mindId);
}