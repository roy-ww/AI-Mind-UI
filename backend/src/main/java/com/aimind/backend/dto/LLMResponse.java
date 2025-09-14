package com.aimind.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * 大模型响应的结构化数据对象
 * 对应application-secret.yml中配置的JSON格式
 */
public class LLMResponse {
    
    @JsonProperty("sections")
    private List<Section> sections;
    
    @JsonProperty("concepts")
    private List<String> concepts;
    
    @JsonProperty("questions")
    private List<String> questions;
    

    
    // 构造函数
    public LLMResponse() {}
    
    public LLMResponse(List<Section> sections, List<String> concepts, List<String> questions, 
                      String summary, List<String> sources) {
        this.sections = sections;
        this.concepts = concepts;
        this.questions = questions;
    }
    
    // Getters and Setters
    public List<Section> getSections() {
        return sections;
    }
    
    public void setSections(List<Section> sections) {
        this.sections = sections;
    }
    
    public List<String> getConcepts() {
        return concepts;
    }
    
    public void setConcepts(List<String> concepts) {
        this.concepts = concepts;
    }
    
    public List<String> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<String> questions) {
        this.questions = questions;
    }
    
    /**
     * 内部类：表示sections数组中的单个段落
     */
    public static class Section {
        @JsonProperty("title")
        private String title;
        
        @JsonProperty("content")
        private String content;
        
        // 构造函数
        public Section() {}
        
        public Section(String title, String content) {
            this.title = title;
            this.content = content;
        }
        
        // Getters and Setters
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
        
        @Override
        public String toString() {
            return "Section{" +
                    "title='" + title + '\'' +
                    ", content='" + content + '\'' +
                    '}';
        }
    }
    
    @Override
    public String toString() {
        return "LLMResponse{" +
                "sections=" + sections +
                ", concepts=" + concepts +
                ", questions=" + questions +
                '}';
    }
}
