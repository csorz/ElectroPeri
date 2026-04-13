import { useState, useCallback } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function SvgEditorToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎨 SVG 编辑器</h1>
        <p>Scalable Vector Graphics - 可缩放矢量图形</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>SVG 核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>矢量图形</h3>
                <p>基于数学公式描述图形，无限缩放不失真，文件体积小</p>
              </div>
              <div className="feature-card">
                <h3>XML 格式</h3>
                <p>使用文本格式存储，可读性好，易于编辑和版本控制</p>
              </div>
              <div className="feature-card">
                <h3>交互动画</h3>
                <p>支持 CSS 动画、JavaScript 交互，创建丰富的动态效果</p>
              </div>
              <div className="feature-card">
                <h3>DOM 集成</h3>
                <p>可直接嵌入 HTML，通过 DOM API 操作，支持事件绑定</p>
              </div>
            </div>

            <h2>SVG 坐标系统</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    viewBox="0 0 200 150"  ─── 定义用户坐标系统

    ┌─────────────────────────────────────┐  ▲
    │ (0,0)                               │  │
    │   ───────────────────────────────▶  │  │ 150 (height)
    │   │                                 │  │
    │   │                                 │  │
    │   ▼                                 │  │
    │                               (200,150)│
    └─────────────────────────────────────┘
          ◀────────────────────────────▶
                    200 (width)
              `}</pre>
            </div>
            <div className="info-box">
              <strong>viewBox 详解</strong>
              <p><code>viewBox="min-x min-y width height"</code> 定义 SVG 的可视区域。配合 <code>preserveAspectRatio</code> 控制缩放和居中行为。</p>
            </div>

            <h2>基础图形元素</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>元素</th>
                    <th>常用属性</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>&lt;rect&gt;</code></td>
                    <td>x, y, width, height, rx, ry</td>
                    <td>矩形、圆角矩形</td>
                  </tr>
                  <tr>
                    <td><code>&lt;circle&gt;</code></td>
                    <td>cx, cy, r</td>
                    <td>圆形</td>
                  </tr>
                  <tr>
                    <td><code>&lt;ellipse&gt;</code></td>
                    <td>cx, cy, rx, ry</td>
                    <td>椭圆</td>
                  </tr>
                  <tr>
                    <td><code>&lt;line&gt;</code></td>
                    <td>x1, y1, x2, y2</td>
                    <td>直线</td>
                  </tr>
                  <tr>
                    <td><code>&lt;polyline&gt;</code></td>
                    <td>points</td>
                    <td>折线（不闭合）</td>
                  </tr>
                  <tr>
                    <td><code>&lt;polygon&gt;</code></td>
                    <td>points</td>
                    <td>多边形（闭合）</td>
                  </tr>
                  <tr>
                    <td><code>&lt;path&gt;</code></td>
                    <td>d (路径命令)</td>
                    <td>任意形状</td>
                  </tr>
                  <tr>
                    <td><code>&lt;text&gt;</code></td>
                    <td>x, y, font-size, text-anchor</td>
                    <td>文本</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Path 路径命令</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>命令</th>
                    <th>含义</th>
                    <th>参数说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>M/m</code></td>
                    <td>移动到</td>
                    <td>M x y - 移动画笔到指定位置</td>
                  </tr>
                  <tr>
                    <td><code>L/l</code></td>
                    <td>直线到</td>
                    <td>L x y - 画直线到指定位置</td>
                  </tr>
                  <tr>
                    <td><code>H/h</code></td>
                    <td>水平线</td>
                    <td>H x - 画水平线</td>
                  </tr>
                  <tr>
                    <td><code>V/v</code></td>
                    <td>垂直线</td>
                    <td>V y - 画垂直线</td>
                  </tr>
                  <tr>
                    <td><code>C/c</code></td>
                    <td>三次贝塞尔</td>
                    <td>C x1 y1 x2 y2 x y</td>
                  </tr>
                  <tr>
                    <td><code>Q/q</code></td>
                    <td>二次贝塞尔</td>
                    <td>Q x1 y1 x y</td>
                  </tr>
                  <tr>
                    <td><code>A/a</code></td>
                    <td>椭圆弧</td>
                    <td>A rx ry rotation large-arc sweep x y</td>
                  </tr>
                  <tr>
                    <td><code>Z/z</code></td>
                    <td>闭合路径</td>
                    <td>连接起点形成闭合图形</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>图标设计</strong> - 网站、App 图标，支持多分辨率</li>
              <li><strong>数据可视化</strong> - 图表、地图、流程图</li>
              <li><strong>Logo 设计</strong> - 品牌标识，保持任意尺寸清晰</li>
              <li><strong>动画效果</strong> - 网页动画、加载动画</li>
              <li><strong>响应式图形</strong> - 自适应不同屏幕尺寸</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>SVG 编辑器</h2>
            <SvgEditorDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>HTML 内嵌 SVG</h2>
            <div className="code-block">
              <pre>{`<!-- 直接在 HTML 中使用 SVG -->
<!DOCTYPE html>
<html>
<body>
  <svg width="200" height="200" viewBox="0 0 200 200">
    <!-- 渐变定义 -->
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4A90D9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#2E5B8B;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- 使用渐变填充 -->
    <circle cx="100" cy="100" r="80" fill="url(#grad1)" />

    <!-- 文本 -->
    <text x="100" y="110" text-anchor="middle"
          fill="white" font-size="24" font-family="Arial">
      SVG
    </text>
  </svg>
</body>
</html>`}</pre>
            </div>

            <h2>React 中使用 SVG</h2>
            <div className="code-block">
              <pre>{`// 方式1: 内联 SVG 组件
const CircleIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#4A90D9" />
  </svg>
);

// 方式2: 使用 SVG 属性
const App = () => {
  const [color, setColor] = useState('#4A90D9');

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50" cy="50" r="40"
        fill={color}
        onClick={() => setColor('#E74C3C')}
        style={{ cursor: 'pointer' }}
      />
    </svg>
  );
};

// 方式3: 使用 SVGR 导入 SVG 文件
// webpack 或 vite 配置后可直接导入
import Logo from './logo.svg';

const Header = () => <Logo className="logo" />;`}</pre>
            </div>

            <h2>CSS 动画 SVG</h2>
            <div className="code-block">
              <pre>{`/* SVG CSS 动画 */
.loading-spinner {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 路径描边动画 */
.path-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 3s ease-in-out forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}

/* HTML */
<svg class="loading-spinner" width="50" height="50">
  <circle cx="25" cy="25" r="20"
          fill="none" stroke="#4fc3f7"
          stroke-width="4" stroke-dasharray="80">
  </circle>
</svg>

<svg width="200" height="200">
  <path class="path-draw"
        d="M 10 100 Q 50 10 100 100 T 190 100"
        fill="none" stroke="#4fc3f7" stroke-width="2"/>
</svg>`}</pre>
            </div>

            <h2>JavaScript 操作 SVG</h2>
            <div className="code-block">
              <pre>{`// 创建 SVG 元素
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('width', '200');
svg.setAttribute('height', '200');
svg.setAttribute('viewBox', '0 0 200 200');

// 创建圆形
const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
circle.setAttribute('cx', '100');
circle.setAttribute('cy', '100');
circle.setAttribute('r', '50');
circle.setAttribute('fill', '#4A90D9');

// 添加事件
circle.addEventListener('click', () => {
  circle.setAttribute('fill', '#E74C3C');
});

svg.appendChild(circle);
document.body.appendChild(svg);

// 使用 Snap.svg 库简化操作
import Snap from 'snapsvg';

const s = Snap(200, 200);
const c = s.circle(100, 100, 50);
c.attr({ fill: '#4A90D9' });

// 动画
c.animate({ r: 80, fill: '#E74C3C' }, 1000);`}</pre>
            </div>

            <h2>Python 生成 SVG</h2>
            <div className="code-block">
              <pre>{`# Python 生成 SVG 图像
def create_svg_chart(data: list) -> str:
    width, height = 400, 300
    bar_width = width / len(data) - 10
    max_val = max(data)

    svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f5f5f5"/>
'''

    for i, val in enumerate(data):
        bar_height = (val / max_val) * (height - 40)
        x = i * (bar_width + 10) + 5
        y = height - bar_height - 20

        svg += f'''  <rect x="{x}" y="{y}"
                width="{bar_width}" height="{bar_height}"
                fill="#4A90D9" rx="4"/>
  <text x="{x + bar_width/2}" y="{height - 5}"
        text-anchor="middle" font-size="12">{val}</text>
'''

    svg += '</svg>'
    return svg

# 使用
data = [10, 25, 15, 30, 20]
svg_content = create_svg_chart(data)

with open('chart.svg', 'w') as f:
    f.write(svg_content)`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// SVG 编辑器演示组件
function SvgEditorDemo() {
  const [svgCode, setSvgCode] = useState(`<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#4A90D9" stroke="#2E5B8B" stroke-width="4"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="24" font-family="Arial">SVG</text>
</svg>`)
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFormat = () => {
    try {
      setError(null)
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgCode, 'image/svg+xml')
      const errorNode = doc.querySelector('parsererror')
      if (errorNode) {
        setError('SVG 格式错误，请检查代码')
        return
      }
      const serializer = new XMLSerializer()
      const formatted = serializer.serializeToString(doc.documentElement)
      setSvgCode(formatted)
    } catch (e) {
      setError('格式化失败')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleMinify = () => {
    try {
      setError(null)
      const minified = svgCode
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .replace(/\s*([{};:,>])\s*/g, '$1')
        .trim()
      setSvgCode(minified)
    } catch (e) {
      setError('压缩失败')
    }
  }

  const presets = [
    {
      name: '圆形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#4A90D9"/>
</svg>`
    },
    {
      name: '矩形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="#E74C3C" rx="10"/>
</svg>`
    },
    {
      name: '三角形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,10 90,90 10,90" fill="#2ECC71"/>
</svg>`
    },
    {
      name: '星形',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="#F1C40F"/>
</svg>`
    },
    {
      name: '渐变',
      code: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4A90D9"/>
      <stop offset="100%" stop-color="#E74C3C"/>
    </linearGradient>
  </defs>
  <rect x="10" y="10" width="80" height="80" fill="url(#grad)" rx="10"/>
</svg>`
    }
  ]

  return (
    <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>预设形状</label>
        <div className="demo-controls">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSvgCode(preset.code)}
              style={{ background: '#e0e0e0', color: '#333' }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>SVG 代码</label>
        <textarea
          value={svgCode}
          onChange={(e) => setSvgCode(e.target.value)}
          placeholder="输入 SVG 代码..."
          rows={8}
          spellCheck={false}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #ddd',
            borderRadius: 6,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 13,
            resize: 'vertical'
          }}
        />
      </div>

      {error && (
        <div className="info-box warning" style={{ marginBottom: 16 }}>
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div className="demo-controls" style={{ marginBottom: 16 }}>
        <button onClick={handleFormat}>格式化</button>
        <button onClick={handleMinify} style={{ background: '#e0e0e0', color: '#333' }}>压缩</button>
        <button onClick={() => onCopy(svgCode)} style={{ background: '#e0e0e0', color: '#333' }}>复制代码</button>
        <button onClick={handleDownload} style={{ background: '#e0e0e0', color: '#333' }}>下载 SVG</button>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>预览</label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 150,
            background: '#fff',
            borderRadius: 6,
            border: '1px solid #eee'
          }}
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />
      </div>
    </div>
  )
}
