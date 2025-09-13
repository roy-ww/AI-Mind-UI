-- 创建思维导图节点表
CREATE TABLE nodes (
    id BIGSERIAL PRIMARY KEY,
    mind_id VARCHAR(255) NOT NULL,
    parent_id VARCHAR(255),
    node_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 创建唯一约束
    CONSTRAINT uk_mind_node UNIQUE (mind_id, node_id)
);

-- 创建索引
CREATE INDEX idx_mind_id ON nodes (mind_id);
CREATE INDEX idx_parent_id ON nodes (parent_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nodes_updated_at 
    BEFORE UPDATE ON nodes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();