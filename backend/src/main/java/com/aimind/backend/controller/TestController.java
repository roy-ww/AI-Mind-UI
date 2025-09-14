package com.aimind.backend.controller;

import com.aimind.backend.dto.ChatRequest;
import com.aimind.backend.dto.ChatResponse;
import com.aimind.backend.dto.LLMResponse;
import com.aimind.backend.service.LLMService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private LLMService llmService;

    @PostMapping("/llm-structured")
    public Object testStructuredLLM(@RequestBody ChatRequest request) {
        try {
            ChatResponse response = llmService.chat(request);
            
            // 返回一个包含原始内容和结构化数据的对象
            return new Object() {
                public String originalContent = response.getContent();
                public LLMResponse structuredData = response.getStructuredResponse();
                public String model = response.getModel();
                public Long responseTime = response.getResponseTime();
                public boolean hasStructuredData = response.getStructuredResponse() != null;
            };
        } catch (Exception e) {
            return new Object() {
                public String error = e.getMessage();
            };
        }
    }
}
