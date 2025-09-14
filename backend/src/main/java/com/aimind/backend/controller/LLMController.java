package com.aimind.backend.controller;

import com.aimind.backend.dto.ChatRequest;
import com.aimind.backend.dto.ChatResponse;
import com.aimind.backend.service.LLMService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/llm")
@CrossOrigin(origins = "*")
public class LLMController {

    @Autowired
    private LLMService llmService;

    /**
     * 大模型聊天接口
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        try {
            ChatResponse response = llmService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 获取支持的模型列表
     */
    @GetMapping("/models")
    public ResponseEntity<Object> getModels() {
        return ResponseEntity.ok(new Object() {
            public final String[] models = {"qwen-turbo", "qwen-plus", "kimi"};
            public final String[] modelNames = {"通义千问 Turbo", "通义千问 Plus", "Kimi K2 Instruct"};
            public final String[] descriptions = {
                "快速响应，适合日常对话",
                "更强能力，适合复杂任务", 
                "月之暗面Kimi模型"
            };
        });
    }

    /**
     * 健康检查
     */
    @GetMapping("/health")
    public ResponseEntity<Object> health() {
        return ResponseEntity.ok(new Object() {
            public final String status = "ok";
            public final String message = "大模型服务运行正常";
        });
    }
}
