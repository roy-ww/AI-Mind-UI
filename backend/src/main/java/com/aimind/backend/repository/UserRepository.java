package com.aimind.backend.repository;

import com.aimind.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    /**
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);
    
    /**
     * 根据昵称查找用户
     */
    List<User> findByNicknameContainingIgnoreCase(String nickname);
    
    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);
    
    /**
     * 检查昵称是否存在
     */
    boolean existsByNickname(String nickname);
    
    /**
     * 根据用户名和密码查找用户（用于登录验证）
     */
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.password = :password")
    Optional<User> findByUsernameAndPassword(@Param("username") String username, @Param("password") String password);
    
    /**
     * 查找所有用户，按创建时间倒序排列
     */
    List<User> findAllByOrderByCreatedAtDesc();
    
    /**
     * 根据用户名模糊搜索
     */
    List<User> findByUsernameContainingIgnoreCase(String username);
    
    /**
     * 统计用户总数
     */
    long count();
}
