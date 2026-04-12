import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { copyToClipboard } from '../clipboard'
import '../toolbox.css'

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
  if (code >= 100 && code < 200) return '#17a2b8' // info
  if (code >= 200 && code < 300) return '#28a745' // success
  if (code >= 300 && code < 400) return '#ffc107' // warning
  if (code >= 400 && code < 500) return '#fd7e14' // client error
  if (code >= 500) return '#dc3545' // server error
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
  const [search, setSearch] = useState('')
  const [selectedCode, setSelectedCode] = useState<number | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const filteredCodes = httpStatusCodes.filter(
    (item) =>
      item.code.toString().includes(search) ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.includes(search)
  )

  const selectedItem = selectedCode ? httpStatusCodes.find((item) => item.code === selectedCode) : null

  return (
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/http" className="toolbox-back">
        ← 返回请求调试
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">📊</span>
          <h1>HTTP 状态码查询</h1>
        </div>
        <p className="page-sub">常见 HTTP 状态码对照表</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <input
            type="text"
            className="tool-textarea"
            style={{ height: 'auto', padding: '12px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索状态码、名称或描述..."
          />
        </div>

        {selectedItem && (
          <div className="tool-block" style={{ background: '#f0f7ff', borderColor: '#007bff' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getCategoryColor(selectedItem.code),
                    }}
                  >
                    {selectedItem.code}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedItem.name}</span>
                </div>
                <div style={{ color: '#666' }}>{selectedItem.description}</div>
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    padding: '2px 8px',
                    background: getCategoryColor(selectedItem.code),
                    color: '#fff',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  {getCategoryName(selectedItem.code)}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', flexShrink: 0 }}
                onClick={() =>
                  onCopy(`${selectedItem.code} ${selectedItem.name}: ${selectedItem.description}`)
                }
              >
                复制
              </button>
            </div>
          </div>
        )}

        <div className="tool-block">
          <div className="tool-block-title">状态码列表</div>
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
                  className="mono"
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: getCategoryColor(item.code),
                    minWidth: '50px',
                  }}
                >
                  {item.code}
                </span>
                <span style={{ marginLeft: '12px', fontWeight: '500' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
