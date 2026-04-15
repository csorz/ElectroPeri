import { useState, useCallback } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

interface ColorInfo {
  hex: string
  rgb: string
  name?: string
}

export default function ColorPaletteToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')
  const [baseColor, setBaseColor] = useState('#3498db')
  const [paletteType, setPaletteType] = useState<'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic'>('complementary')
  const [palette, setPalette] = useState<ColorInfo[]>([])

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

  // RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360; s /= 100; l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }

  const generatePalette = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const colors: ColorInfo[] = []

    const addColor = (h: number, s: number, l: number, name?: string) => {
      const newRgb = hslToRgb(h, s, l)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      colors.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name
      })
    }

    switch (paletteType) {
      case 'complementary':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 180) % 360, hsl.s, hsl.l, '互补色')
        break
      case 'analogous':
        addColor((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 30) % 360, hsl.s, hsl.l)
        break
      case 'triadic':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 120) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 240) % 360, hsl.s, hsl.l)
        break
      case 'split':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 150) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 210) % 360, hsl.s, hsl.l)
        break
      case 'tetradic':
        addColor(hsl.h, hsl.s, hsl.l, '基础色')
        addColor((hsl.h + 90) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 180) % 360, hsl.s, hsl.l)
        addColor((hsl.h + 270) % 360, hsl.s, hsl.l)
        break
    }

    setPalette(colors)
  }

  const generateShades = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const shades: ColorInfo[] = []

    for (let i = 95; i >= 5; i -= 10) {
      const newRgb = hslToRgb(hsl.h, hsl.s, i)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      shades.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name: `${i}%`
      })
    }

    setPalette(shades)
  }

  const generateTints = () => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const tints: ColorInfo[] = []

    for (let s = 100; s >= 10; s -= 10) {
      const newRgb = hslToRgb(hsl.h, s, hsl.l)
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
      tints.push({
        hex,
        rgb: `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`,
        name: `${s}% 饱和度`
      })
    }

    setPalette(tints)
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>调色板</h1>
        <p>根据基础色生成配色方案</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>配色理论</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>互补色</h3>
                <p>色相环上相差 180 度的两个颜色，对比强烈，适合突出重点元素。</p>
              </div>
              <div className="feature-card">
                <h3>类似色</h3>
                <p>色相环上相邻的颜色（相差 30 度左右），搭配和谐，营造统一氛围。</p>
              </div>
              <div className="feature-card">
                <h3>三角色</h3>
                <p>色相环上等距分布的三个颜色（相差 120 度），色彩丰富且平衡。</p>
              </div>
              <div className="feature-card">
                <h3>分裂互补</h3>
                <p>基础色与互补色两侧的颜色组合，比互补色更柔和但仍有对比。</p>
              </div>
            </div>

            <h2>色相环示意图</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
                          红(0°)
                           │
                  品红 ────┼──── 橙
                 (300°)    │    (30°)
                          │
              蓝 ─────────┼───────── 黄
             (240°)       │       (60°)
                          │
                  青 ─────┼──── 绿
                 (180°)   │   (120°)
                          │
                        色相环

    配色方案角度关系:
    ┌────────────────────────────────────────────┐
    │ 互补色:   基础色 ←──180°──→ 互补色         │
    │ 类似色:   邻居色 ←─30°─ 基础色 ─30°─→ 邻居色│
    │ 三角色:   基础色 ─120°→ 色2 ─120°→ 色3     │
    │ 分裂互补: 基础色 ─150°→ 色1 ─60°→ 色2      │
    │ 四角色:   基础色 ─90°→ 色2 ─90°→ 色3 ─90°→ 色4│
    └────────────────────────────────────────────┘
              `}</pre>
            </div>

            <h2>明暗与饱和度</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>明暗变化 (Shades)</h4>
                <p>保持色相和饱和度不变，调整亮度从 5% 到 95%，生成一系列明暗渐变色。</p>
              </div>
              <div className="scenario-card">
                <h4>饱和度变化 (Tints)</h4>
                <p>保持色相和亮度不变，调整饱和度从 10% 到 100%，生成从灰色到纯色的渐变。</p>
              </div>
            </div>

            <div className="info-box">
              <strong>设计原则</strong>
              <ul>
                <li><strong>60-30-10 法则</strong> - 主色 60%，辅色 30%，强调色 10%</li>
                <li><strong>色彩数量</strong> - 界面配色建议不超过 3-5 种主要颜色</li>
                <li><strong>对比度</strong> - 确保文字与背景有足够对比度 (WCAG AA 标准)</li>
                <li><strong>情感表达</strong> - 暖色传递热情活力，冷色传递专业稳重</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>品牌设计</strong> - 根据品牌主色生成配套的辅助色系</li>
              <li><strong>UI 界面</strong> - 为按钮、背景、边框等元素提供和谐配色</li>
              <li><strong>数据可视化</strong> - 图表配色，区分不同数据系列</li>
              <li><strong>主题切换</strong> - 生成深色/浅色主题的颜色变体</li>
              <li><strong>无障碍设计</strong> - 为色盲用户提供可区分的配色方案</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>配色生成器</h2>
            <div className="palette-demo">
              {/* 基础颜色选择 */}
              <div className="config-grid">
                <div className="config-item">
                  <label>基础颜色</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>
                <div className="config-item">
                  <label>配色类型</label>
                  <select
                    value={paletteType}
                    onChange={(e) => setPaletteType(e.target.value as typeof paletteType)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  >
                    <option value="complementary">互补色</option>
                    <option value="analogous">类似色</option>
                    <option value="triadic">三角色</option>
                    <option value="split">分裂互补</option>
                    <option value="tetradic">四角色</option>
                  </select>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="demo-controls" style={{ marginTop: '16px' }}>
                <button onClick={generatePalette}>生成配色</button>
                <button onClick={generateShades}>明暗变化</button>
                <button onClick={generateTints}>饱和度变化</button>
              </div>

              {/* 配色结果 */}
              {palette.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>配色方案</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                    {palette.map((color, index) => (
                      <div
                        key={index}
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div
                          style={{
                            height: '80px',
                            background: color.hex,
                            cursor: 'pointer'
                          }}
                          onClick={() => onCopy(color.hex)}
                          title="点击复制 HEX"
                        />
                        <div style={{ padding: '8px', background: '#f8f9fa' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{color.name}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{color.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CSS 变量输出 */}
              {palette.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>CSS 变量</h3>
                  <div className="packet-output" style={{ marginBottom: '12px' }}>
{`:root {
${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}
}`}
                  </div>
                  <button
                    onClick={() => onCopy(`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`)}
                    style={{ padding: '8px 16px', fontSize: '13px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    复制 CSS 变量
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript/TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// 配色生成工具
class ColorPaletteGenerator {
  // HEX 转 HSL
  static hexToHsl(hex: string) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  // 生成互补色
  static complementary(baseHex: string): string[] {
    const hsl = this.hexToHsl(baseHex);
    if (!hsl) return [];
    return [
      baseHex,
      this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
    ];
  }

  // 生成类似色
  static analogous(baseHex: string): string[] {
    const hsl = this.hexToHsl(baseHex);
    if (!hsl) return [];
    return [
      this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      baseHex,
      this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
    ];
  }

  // 生成三角色
  static triadic(baseHex: string): string[] {
    const hsl = this.hexToHsl(baseHex);
    if (!hsl) return [];
    return [
      baseHex,
      this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ];
  }

  // 生成明暗变化
  static shades(baseHex: string, count: number = 10): string[] {
    const hsl = this.hexToHsl(baseHex);
    if (!hsl) return [];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const l = 5 + (i / (count - 1)) * 90;
      result.push(this.hslToHex(hsl.h, hsl.s, l));
    }
    return result;
  }

  // HSL 转 HEX (辅助函数)
  static hslToHex(h: number, s: number, l: number): string {
    // ... 实现略
    return '#000000';
  }
}

// 使用示例
const palette = ColorPaletteGenerator.complementary('#3498db');
console.log(palette); // ['#3498db', '#e74c3c']

const triadic = ColorPaletteGenerator.triadic('#3498db');
console.log(triadic); // ['#3498db', '#db3498', '#98db34']`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import colorsys

def hex_to_rgb(hex_color: str) -> tuple:
    """HEX 转 RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    """RGB 转 HEX"""
    return f'#{r:02x}{g:02x}{b:02x}'

def generate_complementary(hex_color: str) -> list:
    """生成互补色"""
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)

    # 互补色：色相 + 0.5
    h2 = (h + 0.5) % 1.0
    r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)

    return [hex_color, rgb_to_hex(int(r2*255), int(g2*255), int(b2*255))]

def generate_analogous(hex_color: str) -> list:
    """生成类似色"""
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)

    colors = [hex_color]
    for offset in [-0.083, 0.083]:  # 约30度
        h2 = (h + offset) % 1.0
        r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
        colors.append(rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))

    return colors

def generate_triadic(hex_color: str) -> list:
    """生成三角色"""
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)

    colors = [hex_color]
    for offset in [1/3, 2/3]:  # 120度和240度
        h2 = (h + offset) % 1.0
        r2, g2, b2 = colorsys.hls_to_rgb(h2, l, s)
        colors.append(rgb_to_hex(int(r2*255), int(g2*255), int(b2*255)))

    return colors

# 使用示例
print(generate_complementary('#3498db'))  // ['#3498db', '#db4c34']
print(generate_analogous('#3498db'))       // ['#3498db', '#3478db', '#34db8c']
print(generate_triadic('#3498db'))         // ['#3498db', '#9834db', '#db9834']`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "image/color"
    "math"
)

// HEXToRGB HEX转RGB
func HEXToRGB(hex string) color.RGBA {
    var r, g, b uint8
    fmt.Sscanf(hex, "#%02x%02x%02x", &r, &g, &b)
    return color.RGBA{R: r, G: g, B: b, A: 255}
}

// RGBToHEX RGB转HEX
func RGBToHEX(c color.RGBA) string {
    return fmt.Sprintf("#%02X%02X%02X", c.R, c.G, c.B)
}

// RGBToHSL RGB转HSL
func RGBToHSL(c color.RGBA) (h, s, l float64) {
    r, g, b := float64(c.R)/255, float64(c.G)/255, float64(c.B)/255
    max := math.Max(math.Max(r, g), b)
    min := math.Min(math.Min(r, g), b)
    l = (max + min) / 2

    if max == min {
        h, s = 0, 0
    } else {
        d := max - min
        if l > 0.5 {
            s = d / (2 - max - min)
        } else {
            s = d / (max + min)
        }
        switch max {
        case r:
            h = (g - b) / d
            if g < b {
                h += 6
            }
        case g:
            h = (b - r)/d + 2
        case b:
            h = (r - g)/d + 4
        }
        h /= 6
    }
    return h * 360, s * 100, l * 100
}

// GenerateComplementary 生成互补色
func GenerateComplementary(hex string) []string {
    base := HEXToRGB(hex)
    h, s, l := RGBToHSL(base)
    h2 := math.Mod(h+180, 360)
    complement := HSLToRGB(h2, s, l)
    return []string{hex, RGBToHEX(complement)}
}

// HSLToRGB HSL转RGB (简化版)
func HSLToRGB(h, s, l float64) color.RGBA {
    // 完整实现略...
    return color.RGBA{}
}

func main() {
    palette := GenerateComplementary("#3498db")
    fmt.Println(palette) // [#3498db #DB4C34]
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
