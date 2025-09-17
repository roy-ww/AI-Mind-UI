package com.aimind.backend.repository;

import com.aimind.backend.entity.MindSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MindSpaceRepository extends JpaRepository<MindSpace, String> {
    
    /**
     * 根据用户ID查找思维空间
     */
    List<MindSpace> findByUid(String uid);
    
    /**
     * 根据用户ID和思维空间名称查找
     */
    Optional<MindSpace> findByUidAndMindName(String uid, String mindName);
    
    /**
     * 根据思维空间名称查找
     */
    List<MindSpace> findByMindNameContainingIgnoreCase(String mindName);
    
    
    /**
     * 查找所有思维空间，按创建时间倒序排列
     */
    List<MindSpace> findAllByOrderByCreateTimeDesc();
    
    /**
     * 根据概念关键词搜索思维空间
     */
    @Query("SELECT ms FROM MindSpace ms WHERE ms.mindConcepts LIKE %:concept%")
    List<MindSpace> findByMindConceptsContaining(@Param("concept") String concept);
    
    /**
     * 统计思维空间总数
     */
    long count();
    
    /**
     * 检查思维空间名称是否存在（排除指定ID）
     */
    @Query("SELECT COUNT(ms) > 0 FROM MindSpace ms WHERE ms.mindName = :mindName AND ms.mindId != :mindId")
    boolean existsByMindNameAndMindIdNot(@Param("mindName") String mindName, @Param("mindId") String mindId);
    
    /**
     * 检查思维空间名称是否存在
     */
    boolean existsByMindName(String mindName);
}
