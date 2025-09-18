package com.aimind.backend.config;

import com.aimind.backend.entity.User;
import com.aimind.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // 检查是否已经存在用户，如果不存在则创建默认用户
        if (userRepository.count() == 0) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("111111")); // 加密密码
            adminUser.setNickname("管理员");
            
            userRepository.save(adminUser);
            System.out.println("默认管理员用户已创建: admin / 111111");
        }
    }
}