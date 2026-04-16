import { useState } from 'react'
import './ToolPage.css'

export default function PostgresqlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐘 PostgreSQL</h1>
        <p>功能最强大的开源关系型数据库</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>常用命令</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>完整 ACID</h3>
                <p>完整的事务支持，MVCC 并发控制</p>
              </div>
              <div className="feature-card">
                <h3>丰富数据类型</h3>
                <p>JSON/JSONB、数组、范围类型、自定义类型</p>
              </div>
              <div className="feature-card">
                <h3>扩展生态</h3>
                <p>PostGIS（GIS）、TimescaleDB（时序）、Citus（分布式）</p>
              </div>
              <div className="feature-card">
                <h3>高级查询</h3>
                <p>窗口函数、CTE、递归查询、物化视图</p>
              </div>
            </div>

            <h2>与 MySQL 对比</h2>
            <table className="comparison-table">
              <thead>
                <tr><th>特性</th><th>PostgreSQL</th><th>MySQL</th></tr>
              </thead>
              <tbody>
                <tr><td>JSON 支持</td><td>原生 JSONB，可索引</td><td>JSON 类型，部分索引</td></tr>
                <tr><td>数组类型</td><td>✅ 原生支持</td><td>❌ 不支持</td></tr>
                <tr><td>全文搜索</td><td>内置，支持中文</td><td>5.6+ 支持</td></tr>
                <tr><td>GIS</td><td>PostGIS 功能强大</td><td>基础空间支持</td></tr>
                <tr><td>复制</td><td>流复制、逻辑复制</td><td>主从复制、组复制</td></tr>
                <tr><td>窗口函数</td><td>完整支持</td><td>8.0+ 支持</td></tr>
              </tbody>
            </table>

            <h2>JSONB 操作</h2>
            <div className="info-box">
              <strong>JSONB 优势</strong>
              <ul>
                <li>二进制存储，查询更快</li>
                <li>支持 GIN 索引</li>
                <li>支持路径查询、嵌套查询</li>
                <li>适合存储半结构化数据</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>🗺️ GIS 应用</h4><p>PostGIS 提供强大的地理空间功能</p></div>
              <div className="scenario-card"><h4>📊 复杂查询</h4><p>分析型查询、报表统计</p></div>
              <div className="scenario-card"><h4>📱 移动应用</h4><p>JSON 存储灵活的移动端数据</p></div>
              <div className="scenario-card"><h4>🔬 科学计算</h4><p>数组、范围类型适合科学数据</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>连接与状态</h2>
            <div className="code-block">
              <pre>{`-- 连接数据库
psql -h localhost -U postgres -d dbname
psql -U postgres                    -- 本地连接
\\c dbname                          -- 切换数据库

-- 查看状态
SELECT version();
SELECT current_database();
SELECT current_user, session_user;
SELECT inet_server_addr(), inet_server_port();

-- 连接信息
SELECT * FROM pg_stat_activity;
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- 数据库大小
SELECT pg_size_pretty(pg_database_size('dbname'));
SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;`}</pre>
            </div>

            <h2>数据库与表操作</h2>
            <div className="code-block">
              <pre>{`-- 数据库操作
CREATE DATABASE dbname WITH ENCODING 'UTF8';
DROP DATABASE dbname;
\\l                                  -- 列出数据库

-- 表操作
\\dt                                 -- 列出表
\\d tablename                        -- 查看表结构
\\d+ tablename                       -- 详细表结构

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    age INT DEFAULT 0,
    tags TEXT[],
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 修改表
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(200);
ALTER TABLE users RENAME COLUMN name TO username;

-- 清空表
TRUNCATE TABLE users RESTART IDENTITY;`}</pre>
            </div>

            <h2>数据操作 (CRUD)</h2>
            <div className="code-block">
              <pre>{`-- 插入
INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);
INSERT INTO users (name, tags) VALUES ('李四', ARRAY['dev', 'admin']);
INSERT INTO users (name, data) VALUES ('王五', '{"role": "user", "active": true}');

-- 批量插入
INSERT INTO users (name, email) VALUES
    ('用户1', 'user1@example.com'),
    ('用户2', 'user2@example.com');

-- 查询
SELECT * FROM users;
SELECT name, email FROM users WHERE age > 20 ORDER BY created_at DESC LIMIT 10;
SELECT DISTINCT age FROM users;
SELECT age, COUNT(*) FROM users GROUP BY age HAVING COUNT(*) > 1;

-- 更新
UPDATE users SET age = 26, data = data || '{"updated": true}' WHERE id = 1;
UPDATE users SET age = age + 1 WHERE age < 30;

-- 删除
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE created_at < '2024-01-01';`}</pre>
            </div>

            <h2>JSONB 操作</h2>
            <div className="code-block">
              <pre>{`-- 插入 JSON 数据
INSERT INTO users (name, data) VALUES ('张三', '{"age": 25, "tags": ["dev", "go"]}');

-- 提取字段
SELECT data->>'age' FROM users;              -- 文本
SELECT data->'tags' FROM users;              -- JSON
SELECT data->'tags'->0 FROM users;           -- 数组元素

-- 条件查询
SELECT * FROM users WHERE data->>'age' = '25';
SELECT * FROM users WHERE (data->>'age')::int > 20;
SELECT * FROM users WHERE data @> '{"age": 25}';  -- 包含查询

-- JSONB 操作符
SELECT data || '{"city": "北京"}' FROM users;     -- 合并
SELECT data - 'age' FROM users;                    -- 删除键
SELECT data #- '{tags,0}' FROM users;              -- 删除路径

-- JSONB 函数
SELECT jsonb_pretty(data) FROM users;              -- 格式化
SELECT jsonb_object_keys(data) FROM users;         -- 获取所有键
SELECT jsonb_array_elements(data->'tags') FROM users;  -- 展开数组

-- 创建 GIN 索引加速 JSONB 查询
CREATE INDEX idx_data ON users USING GIN (data);
CREATE INDEX idx_data_path ON users USING GIN (data jsonb_path_ops);`}</pre>
            </div>

            <h2>数组操作</h2>
            <div className="code-block">
              <pre>{`-- 数组查询
SELECT * FROM users WHERE tags @> ARRAY['dev'];    -- 包含元素
SELECT * FROM users WHERE 'dev' = ANY(tags);       -- 任一匹配
SELECT * FROM users WHERE tags && ARRAY['dev', 'admin'];  -- 交集

-- 数组操作
SELECT array_length(tags, 1) FROM users;           -- 数组长度
SELECT tags[1] FROM users;                         -- 访问元素
SELECT array_append(tags, 'new') FROM users;       -- 添加元素
SELECT array_remove(tags, 'dev') FROM users;       -- 删除元素
SELECT unnest(tags) FROM users;                    -- 展开数组

-- 数组聚合
SELECT name, array_agg(tag) FROM user_tags GROUP BY name;`}</pre>
            </div>

            <h2>索引操作</h2>
            <div className="code-block">
              <pre>{`-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_name_age ON users(name, age);     -- 复合索引
CREATE INDEX idx_lower_name ON users(LOWER(name)); -- 函数索引

-- 特殊索引
CREATE INDEX idx_data_gin ON users USING GIN (data);        -- JSONB GIN
CREATE INDEX idx_tags_gin ON users USING GIN (tags);        -- 数组 GIN
CREATE INDEX idx_content_fts ON articles USING GIN (to_tsvector('english', content));  -- 全文

-- 查看索引
\\di
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- 删除索引
DROP INDEX idx_name;

-- 分析执行计划
EXPLAIN SELECT * FROM users WHERE name = '张三';
EXPLAIN ANALYZE SELECT * FROM users WHERE data @> '{"age": 25}';`}</pre>
            </div>

            <h2>高级查询</h2>
            <div className="code-block">
              <pre>{`-- CTE (Common Table Expression)
WITH active_users AS (
    SELECT * FROM users WHERE data->>'active' = 'true'
)
SELECT * FROM active_users WHERE age > 20;

-- 递归查询（组织架构示例）
WITH RECURSIVE org_tree AS (
    SELECT id, name, parent_id, 1 AS level
    FROM employees WHERE parent_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.parent_id, t.level + 1
    FROM employees e
    JOIN org_tree t ON e.parent_id = t.id
)
SELECT * FROM org_tree ORDER BY level;

-- 窗口函数
SELECT name, age,
    ROW_NUMBER() OVER (ORDER BY age DESC) as rank,
    RANK() OVER (ORDER BY age DESC) as dense_rank,
    LAG(age) OVER (ORDER BY created_at) as prev_age,
    LEAD(age) OVER (ORDER BY created_at) as next_age
FROM users;

-- 分组统计
SELECT
    date_trunc('month', created_at) as month,
    COUNT(*) as total,
    AVG(age) as avg_age
FROM users
GROUP BY date_trunc('month', created_at)
ORDER BY month;`}</pre>
            </div>

            <h2>用户与权限</h2>
            <div className="code-block">
              <pre>{`-- 创建用户
CREATE USER app_user WITH PASSWORD 'password123';
CREATE ROLE admin WITH LOGIN PASSWORD 'password';

-- 授权
GRANT ALL PRIVILEGES ON DATABASE dbname TO app_user;
GRANT SELECT, INSERT, UPDATE ON users TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;

-- 撤销权限
REVOKE INSERT ON users FROM app_user;

-- 查看权限
\\du
SELECT * FROM pg_user;

-- 修改密码
ALTER USER app_user WITH PASSWORD 'new_password';

-- 删除用户
DROP USER app_user;`}</pre>
            </div>

            <h2>备份与恢复</h2>
            <div className="code-block">
              <pre>{`-- pg_dump 备份
pg_dump -U postgres dbname > backup.sql
pg_dump -U postgres -t tablename dbname > table.sql
pg_dump -U postgres -Fc dbname > backup.dump  -- 自定义格式

-- 备份整个集群
pg_dumpall -U postgres > all_databases.sql

-- 恢复
psql -U postgres dbname < backup.sql
pg_restore -U postgres -d dbname backup.dump

-- 导出 CSV
COPY users TO '/tmp/users.csv' WITH CSV HEADER;
COPY (SELECT * FROM users WHERE age > 20) TO '/tmp/users_filtered.csv' WITH CSV;

-- 导入 CSV
COPY users FROM '/tmp/users.csv' WITH CSV HEADER;`}</pre>
            </div>

            <h2>性能监控</h2>
            <div className="code-block">
              <pre>{`-- 查看活动查询
SELECT pid, query, state, wait_event, query_start
FROM pg_stat_activity WHERE state = 'active';

-- 终止查询
SELECT pg_cancel_backend(pid);        -- 取消查询
SELECT pg_terminate_backend(pid);     -- 终止连接

-- 表统计信息
SELECT relname, n_live_tup, n_dead_tup,
    last_vacuum, last_autovacuum
FROM pg_stat_user_tables;

-- 索引使用情况
SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes;

-- 更新统计信息
ANALYZE users;
VACUUM users;
VACUUM ANALYZE users;                 -- 清理并分析

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('users'));
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables;`}</pre>
            </div>

            <h2>复制配置</h2>
            <div className="code-block">
              <pre>{`-- 主库状态
SELECT * FROM pg_stat_replication;

-- 从库状态
SELECT * FROM pg_stat_wal_receiver;

-- 复制槽
SELECT * FROM pg_replication_slots;
SELECT pg_create_physical_replication_slot('backup_slot');
SELECT pg_drop_replication_slot('backup_slot');

-- 逻辑复制
SELECT * FROM pg_publication;
SELECT * FROM pg_subscription;

-- 创建发布
CREATE PUBLICATION mypub FOR TABLE users, orders;

-- 创建订阅
CREATE SUBSCRIPTION mysub CONNECTION 'host=master port=5432 dbname=mydb user=repl password=pass'
PUBLICATION mypub;`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Go 连接 PostgreSQL</h2>
            <div className="code-block">
              <pre>{`import (
    "database/sql"
    "github.com/lib/pq"
)

db, _ := sql.Open("postgres", "postgres://user:pass@localhost/db?sslmode=disable")

// 连接池配置
db.SetMaxOpenConns(50)
db.SetMaxIdleConns(10)

// JSONB 查询
rows, _ := db.Query(\`
    SELECT data->>'name' as name
    FROM users
    WHERE data @> '{"active": true}'
\`)

// 使用 GIN 索引加速 JSONB 查询
// CREATE INDEX idx_data ON users USING GIN (data);`}</pre>
            </div>

            <h2>Python 连接 PostgreSQL</h2>
            <div className="code-block">
              <pre>{`import psycopg2
from psycopg2.extras import Json

conn = psycopg2.connect(
    host="localhost",
    database="mydb",
    user="postgres",
    password="password"
)

cur = conn.cursor()

# JSONB 操作
cur.execute("INSERT INTO users (name, data) VALUES (%s, %s)",
            ('张三', Json({'age': 25, 'tags': ['dev']})))

cur.execute("SELECT * FROM users WHERE data @> %s",
            (Json({'age': 25}),))

# 使用 psycopg2.extras.RealDictCursor 获取字典结果
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
cur.execute("SELECT * FROM users")
rows = cur.fetchall()  # 返回字典列表`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
