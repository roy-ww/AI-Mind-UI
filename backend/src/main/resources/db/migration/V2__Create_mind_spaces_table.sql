-- 创建思维空间表
CREATE TABLE mind_spaces (
    mind_id VARCHAR(36) PRIMARY KEY,
    mind_name VARCHAR(255) NOT NULL,
    mind_concepts TEXT,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_mind_spaces_mind_name ON mind_spaces(mind_name);
CREATE INDEX idx_mind_spaces_create_time ON mind_spaces(create_time);

-- 创建触发器函数来自动更新 update_time
CREATE OR REPLACE FUNCTION update_mind_spaces_updated_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_mind_spaces_updated_time
    BEFORE UPDATE ON mind_spaces
    FOR EACH ROW
    EXECUTE FUNCTION update_mind_spaces_updated_time();
