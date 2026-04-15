import { useState, useCallback, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function OcrToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>📝 文字识别</h1>
        <p>OCR - Optical Character Recognition 光学字符识别</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>图像预处理</h3>
                <p>对输入图像进行灰度化、二值化、去噪、倾斜校正等操作，提高识别准确率</p>
              </div>
              <div className="feature-card">
                <h3>文字检测</h3>
                <p>定位图像中的文字区域，分离文本行和单个字符</p>
              </div>
              <div className="feature-card">
                <h3>特征提取</h3>
                <p>提取字符的形状特征，如笔画、轮廓、拓扑结构等</p>
              </div>
              <div className="feature-card">
                <h3>模式匹配</h3>
                <p>将提取的特征与字符模板库匹配，识别出对应的文字</p>
              </div>
            </div>

            <h2>OCR 工作流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  输入图像   │ ──▶│  图像预处理  │ ──▶│  文字检测   │
    └─────────────┘    └─────────────┘    └─────────────┘
                                                │
                                                ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  输出文本   │ ◀──│  后处理     │ ◀──│  字符识别   │
    └─────────────┘    └─────────────┘    └─────────────┘
              `}</pre>
            </div>

            <h2>主流 OCR 引擎</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>引擎</th>
                    <th>特点</th>
                    <th>适用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Tesseract</code></td>
                    <td>开源免费，支持多语言</td>
                    <td>印刷体文档、截图识别</td>
                  </tr>
                  <tr>
                    <td><code>PaddleOCR</code></td>
                    <td>国产开源，中文效果好</td>
                    <td>中文场景、移动端部署</td>
                  </tr>
                  <tr>
                    <td><code>EasyOCR</code></td>
                    <td>基于深度学习，支持80+语言</td>
                    <td>多语言场景、自然场景文字</td>
                  </tr>
                  <tr>
                    <td><code>Google Vision</code></td>
                    <td>云端服务，准确率高</td>
                    <td>商业应用、高精度需求</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>文档数字化</strong> - 扫描件、纸质文档转为可编辑文本</li>
              <li><strong>票据识别</strong> - 发票、银行卡、身份证等证件识别</li>
              <li><strong>车牌识别</strong> - 停车场、收费站自动识别车牌号</li>
              <li><strong>翻译辅助</strong> - 拍照翻译、实时字幕翻译</li>
              <li><strong>无障碍阅读</strong> - 帮助视障人士阅读印刷材料</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>OCR 识别演示</h2>
            <OcrDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript / TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// 使用 Tesseract.js 进行 OCR 识别
import Tesseract from 'tesseract.js';

async function recognizeText(imagePath: string) {
  const result = await Tesseract.recognize(
    imagePath,
    'chi_sim+eng', // 中英文
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(\`进度: \${Math.round(m.progress * 100)}%\`);
        }
      }
    }
  );

  return result.data.text;
}

// 使用示例
const text = await recognizeText('./document.png');
console.log('识别结果:', text);`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 使用 pytesseract 进行 OCR 识别
import pytesseract
from PIL import Image

# 打开图像
image = Image.open('document.png')

# 中英文识别
text = pytesseract.image_to_string(
    image,
    lang='chi_sim+eng'
)

print('识别结果:', text)

# 获取详细数据（包含位置信息）
data = pytesseract.image_to_data(
    image,
    lang='chi_sim+eng',
    output_type=pytesseract.Output.DICT
)

for i, word in enumerate(data['text']):
    if word.strip():
        print(f"文字: {word}, 位置: ({data['left'][i]}, {data['top'][i]})")`}</pre>
            </div>

            <h2>Python + PaddleOCR 示例</h2>
            <div className="code-block">
              <pre>{`# 使用 PaddleOCR 进行高精度中文识别
from paddleocr import PaddleOCR

# 初始化 OCR（自动下载模型）
ocr = PaddleOCR(use_angle_cls=True, lang='ch')

# 识别图像
result = ocr.ocr('document.png', cls=True)

# 解析结果
for idx in range(len(result)):
    res = result[idx]
    for line in res:
        # line[0] 是坐标，line[1] 是 (文字, 置信度)
        print(f"文字: {line[1][0]}, 置信度: {line[1][1]:.2f}")`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`// Go 调用 Tesseract OCR (需要安装 gosseract)
package main

import (
    "fmt"
    "github.com/otiai10/gosseract/v2"
)

func main() {
    client := gosseract.NewClient()
    defer client.Close()

    // 设置语言
    client.SetLanguage("chi_sim", "eng")

    // 设置图片路径
    client.SetImage("document.png")

    // 识别文字
    text, err := client.Text()
    if err != nil {
        panic(err)
    }

    fmt.Println("识别结果:", text)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// OCR 演示组件
function OcrDemo() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setRecognizedText('')

    const reader = new FileReader()
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRecognize = async () => {
    if (!imageUrl) {
      setError('请先选择图片')
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      const result = await Tesseract.recognize(imageUrl, 'chi_sim+eng', {
        logger: (m) => {
          if (m.status === 'loading tesseract core') {
            setStatus('加载 Tesseract 核心...')
            setProgress(5)
          } else if (m.status === 'initializing tesseract') {
            setStatus('初始化 Tesseract...')
            setProgress(10)
          } else if (m.status === 'loading language traineddata') {
            setStatus('加载语言包...')
            setProgress(20)
          } else if (m.status === 'initializing api') {
            setStatus('初始化 API...')
            setProgress(30)
          } else if (m.status === 'recognizing text') {
            setStatus('识别文字中...')
            setProgress(30 + Math.round(m.progress * 70))
          }
        }
      })

      setProgress(100)
      setRecognizedText(result.data.text)
      setStatus('识别完成')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'OCR 识别失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setImageUrl(null)
    setRecognizedText('')
    setError(null)
    setProgress(0)
    setStatus('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="ocr-demo" style={{ padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
      {error && (
        <div className="info-box warning" style={{ marginBottom: 16 }}>
          <strong>错误</strong>
          <p>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>选择图片</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ fontSize: 14 }}
        />
      </div>

      {imageUrl && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>图片预览</label>
          <img
            src={imageUrl}
            alt="预览"
            style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid #eee' }}
          />
        </div>
      )}

      <div className="demo-controls" style={{ marginBottom: 16 }}>
        <button onClick={handleRecognize} disabled={!imageUrl || loading}>
          {loading ? `${status} ${progress}%` : '开始识别'}
        </button>
        {recognizedText && (
          <>
            <button onClick={() => onCopy(recognizedText)} style={{ background: '#e0e0e0', color: '#333' }}>
              复制结果
            </button>
            <button onClick={handleClear} style={{ background: '#e0e0e0', color: '#333' }}>
              清除
            </button>
          </>
        )}
      </div>

      {loading && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: '#4fc3f7',
                transition: 'width 0.3s'
              }}
            />
          </div>
        </div>
      )}

      {recognizedText && (
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#333' }}>识别结果</label>
          <pre style={{
            background: '#fff',
            padding: 16,
            borderRadius: 6,
            whiteSpace: 'pre-wrap',
            maxHeight: 300,
            overflow: 'auto',
            fontSize: 13,
            border: '1px solid #eee'
          }}>
            {recognizedText}
          </pre>
        </div>
      )}

      <div className="info-box" style={{ marginTop: 16 }}>
        <strong>提示</strong>
        <p>此工具使用 Tesseract.js 进行本地 OCR 识别，无需上传图片到服务器。首次使用需要下载语言包，请耐心等待。</p>
      </div>
    </div>
  )
}
