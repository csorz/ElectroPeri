import { useState, useCallback, useEffect } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

export default function ContrastToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [foregroundColor, setForegroundColor] = useState('#333333')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [contrastRatio, setContrastRatio] = useState<number>(0)
  const [wcagResults, setWcagResults] = useState<{
    normal: { aa: boolean; aaa: boolean }
    large: { aa: boolean; aaa: boolean }
  }>({ normal: { aa: false, aaa: false }, large: { aa: false, aaa: false } })

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // HEX to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  // 计算相对亮度
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // 计算对比度
  const calculateContrast = (fg: string, bg: string): number => {
    const fgRgb = hexToRgb(fg)
    const bgRgb = hexToRgb(bg)
    if (!fgRgb || !bgRgb) return 0

    const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
    const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)

    const lighter = Math.max(fgLum, bgLum)
    const darker = Math.min(fgLum, bgLum)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // 检查 WCAG 标准
  const checkWcag = (ratio: number) => {
    setWcagResults({
      normal: { aa: ratio >= 4.5, aaa: ratio >= 7 },
      large: { aa: ratio >= 3, aaa: ratio >= 4.5 }
    })
  }

  useEffect(() => {
    const ratio = calculateContrast(foregroundColor, backgroundColor)
    setContrastRatio(ratio)
    checkWcag(ratio)
  }, [foregroundColor, backgroundColor])

  const getContrastLevel = (ratio: number): { level: string; color: string } => {
    if (ratio >= 7) return { level: 'AAA', color: '#00c853' }
    if (ratio >= 4.5) return { level: 'AA', color: '#64dd17' }
    if (ratio >= 3) return { level: 'AA Large', color: '#ffc107' }
    return { level: 'Fail', color: '#ff5252' }
  }

  const { level, color } = getContrastLevel(contrastRatio)

  // 示例文本预览
  const sampleTexts = [
    { text: '普通文本示例', size: '16px' },
    { text: '大号文本示例', size: '24px' },
    { text: '标题文本示例', size: '32px', weight: 'bold' }
  ]

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>对比度计算</h1>
        <p>计算颜色对比度，检查 WCAG 无障碍标准</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>什么是颜色对比度</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>对比度定义</h3>
                <p>两种颜色的相对亮度差异，用于衡量前景色与背景色的可区分程度，公式为 (L1+0.05)/(L2+0.05)。</p>
              </div>
              <div className="feature-card">
                <h3>相对亮度</h3>
                <p>根据人眼对不同颜色敏感度加权计算的亮度值，绿色权重最高(0.7152)，蓝色最低(0.0722)。</p>
              </div>
              <div className="feature-card">
                <h3>对比度比值</h3>
                <p>范围从 1:1（无对比）到 21:1（最高对比，如黑白），比值越高越容易区分。</p>
              </div>
              <div className="feature-card">
                <h3>无障碍设计</h3>
                <p>确保视觉障碍用户也能阅读内容，符合 WCAG 标准的对比度要求。</p>
              </div>
            </div>

            <h2>WCAG 对比度标准</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>级别</th>
                    <th>普通文本</th>
                    <th>大号文本</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style={{ color: '#64dd17' }}>AA</strong></td>
                    <td>≥ 4.5:1</td>
                    <td>≥ 3:1</td>
                    <td>最低可接受标准，适合大多数场景</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#00c853' }}>AAA</strong></td>
                    <td>≥ 7:1</td>
                    <td>≥ 4.5:1</td>
                    <td>增强标准，适合视力障碍用户</td>
                  </tr>
                  <tr>
                    <td><strong style={{ color: '#ff5252' }}>Fail</strong></td>
                    <td>&lt; 4.5:1</td>
                    <td>&lt; 3:1</td>
                    <td>不符合无障碍标准</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-box">
              <strong>大号文本定义</strong>
              <ul>
                <li><strong>普通粗细</strong> - 字体大小 ≥ 18px (或 18pt)</li>
                <li><strong>粗体</strong> - 字体大小 ≥ 14px (或 14pt) 且 font-weight: bold</li>
                <li>大号文本由于尺寸更大，可以接受较低的对比度</li>
              </ul>
            </div>

            <h2>亮度计算公式</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    相对亮度 (Relative Luminance) 计算:

    步骤1: 将 RGB 值归一化到 0-1
           R' = R / 255, G' = G / 255, B' = B / 255

    步骤2: 根据 sRGB 标准转换
           if C <= 0.03928: C' = C / 12.92
           else: C' = ((C + 0.055) / 1.055) ^ 2.4

    步骤3: 加权求和
           L = 0.2126 * R' + 0.7152 * G' + 0.0722 * B'

    ┌─────────────────────────────────────────────┐
    │  权重分布:                                  │
    │  ────────────────────────────────────────   │
    │  ████████████████████████████████ R: 21.26% │
    │  ████████████████████████████████████████   │
    │  ██████████████████████████████████████████ │
    │  ████████████████████████████████████████   │
    │  ██████████████████████████████████████████ │
    │  ████████████████████████████████████████   │
    │  G: 71.52% (人眼最敏感)                     │
    │  ████ B: 7.22%                              │
    └─────────────────────────────────────────────┘

    对比度计算:
    ┌─────────────────────────────────────────────┐
    │  Contrast = (L1 + 0.05) / (L2 + 0.05)       │
    │                                             │
    │  L1 = 较亮的颜色亮度                        │
    │  L2 = 较暗的颜色亮度                        │
    │  0.05 = 补偿值，避免除以0                   │
    └─────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>网页设计</strong> - 确保文字与背景对比度符合 WCAG 标准</li>
              <li><strong>UI 组件</strong> - 按钮文字、输入框标签等元素的对比度检查</li>
              <li><strong>品牌配色</strong> - 选择可访问的品牌色与辅助色组合</li>
              <li><strong>无障碍审核</strong> - 评估现有设计的可访问性合规性</li>
              <li><strong>主题设计</strong> - 深色/浅色主题的颜色方案验证</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>对比度计算器</h2>
            <div className="contrast-demo">
              {/* 对比度显示 */}
              <div className="result-box" style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '48px', marginBottom: '8px' }}>{contrastRatio.toFixed(2)}:1</h4>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 16px',
                  borderRadius: '16px',
                  background: color,
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {level}
                </span>
              </div>

              {/* 颜色选择 */}
              <div className="config-grid">
                <div className="config-item">
                  <label>前景色（文字）</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>
                <div className="config-item">
                  <label>背景色</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* WCAG 标准 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>WCAG 合规性</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>普通文本 (14px+)</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>
                      <span>AA (≥ 4.5:1)</span>
                      <span style={{ color: wcagResults.normal.aa ? '#00c853' : '#ff5252' }}>
                        {wcagResults.normal.aa ? '通过' : '失败'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>
                      <span>AAA (≥ 7:1)</span>
                      <span style={{ color: wcagResults.normal.aaa ? '#00c853' : '#ff5252' }}>
                        {wcagResults.normal.aaa ? '通过' : '失败'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>大号文本 (18px+ 或 14px 粗体)</h4>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>
                      <span>AA (≥ 3:1)</span>
                      <span style={{ color: wcagResults.large.aa ? '#00c853' : '#ff5252' }}>
                        {wcagResults.large.aa ? '通过' : '失败'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff', borderRadius: '4px' }}>
                      <span>AAA (≥ 4.5:1)</span>
                      <span style={{ color: wcagResults.large.aaa ? '#00c853' : '#ff5252' }}>
                        {wcagResults.large.aaa ? '通过' : '失败'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 预览 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>效果预览</h3>
              <div
                style={{
                  padding: '24px',
                  borderRadius: '8px',
                  background: backgroundColor,
                  display: 'grid',
                  gap: '16px'
                }}
              >
                {sampleTexts.map((sample, index) => (
                  <div
                    key={index}
                    style={{
                      color: foregroundColor,
                      fontSize: sample.size,
                      fontWeight: sample.weight as any
                    }}
                  >
                    {sample.text}
                  </div>
                ))}
              </div>

              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={() => onCopy(`${contrastRatio.toFixed(2)}:1`)}>复制对比度</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript/TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// WCAG 对比度计算工具
class ContrastChecker {
  // 计算相对亮度
  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // HEX 转 RGB
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // 计算对比度
  static getContrastRatio(fg: string, bg: string): number {
    const fgRgb = this.hexToRgb(fg);
    const bgRgb = this.hexToRgb(bg);
    if (!fgRgb || !bgRgb) return 0;

    const fgLum = this.getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLum = this.getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);

    return (lighter + 0.05) / (darker + 0.05);
  }

  // 检查 WCAG 合规性
  static checkWCAG(ratio: number): {
    normal: { aa: boolean; aaa: boolean };
    large: { aa: boolean; aaa: boolean };
  } {
    return {
      normal: { aa: ratio >= 4.5, aaa: ratio >= 7 },
      large: { aa: ratio >= 3, aaa: ratio >= 4.5 }
    };
  }

  // 获取对比度等级
  static getRating(ratio: number): string {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }
}

// 使用示例
const ratio = ContrastChecker.getContrastRatio('#333333', '#ffffff');
console.log(\`对比度: \${ratio.toFixed(2)}:1\`);
console.log(\`等级: \${ContrastChecker.getRating(ratio)}\`);

const wcag = ContrastChecker.checkWCAG(ratio);
console.log(\`普通文本 AA: \${wcag.normal.aa}\`);
console.log(\`普通文本 AAA: \${wcag.normal.aaa}\`);`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import math

def hex_to_rgb(hex_color: str) -> tuple:
    """HEX 转 RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_luminance(r: int, g: int, b: int) -> float:
    """计算相对亮度"""
    def adjust(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else math.pow((c + 0.055) / 1.055, 2.4)

    rs, gs, bs = adjust(r), adjust(g), adjust(b)
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs

def get_contrast_ratio(fg: str, bg: str) -> float:
    """计算对比度"""
    r1, g1, b1 = hex_to_rgb(fg)
    r2, g2, b2 = hex_to_rgb(bg)

    lum1 = get_luminance(r1, g1, b1)
    lum2 = get_luminance(r2, g2, b2)

    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)

def check_wcag(ratio: float) -> dict:
    """检查 WCAG 合规性"""
    return {
        'normal': {'aa': ratio >= 4.5, 'aaa': ratio >= 7},
        'large': {'aa': ratio >= 3, 'aaa': ratio >= 4.5}
    }

def get_rating(ratio: float) -> str:
    """获取对比度等级"""
    if ratio >= 7:
        return 'AAA'
    elif ratio >= 4.5:
        return 'AA'
    elif ratio >= 3:
        return 'AA Large'
    return 'Fail'

# 使用示例
ratio = get_contrast_ratio('#333333', '#ffffff')
print(f"对比度: {ratio:.2f}:1")
print(f"等级: {get_rating(ratio)}")
print(f"WCAG: {check_wcag(ratio)}")`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "math"
    "strconv"
)

// HEXToRGB HEX转RGB
func HEXToRGB(hex string) (r, g, b uint8, err error) {
    if len(hex) > 0 && hex[0] == '#' {
        hex = hex[1:]
    }
    val, err := strconv.ParseUint(hex, 16, 32)
    if err != nil {
        return 0, 0, 0, err
    }
    r = uint8((val >> 16) & 0xFF)
    g = uint8((val >> 8) & 0xFF)
    b = uint8(val & 0xFF)
    return r, g, b, nil
}

// GetLuminance 计算相对亮度
func GetLuminance(r, g, b uint8) float64 {
    adjust := func(c uint8) float64 {
        cf := float64(c) / 255
        if cf <= 0.03928 {
            return cf / 12.92
        }
        return math.Pow((cf+0.055)/1.055, 2.4)
    }
    return 0.2126*adjust(r) + 0.7152*adjust(g) + 0.0722*adjust(b)
}

// GetContrastRatio 计算对比度
func GetContrastRatio(fg, bg string) (float64, error) {
    r1, g1, b1, err := HEXToRGB(fg)
    if err != nil {
        return 0, err
    }
    r2, g2, b2, err := HEXToRGB(bg)
    if err != nil {
        return 0, err
    }

    lum1 := GetLuminance(r1, g1, b1)
    lum2 := GetLuminance(r2, g2, b2)

    lighter := math.Max(lum1, lum2)
    darker := math.Min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05), nil
}

// GetRating 获取对比度等级
func GetRating(ratio float64) string {
    switch {
    case ratio >= 7:
        return "AAA"
    case ratio >= 4.5:
        return "AA"
    case ratio >= 3:
        return "AA Large"
    default:
        return "Fail"
    }
}

func main() {
    ratio, _ := GetContrastRatio("333333", "ffffff")
    fmt.Printf("对比度: %.2f:1\\n", ratio)
    fmt.Printf("等级: %s\\n", GetRating(ratio))
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
