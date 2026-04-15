import { useState } from 'react'
import './ToolPage.css'

const httpStatusCodes = [
  // 1xx Informational
  { code: 100, name: 'Continue', description: '服务器已接收到请求头，客户端应继续发送请求体' },
  { code: 101, name: 'Switching Protocols', description: '服务器已理解请求，将通过 Upgrade 消息头切换协议' },
  { code: 102, name: 'Processing', description: '服务器已收到请求，正在处理中（WebDAV）' },

  // 2xx Success
  { code: 200, name: 'OK', description: '请求成功，请求所希望的响应头或数据体将随此响应返回' },
  { code: 201, name: 'Created', description: '已创建，成功请求并创建了新的资源' },
  { code: 202, name: 'Accepted', description: '已接受，服务器已接受请求，但尚未处理' },
  { code: 204, name: 'No Content', description: '无内容，服务器成功处理，但未返回内容' },
  { code: 206, name: 'Partial Content', description: '部分内容，服务器成功处理了部分 GET 请求' },

  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', description: '多种选择，请求的资源有多个可供选择的表达方式' },
  { code: 301, name: 'Moved Permanently', description: '永久移动，请求的资源已永久移动到新位置' },
  { code: 302, name: 'Found', description: '临时移动，请求的资源临时从不同的 URI 响应请求' },
  { code: 304, name: 'Not Modified', description: '未修改，资源未被修改，使用缓存版本' },
  { code: 307, name: 'Temporary Redirect', description: '临时重定向，请求的资源临时从不同的 URI 响应请求' },
  { code: 308, name: 'Permanent Redirect', description: '永久重定向，请求的资源已永久移动到新位置' },

  // 4xx Client Error
  { code: 400, name: 'Bad Request', description: '错误请求，服务器无法理解请求的格式' },
  { code: 401, name: 'Unauthorized', description: '未授权，请求需要身份验证' },
  { code: 403, name: 'Forbidden', description: '禁止访问，服务器拒绝请求' },
  { code: 404, name: 'Not Found', description: '未找到，服务器找不到请求的资源' },
  { code: 405, name: 'Method Not Allowed', description: '方法不允许，请求方法不被支持' },
  { code: 408, name: 'Request Timeout', description: '请求超时，服务器等待请求超时' },
  { code: 409, name: 'Conflict', description: '冲突，请求与服务器当前状态冲突' },
  { code: 410, name: 'Gone', description: '已删除，请求的资源已永久删除' },
  { code: 413, name: 'Payload Too Large', description: '请求实体过大，服务器拒绝处理' },
  { code: 414, name: 'URI Too Long', description: '请求 URI 过长，服务器拒绝处理' },
  { code: 415, name: 'Unsupported Media Type', description: '不支持的媒体类型' },
  { code: 422, name: 'Unprocessable Entity', description: '无法处理的实体，请求格式正确但语义错误' },
  { code: 429, name: 'Too Many Requests', description: '请求过多，已触发限流' },

  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', description: '服务器内部错误' },
  { code: 501, name: 'Not Implemented', description: '未实现，服务器不支持请求的功能' },
  { code: 502, name: 'Bad Gateway', description: '错误网关，上游服务器返回无效响应' },
  { code: 503, name: 'Service Unavailable', description: '服务不可用，服务器暂时无法处理请求' },
  { code: 504, name: 'Gateway Timeout', description: '网关超时，上游服务器响应超时' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'HTTP 版本不支持' },
]

const getCategoryColor = (code: number) => {
  if (code >= 100 && code < 200) return '#17a2b8'
  if (code >= 200 && code < 300) return '#28a745'
  if (code >= 300 && code < 400) return '#ffc107'
  if (code >= 400 && code < 500) return '#fd7e14'
  if (code >= 500) return '#dc3545'
  return '#6c757d'
}

const getCategoryName = (code: number) => {
  if (code >= 100 && code < 200) return '信息响应'
  if (code >= 200 && code < 300) return '成功响应'
  if (code >= 300 && code < 400) return '重定向'
  if (code >= 400 && code < 500) return '客户端错误'
  if (code >= 500) return '服务器错误'
  return '未知'
}

export default function HttpStatusToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [search, setSearch] = useState('')
  const [selectedCode, setSelectedCode] = useState<number | null>(null)

  const filteredCodes = httpStatusCodes.filter(
    (item) =>
      item.code.toString().includes(search) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.includes(search)
  )

  const selectedItem = selectedCode ? httpStatusCodes.find((item) => item.code === selectedCode) : null

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>HTTP 状态码</h1>
        <p>HTTP Status Codes - HTTP 响应状态码速查表</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>状态码分类</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3 style={{ color: '#17a2b8' }}>1xx 信息响应</h3>
                <p>请求已被接收，继续处理。表示临时响应，需要客户端继续操作</p>
              </div>
              <div className="feature-card">
                <h3 style={{ color: '#28a745' }}>2xx 成功响应</h3>
                <p>请求已成功接收、理解并接受。表示操作成功完成</p>
              </div>
              <div className="feature-card">
                <h3 style={{ color: '#ffc107' }}>3xx 重定向</h3>
                <p>需要进一步操作以完成请求。通常用于 URL 重定向</p>
              </div>
              <div className="feature-card">
                <h3 style={{ color: '#fd7e14' }}>4xx 客户端错误</h3>
                <p>请求包含语法错误或无法完成。客户端需要修正请求</p>
              </div>
              <div className="feature-card">
                <h3 style={{ color: '#dc3545' }}>5xx 服务器错误</h3>
                <p>服务器无法完成有效请求。服务端出现问题</p>
              </div>
            </div>

            <h2>常见状态码详解</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  ┌──────────────────────────────────────────────────────────────┐
  │  2xx 成功                                                    │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ 200 OK          - 请求成功，返回响应体                    ││
  │  │ 201 Created     - 创建成功，返回新资源 URI                ││
  │  │ 204 No Content  - 成功但无返回内容 (常用于 DELETE)        ││
  │  └──────────────────────────────────────────────────────────┘│
  │                                                              │
  │  3xx 重定向                                                  │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ 301 Moved Permanently - 永久重定向，SEO 权重转移          ││
  │  │ 302 Found             - 临时重定向，SEO 权重不转移        ││
  │  │ 304 Not Modified      - 资源未修改，使用缓存              ││
  │  └──────────────────────────────────────────────────────────┘│
  │                                                              │
  │  4xx 客户端错误                                              │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ 400 Bad Request    - 请求语法错误                        ││
  │  │ 401 Unauthorized   - 需要身份认证                        ││
  │  │ 403 Forbidden      - 服务器拒绝执行                      ││
  │  │ 404 Not Found      - 资源不存在                          ││
  │  └──────────────────────────────────────────────────────────┘│
  │                                                              │
  │  5xx 服务器错误                                              │
  │  ┌──────────────────────────────────────────────────────────┐│
  │  │ 500 Internal Server Error - 服务器内部错误               ││
  │  │ 502 Bad Gateway           - 网关/代理收到无效响应        ││
  │  │ 503 Service Unavailable   - 服务暂时不可用               ││
  │  │ 504 Gateway Timeout       - 网关/代理超时                ││
  │  └──────────────────────────────────────────────────────────┘│
  └──────────────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>状态码选择指南</h2>
            <div className="info-box">
              <strong>RESTful API 设计建议</strong>
              <ul>
                <li><strong>GET</strong> - 成功返回 200，无内容返回 204</li>
                <li><strong>POST</strong> - 创建成功返回 201，返回 200 或 204 也可</li>
                <li><strong>PUT</strong> - 更新成功返回 200 或 204</li>
                <li><strong>DELETE</strong> - 删除成功返回 200 或 204</li>
                <li><strong>错误</strong> - 使用 4xx 表示客户端错误，5xx 表示服务端错误</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>API 开发</strong> - 正确使用状态码表示操作结果</li>
              <li><strong>错误排查</strong> - 根据状态码快速定位问题</li>
              <li><strong>监控告警</strong> - 统计状态码分布，发现异常</li>
              <li><strong>缓存控制</strong> - 304 状态码优化缓存策略</li>
              <li><strong>SEO 优化</strong> - 正确处理 301/302 重定向</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>状态码查询</h2>
            <div className="connection-demo">
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索状态码、名称或描述..."
                />
              </div>

              {selectedItem && (
                <div
                  style={{
                    padding: '16px',
                    background: '#f0f7ff',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #007bff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: getCategoryColor(selectedItem.code),
                            fontFamily: 'Consolas, Monaco, monospace'
                          }}
                        >
                          {selectedItem.code}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedItem.name}</span>
                      </div>
                      <div style={{ color: '#666', marginBottom: '8px' }}>{selectedItem.description}</div>
                      <span
                        style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          background: getCategoryColor(selectedItem.code),
                          color: '#fff',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      >
                        {getCategoryName(selectedItem.code)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`${selectedItem.code} ${selectedItem.name}: ${selectedItem.description}`)}
                      style={{
                        padding: '8px 16px',
                        background: '#e0e0e0',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      复制
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>状态码列表</div>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '500px', overflow: 'auto' }}>
                  {filteredCodes.map((item) => (
                    <div
                      key={item.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: selectedCode === item.code ? '#e7f1ff' : '#f5f5f5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: selectedCode === item.code ? '1px solid #007bff' : '1px solid transparent',
                      }}
                      onClick={() => setSelectedCode(item.code)}
                    >
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: getCategoryColor(item.code),
                          minWidth: '50px',
                          fontFamily: 'Consolas, Monaco, monospace'
                        }}
                      >
                        {item.code}
                      </span>
                      <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>HTTP 状态码处理示例</h2>
            <div className="code-block">
              <pre>{`// Express.js 状态码处理
app.get('/users/:id', (req, res) => {
  const user = getUser(req.params.id);

  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.status(200).json(user);
});

app.post('/users', (req, res) => {
  const user = createUser(req.body);

  // 创建成功返回 201
  res.status(201).json(user);
});

app.delete('/users/:id', (req, res) => {
  deleteUser(req.params.id);

  // 删除成功无内容返回 204
  res.status(204).send();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: '未授权' });
  }
  res.status(500).json({ error: '服务器错误' });
});`}</pre>
            </div>

            <h2>Python Flask 示例</h2>
            <div className="code-block">
              <pre>{`from flask import Flask, jsonify, abort

app = Flask(__name__)

@app.route('/users/<int:user_id>')
def get_user(user_id):
    user = get_user_from_db(user_id)

    if not user:
        # 返回 404
        abort(404, description="用户不存在")

    return jsonify(user), 200

@app.route('/users', methods=['POST'])
def create_user():
    user = create_user_in_db(request.json)

    # 返回 201 Created
    return jsonify(user), 201

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    delete_user_from_db(user_id)

    # 返回 204 No Content
    return '', 204

# 错误处理器
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "资源不存在"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "服务器内部错误"}), 500`}</pre>
            </div>

            <h2>Go Gin 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // GET 请求
    r.GET("/users/:id", func(c *gin.Context) {
        user := getUser(c.Param("id"))
        if user == nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
            return
        }
        c.JSON(http.StatusOK, user)
    })

    // POST 请求 - 返回 201
    r.POST("/users", func(c *gin.Context) {
        user := createUser(c)
        c.JSON(http.StatusCreated, user)
    })

    // DELETE 请求 - 返回 204
    r.DELETE("/users/:id", func(c *gin.Context) {
        deleteUser(c.Param("id"))
        c.Status(http.StatusNoContent)
    })

    // 禁止访问 - 返回 403
    r.GET("/admin", func(c *gin.Context) {
        c.JSON(http.StatusForbidden, gin.H{"error": "禁止访问"})
    })

    r.Run(":8080")
}`}</pre>
            </div>

            <h2>HTTP 状态码常量对照表</h2>
            <div className="code-block">
              <pre>{`// 常用 HTTP 状态码常量
// 可用于代码中直接引用

// 2xx 成功
HTTP_OK                = 200  // 请求成功
HTTP_CREATED           = 201  // 创建成功
HTTP_NO_CONTENT        = 204  // 无内容

// 3xx 重定向
HTTP_MOVED_PERMANENTLY = 301  // 永久重定向
HTTP_FOUND             = 302  // 临时重定向
HTTP_NOT_MODIFIED      = 304  // 未修改

// 4xx 客户端错误
HTTP_BAD_REQUEST       = 400  // 错误请求
HTTP_UNAUTHORIZED      = 401  // 未授权
HTTP_FORBIDDEN         = 403  // 禁止访问
HTTP_NOT_FOUND         = 404  // 未找到
HTTP_METHOD_NOT_ALLOWED = 405 // 方法不允许
HTTP_CONFLICT          = 409  // 冲突
HTTP_TOO_MANY_REQUESTS = 429  // 请求过多

// 5xx 服务器错误
HTTP_INTERNAL_ERROR    = 500  // 服务器内部错误
HTTP_BAD_GATEWAY       = 502  // 错误网关
HTTP_UNAVAILABLE       = 503  // 服务不可用
HTTP_GATEWAY_TIMEOUT   = 504  // 网关超时`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
