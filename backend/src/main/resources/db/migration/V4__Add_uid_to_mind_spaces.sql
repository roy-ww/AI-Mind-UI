-- 为思维空间表添加用户ID字段
ALTER TABLE mind_spaces ADD COLUMN uid VARCHAR(36);

-- 添加外键约束，确保uid引用users表的uid
ALTER TABLE mind_spaces ADD CONSTRAINT fk_mind_spaces_uid 
    FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE;

-- 创建索引以提高查询性能
CREATE INDEX idx_mind_spaces_uid ON mind_spaces(uid);

-- 注意：由于uid字段被设置为NOT NULL，但现有数据可能为空
-- 在实际部署时，需要先为现有数据设置默认值或删除现有数据
-- 这里假设是全新部署，所以直接设置为NOT NULL
ALTER TABLE mind_spaces ALTER COLUMN uid SET NOT NULL;
