import { useState } from 'react'
import './ToolPage.css'

export default function BackupToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>💾 备份同步</h1>
        <p>定时快照、冷热备份、跨城同步</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>备份策略</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>全量备份</h3><p>完整数据副本，恢复快，占用空间大</p></div>
              <div className="feature-card"><h3>增量备份</h3><p>只备份变化数据，节省空间</p></div>
              <div className="feature-card"><h3>差异备份</h3><p>相对于全量的变化，折中方案</p></div>
              <div className="feature-card"><h3>快照备份</h3><p>存储级快照，秒级完成</p></div>
            </div>

            <h2>冷热备份对比</h2>
            <table className="comparison-table">
              <thead><tr><th>类型</th><th>特点</th><th>恢复时间</th><th>成本</th></tr></thead>
              <tbody>
                <tr><td>热备份</td><td>在线备份，服务不中断</td><td>秒级</td><td>高</td></tr>
                <tr><td>温备份</td><td>短暂停服或只读</td><td>分钟级</td><td>中</td></tr>
                <tr><td>冷备份</td><td>停服备份</td><td>小时级</td><td>低</td></tr>
              </tbody>
            </table>

            <h2>备份策略设计</h2>
            <div className="info-box">
              <ul>
                <li><strong>3-2-1 原则</strong> - 3份副本、2种介质、1份异地</li>
                <li><strong>定期验证</strong> - 定期恢复测试，确保备份有效</li>
                <li><strong>加密存储</strong> - 敏感数据加密备份</li>
                <li><strong>保留策略</strong> - 日/周/月备份保留周期</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>MySQL 备份脚本</h2>
            <div className="code-block">
              <pre>{`#!/bin/bash
# 全量备份
mysqldump -u root -p --all-databases --single-transaction \
  --flush-logs --master-data=2 > /backup/full_$(date +%Y%m%d).sql

# 增量备份 (binlog)
mysqladmin flush-logs
cp /var/lib/mysql/mysql-bin.* /backup/binlog/

# 定时任务 (crontab)
# 每天凌晨2点全量备份
0 2 * * * /scripts/mysql_backup.sh

# 恢复
mysql -u root -p < /backup/full_20240101.sql
mysqlbinlog /backup/binlog/mysql-bin.000001 | mysql -u root -p`}</pre>
            </div>

            <h2>跨城同步方案</h2>
            <div className="code-block">
              <pre>{`# 使用 rsync 同步文件
rsync -avz --delete /data/ backup-server:/backup/data/

# 使用对象存储跨区域复制
# AWS S3 跨区域复制配置
aws s3api put-bucket-replication \
  --bucket my-bucket \
  --replication-configuration file://replication.json

# replication.json
{
  "Role": "arn:aws:iam::123456789:role/replication",
  "Rules": [{
    "Status": "Enabled",
    "Destination": {
      "Bucket": "arn:aws:s3:::backup-bucket"
    }
  }]
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
