import { useState } from 'react'
import './ToolPage.css'

export default function MysqlToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🐬 MySQL</h1>
        <p>最流行的开源关系型数据库</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>常用命令</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>存储引擎</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>特性</th>
                  <th>InnoDB</th>
                  <th>MyISAM</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>事务</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>外键</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>行锁</td><td>✅ 支持</td><td>❌ 只有表锁</td></tr>
                <tr><td>崩溃恢复</td><td>✅ 支持</td><td>❌ 不支持</td></tr>
                <tr><td>全文索引</td><td>✅ 5.6+</td><td>✅ 支持</td></tr>
                <tr><td>适用场景</td><td>OLTP、高并发</td><td>只读、统计</td></tr>
              </tbody>
            </table>

            <h2>事务隔离级别</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>READ UNCOMMITTED</h3>
                <p>读未提交，可能读到脏数据，极少使用</p>
              </div>
              <div className="feature-card">
                <h3>READ COMMITTED</h3>
                <p>读已提交，避免脏读，Oracle 默认级别</p>
              </div>
              <div className="feature-card">
                <h3>REPEATABLE READ</h3>
                <p>可重复读，MySQL 默认，避免脏读、不可重复读</p>
              </div>
              <div className="feature-card">
                <h3>SERIALIZABLE</h3>
                <p>串行化，最高隔离级别，性能最低</p>
              </div>
            </div>

            <h2>索引类型</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>🌲 B+Tree 索引</h4>
                <p>默认索引类型，适合范围查询、排序</p>
              </div>
              <div className="scenario-card">
                <h4>🔗 Hash 索引</h4>
                <p>等值查询极快，不支持范围查询</p>
              </div>
              <div className="scenario-card">
                <h4>📝 全文索引</h4>
                <p>文本搜索，支持中文分词</p>
              </div>
              <div className="scenario-card">
                <h4>📍 空间索引</h4>
                <p>GIS 数据，地理位置查询</p>
              </div>
            </div>

            <h2>锁机制</h2>
            <div className="info-box">
              <strong>锁粒度</strong>
              <ul>
                <li><strong>全局锁</strong> - 整库只读，用于备份</li>
                <li><strong>表锁</strong> - 锁整张表，MyISAM 使用</li>
                <li><strong>行锁</strong> - 锁单行，InnoDB 使用，并发度高</li>
                <li><strong>间隙锁</strong> - 锁记录间隙，防止幻读</li>
              </ul>
            </div>

            <h2>主从复制</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   Master    │ ────▶  │   Slave 1   │        │   Slave 2   │
  │  (写入)     │        │  (读取)     │        │  (读取)     │
  └─────────────┘        └─────────────┘        └─────────────┘
        │                      ▲                      ▲
        │      Binlog          │                      │
        └──────────────────────┴──────────────────────┘

  复制模式: 异步 / 半同步 / 组复制
              `}</pre>
            </div>

            <h2>性能优化要点</h2>
            <div className="info-box warning">
              <strong>⚠️ 常见优化建议</strong>
              <ul>
                <li>避免 SELECT *，只查需要的列</li>
                <li>使用 EXPLAIN 分析执行计划</li>
                <li>合理使用索引，避免索引失效</li>
                <li>大表查询使用 LIMIT 分页</li>
                <li>避免在 WHERE 子句中对字段进行函数操作</li>
                <li>使用连接池减少连接开销</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>连接与状态</h2>
            <div className="code-block">
              <pre>{`-- 连接数据库
mysql -h 127.0.0.1 -P 3306 -u root -p
mysql -u root -p database_name

-- 查看状态
SHOW STATUS;                    -- 查看服务器状态
SHOW PROCESSLIST;               -- 查看当前连接
SHOW VARIABLES LIKE 'max_connections';  -- 查看配置变量
SELECT VERSION();               -- 查看版本
SELECT NOW();                   -- 当前时间

-- 查看连接数
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';`}</pre>
            </div>

            <h2>数据库与表操作</h2>
            <div className="code-block">
              <pre>{`-- 数据库操作
CREATE DATABASE db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP DATABASE db_name;
SHOW DATABASES;
USE db_name;

-- 表操作
SHOW TABLES;
DESCRIBE table_name;            -- 查看表结构
SHOW CREATE TABLE table_name;   -- 查看建表语句

-- 创建表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    age INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 修改表
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users MODIFY COLUMN name VARCHAR(200);
ALTER TABLE users ADD INDEX idx_age (age);
ALTER TABLE users DROP INDEX idx_age;

-- 清空表（保留结构）
TRUNCATE TABLE users;           -- 更快，重置AUTO_INCREMENT
DELETE FROM users;              -- 可带WHERE，记录日志`}</pre>
            </div>

            <h2>数据操作 (CRUD)</h2>
            <div className="code-block">
              <pre>{`-- 插入
INSERT INTO users (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);
INSERT INTO users (name, email) VALUES ('李四', 'lisi@example.com'), ('王五', 'wangwu@example.com');
INSERT INTO users SET name='赵六', email='zhaoliu@example.com';

-- 查询
SELECT * FROM users;
SELECT id, name FROM users WHERE age > 20 ORDER BY created_at DESC LIMIT 10;
SELECT DISTINCT age FROM users;
SELECT COUNT(*) FROM users;
SELECT age, COUNT(*) as cnt FROM users GROUP BY age HAVING cnt > 1;

-- 更新
UPDATE users SET age = 26, updated_at = NOW() WHERE id = 1;
UPDATE users SET age = age + 1 WHERE age < 30;

-- 删除
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE created_at < '2024-01-01' LIMIT 1000;`}</pre>
            </div>

            <h2>索引操作</h2>
            <div className="code-block">
              <pre>{`-- 创建索引
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_name_age ON users(name, age);  -- 复合索引
CREATE FULLTEXT INDEX idx_content ON articles(title, content);  -- 全文索引

-- 删除索引
DROP INDEX idx_name ON users;
ALTER TABLE users DROP INDEX idx_name;

-- 查看索引
SHOW INDEX FROM users;

-- 强制使用索引
SELECT * FROM users FORCE INDEX(idx_name) WHERE name = '张三';

-- 分析索引使用情况
EXPLAIN SELECT * FROM users WHERE name = '张三';
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 20;`}</pre>
            </div>

            <h2>查询优化</h2>
            <div className="code-block">
              <pre>{`-- EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = '张三';
-- type: ALL(全表扫描) < index < range < ref < eq_ref < const(最优)

-- 查看执行时间
SET profiling = 1;
SELECT * FROM users WHERE name = '张三';
SHOW PROFILES;

-- 分析慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过1秒记录

-- 查看表统计信息
ANALYZE TABLE users;
SHOW TABLE STATUS LIKE 'users';`}</pre>
            </div>

            <h2>用户与权限</h2>
            <div className="code-block">
              <pre>{`-- 创建用户
CREATE USER 'app_user'@'%' IDENTIFIED BY 'password123';
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'password';

-- 授权
GRANT ALL PRIVILEGES ON db_name.* TO 'app_user'@'%';
GRANT SELECT, INSERT, UPDATE ON db_name.users TO 'app_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- 撤销权限
REVOKE INSERT ON db_name.* FROM 'app_user'@'%';

-- 查看权限
SHOW GRANTS FOR 'app_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 修改密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
SET PASSWORD FOR 'app_user'@'%' = PASSWORD('new_password');

-- 删除用户
DROP USER 'app_user'@'%';`}</pre>
            </div>

            <h2>备份与恢复</h2>
            <div className="code-block">
              <pre>{`-- mysqldump 备份
mysqldump -u root -p db_name > backup.sql
mysqldump -u root -p db_name table1 table2 > tables.sql
mysqldump -u root -p --all-databases > all_databases.sql
mysqldump -u root -p --single-transaction --routines --triggers db_name > backup.sql

-- 恢复
mysql -u root -p db_name < backup.sql

-- 导出 CSV
SELECT * FROM users INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\\n';

-- 导入 CSV
LOAD DATA INFILE '/tmp/users.csv' INTO TABLE users
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\\n';`}</pre>
            </div>

            <h2>主从复制</h2>
            <div className="code-block">
              <pre>{`-- Master 配置
SHOW MASTER STATUS;
-- 记录 File 和 Position

-- 创建复制用户
CREATE USER 'repl'@'%' IDENTIFIED BY 'password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- Slave 配置
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='repl',
    MASTER_PASSWORD='password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;

START SLAVE;
STOP SLAVE;
SHOW SLAVE STATUS\\G

-- 查看复制延迟
SHOW SLAVE STATUS\\G  -- 查看 Seconds_Behind_Master`}</pre>
            </div>

            <h2>性能监控</h2>
            <div className="code-block">
              <pre>{`-- 查看InnoDB状态
SHOW ENGINE INNODB STATUS;

-- 查看锁等待
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_LOCK_WAITS;

-- 查看事务
SELECT * FROM information_schema.INNODB_TRX;

-- 查看缓冲池状态
SHOW STATUS LIKE 'Innodb_buffer_pool%';

-- 查看表大小
SELECT
    table_name,
    ROUND(data_length/1024/1024, 2) AS data_mb,
    ROUND(index_length/1024/1024, 2) AS index_mb,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'db_name'
ORDER BY data_length DESC;`}</pre>
            </div>

            <h2>常用运维命令</h2>
            <div className="code-block">
              <pre>{`-- 优化表（重建表、更新统计信息）
OPTIMIZE TABLE users;

-- 修复表
REPAIR TABLE users;

-- 检查表
CHECK TABLE users;

-- 批量kill连接
SELECT CONCAT('KILL ', id, ';') FROM information_schema.processlist
WHERE user = 'app_user' AND time > 60;

-- 查看表碎片
SELECT table_name,
    data_free/1024/1024 AS fragment_mb
FROM information_schema.tables
WHERE data_free > 0;

-- 重置自增ID
ALTER TABLE users AUTO_INCREMENT = 1;`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>连接池配置（Go）</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "database/sql"
    "time"
    _ "github.com/go-sql-driver/mysql"
)

func main() {
    db, err := sql.Open("mysql", "user:password@tcp(127.0.0.1:3306)/dbname?parseTime=true")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // 连接池配置
    db.SetMaxOpenConns(100)              // 最大连接数
    db.SetMaxIdleConns(10)               // 最大空闲连接
    db.SetConnMaxLifetime(time.Hour)     // 连接最大生命周期
    db.SetConnMaxIdleTime(10 * time.Minute) // 空闲连接超时

    // 查询
    rows, _ := db.Query("SELECT id, name FROM users WHERE id = ?", 1)
    defer rows.Close()

    for rows.Next() {
        var id int
        var name string
        rows.Scan(&id, &name)
    }
}`}</pre>
            </div>

            <h2>事务处理</h2>
            <div className="code-block">
              <pre>{`// 事务示例
tx, err := db.Begin()
if err != nil {
    return err
}

// 使用 defer 处理回滚
defer func() {
    if err != nil {
        tx.Rollback()
    }
}()

// 执行多个操作
_, err = tx.Exec("UPDATE accounts SET balance = balance - ? WHERE id = ?", 100, 1)
if err != nil {
    return err
}

_, err = tx.Exec("UPDATE accounts SET balance = balance + ? WHERE id = ?", 100, 2)
if err != nil {
    return err
}

// 提交事务
return tx.Commit()`}</pre>
            </div>

            <h2>批量插入优化</h2>
            <div className="code-block">
              <pre>{`// 批量插入 - 方式1: 多值 INSERT
INSERT INTO users (name, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com'),
    ('user3', 'user3@example.com');

// 批量插入 - 方式2: 使用事务
tx, _ := db.Begin()
stmt, _ := tx.Prepare("INSERT INTO users (name, email) VALUES (?, ?)")
defer stmt.Close()

for i := 0; i < 1000; i++ {
    stmt.Exec(fmt.Sprintf("user%d", i), fmt.Sprintf("user%d@example.com", i))
}
tx.Commit()`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
