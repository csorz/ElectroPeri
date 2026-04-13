import { useState, useCallback, useEffect } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

export default function ColorConvertToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [hex, setHex] = useState('#ff5722')
  const [rgb, setRgb] = useState<RGB>({ r: 255, g: 87, b: 34 })
  const [hsl, setHsl] = useState<HSL>({ h: 14, s: 100, l: 56 })
  const [error, setError] = useState<string | null>(null)

  const onCopy = useCallback((t: string) => void copyToClipboard(t), [])

  // RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // HEX to RGB
  const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    }
  }

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): HSL => {
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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  // HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): RGB => {
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

  // 更新所有值
  const updateFromHex = (newHex: string) => {
    setError(null)
    setHex(newHex)
    const rgbVal = hexToRgb(newHex)
    if (rgbVal) {
      setRgb(rgbVal)
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b))
    } else if (newHex.length >= 7) {
      setError('无效的 HEX 颜色值')
    }
  }

  const updateFromRgb = (newRgb: RGB) => {
    setError(null)
    setRgb(newRgb)
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
  }

  const updateFromHsl = (newHsl: HSL) => {
    setError(null)
    setHsl(newHsl)
    const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(rgbVal)
    setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b))
  }

  useEffect(() => {
    updateFromHex(hex)
  }, [])

  const colorStrings = {
    hex: hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>颜色转换</h1>
        <p>RGB、HSL、HEX 颜色格式互转</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>颜色模型概述</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>RGB 模型</h3>
                <p>基于红(Red)、绿(Green)、蓝(Blue)三原色的加色模型，每个通道取值 0-255，适用于显示器等发光设备。</p>
              </div>
              <div className="feature-card">
                <h3>HEX 表示</h3>
                <p>将 RGB 各通道转换为两位十六进制数，格式为 #RRGGBB，如 #FF5722，简洁且广泛用于 CSS。</p>
              </div>
              <div className="feature-card">
                <h3>HSL 模型</h3>
                <p>基于色相(Hue)、饱和度(Saturation)、亮度(Lightness)的表示方式，更符合人类直觉，便于调色。</p>
              </div>
              <div className="feature-card">
                <h3>HSV/HSB 模型</h3>
                <p>与 HSL 类似，但用明度(Value/Brightness)替代亮度，常用于图像编辑软件的颜色选择器。</p>
              </div>
            </div>

            <h2>色彩理论基础</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────┐
    │                    色相环 (Hue)                      │
    │                                                     │
    │           红(0°)                                    │
    │              │                                      │
    │   品红(300°) ─┼─ 橙(30°)                            │
    │              │                                      │
    │   蓝(240°) ───┼─── 黄(60°)                          │
    │              │                                      │
    │   青(180°) ───┼─── 绿(120°)                         │
    │              │                                      │
    │                                                     │
    │   饱和度(S): 0%(灰) ──────────→ 100%(纯色)          │
    │   亮度(L):   0%(黑) ────────→ 50%(正常) ────→ 100%(白)│
    └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <div className="info-box">
              <strong>加色模型 vs 减色模型</strong>
              <ul>
                <li><strong>加色模型 (RGB)</strong> - 光的三原色叠加，越叠加越亮，用于显示器</li>
                <li><strong>减色模型 (CMYK)</strong> - 颜料三原色叠加，越叠加越暗，用于印刷</li>
              </ul>
            </div>

            <h2>格式转换原理</h2>
            <div className="scenario-grid">
              <div className="scenario-card">
                <h4>HEX → RGB</h4>
                <p>将每两位十六进制字符转换为十进制，如 #FF → 255</p>
              </div>
              <div className="scenario-card">
                <h4>RGB → HSL</h4>
                <p>计算最大最小值确定色相，根据亮度计算饱和度</p>
              </div>
              <div className="scenario-card">
                <h4>HSL → RGB</h4>
                <p>根据色相分区计算中间值，结合饱和度和亮度还原</p>
              </div>
              <div className="scenario-card">
                <h4>RGB → HEX</h4>
                <p>将各通道十进制值转换为两位十六进制字符串</p>
              </div>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>Web 开发</strong> - CSS 样式中定义颜色值，支持 HEX、RGB、HSL 等格式</li>
              <li><strong>UI 设计</strong> - 设计稿颜色标注与前端实现的颜色转换</li>
              <li><strong>图像处理</strong> - 图片滤镜、色彩调整算法实现</li>
              <li><strong>数据可视化</strong> - 图表配色、热力图颜色映射</li>
              <li><strong>主题切换</strong> - 深色/浅色主题的颜色计算与转换</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>颜色转换工具</h2>
            <div className="color-convert-demo">
              {error && (
                <div className="info-box warning" style={{ marginBottom: '16px' }}>
                  <strong>错误</strong>
                  <p>{error}</p>
                </div>
              )}

              {/* 颜色预览 */}
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  background: hex,
                  marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />

              {/* HEX 输入 */}
              <div className="config-grid">
                <div className="config-item">
                  <label>HEX</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => updateFromHex(e.target.value)}
                      style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={hex}
                      onChange={(e) => updateFromHex(e.target.value)}
                      placeholder="#000000"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* RGB 输入 */}
              <div className="config-grid" style={{ marginTop: '16px' }}>
                <div className="config-item">
                  <label>R (红色 0-255)</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => updateFromRgb({ ...rgb, r: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div className="config-item">
                  <label>G (绿色 0-255)</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => updateFromRgb({ ...rgb, g: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div className="config-item">
                  <label>B (蓝色 0-255)</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => updateFromRgb({ ...rgb, b: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* HSL 输入 */}
              <div className="config-grid" style={{ marginTop: '16px' }}>
                <div className="config-item">
                  <label>H (色相 0-360)</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) => updateFromHsl({ ...hsl, h: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div className="config-item">
                  <label>S (饱和度 0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => updateFromHsl({ ...hsl, s: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div className="config-item">
                  <label>L (亮度 0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => updateFromHsl({ ...hsl, l: parseInt(e.target.value) || 0 })}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* 输出格式 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>CSS 颜色值</h3>
              <div className="config-table">
                <table>
                  <thead>
                    <tr>
                      <th>格式</th>
                      <th>值</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(colorStrings).map(([key, value]) => (
                      <tr key={key}>
                        <td><strong>{key.toUpperCase()}</strong></td>
                        <td><code>{value}</code></td>
                        <td>
                          <button
                            onClick={() => onCopy(value)}
                            style={{ padding: '4px 12px', fontSize: '12px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            复制
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript/TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// 颜色转换工具类
class ColorConverter {
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

  // RGB 转 HEX
  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(Math.min(255, Math.max(0, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return \`#\${toHex(r)}\${toHex(g)}\${toHex(b)}\`;
  }

  // RGB 转 HSL
  static rgbToHsl(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
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
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // HSL 转 RGB
  static hslToRgb(h: number, s: number, l: number) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
}

// 使用示例
const rgb = ColorConverter.hexToRgb('#ff5722');
console.log(rgb); // { r: 255, g: 87, b: 34 }

const hsl = ColorConverter.rgbToHsl(255, 87, 34);
console.log(hsl); // { h: 14, s: 100, l: 56 }

const hex = ColorConverter.rgbToHex(255, 87, 34);
console.log(hex); // #ff5722`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 颜色转换工具
def hex_to_rgb(hex_color: str) -> tuple:
    """HEX 转 RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(r: int, g: int, b: int) -> str:
    """RGB 转 HEX"""
    return f'#{r:02x}{g:02x}{b:02x}'

def rgb_to_hsl(r: int, g: int, b: int) -> tuple:
    """RGB 转 HSL"""
    r, g, b = r/255, g/255, b/255
    max_c, min_c = max(r, g, b), min(r, g, b)
    l = (max_c + min_c) / 2

    if max_c == min_c:
        h = s = 0
    else:
        d = max_c - min_c
        s = d / (2 - max_c - min_c) if l > 0.5 else d / (max_c + min_c)
        if max_c == r:
            h = (g - b) / d + (6 if g < b else 0)
        elif max_c == g:
            h = (b - r) / d + 2
        else:
            h = (r - g) / d + 4
        h /= 6

    return round(h * 360), round(s * 100), round(l * 100)

# 使用示例
print(hex_to_rgb('#ff5722'))  # (255, 87, 34)
print(rgb_to_hsl(255, 87, 34))  # (14, 100, 56)
print(rgb_to_hex(255, 87, 34))  # #ff5722`}</pre>
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

// RGBToHEX RGB转HEX
func RGBToHEX(r, g, b uint8) string {
    return fmt.Sprintf("#%02X%02X%02X", r, g, b)
}

// RGBToHSL RGB转HSL
func RGBToHSL(r, g, b uint8) (h, s, l float64) {
    rf, gf, bf := float64(r)/255, float64(g)/255, float64(b)/255
    max := math.Max(math.Max(rf, gf), bf)
    min := math.Min(math.Min(rf, gf), bf)
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
        case rf:
            h = (gf - bf) / d
            if gf < bf {
                h += 6
            }
        case gf:
            h = (bf-rf)/d + 2
        case bf:
            h = (rf-gf)/d + 4
        }
        h /= 6
    }
    return h * 360, s * 100, l * 100
}

func main() {
    r, g, b, _ := HEXToRGB("ff5722")
    fmt.Printf("RGB: %d, %d, %d\\n", r, g, b)  // RGB: 255, 87, 34

    h, s, l := RGBToHSL(r, g, b)
    fmt.Printf("HSL: %.0f, %.0f, %.0f\\n", h, s, l)  // HSL: 14, 100, 56

    hex := RGBToHEX(r, g, b)
    fmt.Printf("HEX: %s\\n", hex)  // HEX: #FF5722
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
