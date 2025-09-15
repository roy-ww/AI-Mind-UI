package com.aimind.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 获取前端目录的绝对路径
        String frontendPath = Paths.get(System.getProperty("user.dir"), "..", "frontend").toAbsolutePath().toString();
        
        // 配置静态资源处理，只处理特定的静态文件
        registry.addResourceHandler("/home.html", "/chat.html", "/admin.html", "/mindmap-demo.html")
                .addResourceLocations("file:" + frontendPath + "/")
                .setCachePeriod(0); // 开发环境不缓存
        
        // 配置CSS文件
        registry.addResourceHandler("css/*")
                .addResourceLocations("file:" + frontendPath + "/css/")
                .setCachePeriod(0); // 开发环境不缓存
        
        // 配置JS文件
        registry.addResourceHandler("js/*")
                .addResourceLocations("file:" + frontendPath + "/js/")
                .setCachePeriod(0); // 开发环境不缓存
        
        // 配置其他静态资源文件
        registry.addResourceHandler("*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico")
                .addResourceLocations("file:" + frontendPath + "/")
                .setCachePeriod(0); // 开发环境不缓存
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 配置根路径重定向到 home.html
        registry.addRedirectViewController("/", "/home.html");
    }
}
