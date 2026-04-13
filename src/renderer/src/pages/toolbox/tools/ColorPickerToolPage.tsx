import { useState, useCallback } from 'react'
import { copyToClipboard } from '../clipboard'
import './ToolPage.css'

interface ColorHistory {
  hex: string
  rgb: string
  hsl: string
}

export default function ColorPickerToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')
  const [color, setColor] = useState('#3498db')
  const [history, setHistory] = useState<ColorHistory[]>([])

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

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const rgb = hexToRgb(color)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 }

  const colorFormats = [
    { label: 'HEX', value: color },
    { label: 'RGB', value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '' },
    { label: 'RGBA', value: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '' },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` }
  ]

  const addToHistory = () => {
    const newEntry: ColorHistory = {
      hex: color,
      rgb: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '',
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    }
    if (!history.find(h => h.hex === color)) {
      setHistory([newEntry, ...history].slice(0, 20))
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const presetColors = [
    '#ff5722', '#ff9800', '#ffc107', '#8bc34a', '#4caf50',
    '#00bcd4', '#03a9f4', '#2196f3', '#3f51b5', '#673ab7',
    '#9c27b0', '#e91e63', '#f44336', '#795548', '#607d8b',
    '#000000', '#333333', '#666666', '#999999', '#ffffff'
  ]

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>颜色提取</h1>
        <p>颜色选择与格式转换</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>颜色提取概述</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>颜色选择器</h3>
                <p>基于浏览器原生颜色选择器，支持 HSL/HSV 模式选择，提供直观的颜色选取体验。</p>
              </div>
              <div className="feature-card">
                <h3>多格式输出</h3>
                <p>自动转换为 HEX、RGB、RGBA、HSL、HSLA 等多种格式，方便不同场景使用。</p>
              </div>
              <div className="feature-card">
                <h3>历史记录</h3>
                <p>保存最近使用的颜色，方便重复使用，提高工作效率。</p>
              </div>
              <div className="feature-card">
                <h3>预设色板</h3>
                <p>提供常用颜色快速选择，包括 Material Design 配色和中性色系列。</p>
              </div>
            </div>

            <h2>CSS 颜色格式</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>格式</th>
                    <th>语法</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>HEX</strong></td>
                    <td><code>#RRGGBB</code> 或 <code>#RGB</code></td>
                    <td>#ff5722, #f52</td>
                  </tr>
                  <tr>
                    <td><strong>RGB</strong></td>
                    <td><code>rgb(r, g, b)</code></td>
                    <td>rgb(255, 87, 34)</td>
                  </tr>
                  <tr>
                    <td><strong>RGBA</strong></td>
                    <td><code>rgba(r, g, b, a)</code></td>
                    <td>rgba(255, 87, 34, 0.8)</td>
                  </tr>
                  <tr>
                    <td><strong>HSL</strong></td>
                    <td><code>hsl(h, s%, l%)</code></td>
                    <td>hsl(14, 100%, 56%)</td>
                  </tr>
                  <tr>
                    <td><strong>HSLA</strong></td>
                    <td><code>hsla(h, s%, l%, a)</code></td>
                    <td>hsla(14, 100%, 56%, 0.8)</td>
                  </tr>
                  <tr>
                    <td><strong>颜色名</strong></td>
                    <td><code>color-name</code></td>
                    <td>red, blue, coral</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>颜色选择器工作原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────────────┐
    │                  颜色选择器界面                      │
    │                                                     │
    │   ┌─────────────────────────────────────────────┐  │
    │   │                                             │  │
    │   │           饱和度-亮度选择区域                 │  │
    │   │                                             │  │
    │   │      ← 饱和度 (S) 增加 →                    │  │
    │   │      ↑                                      │  │
    │   │      │ 亮度 (L) 增加                        │  │
    │   │      ↓                                      │  │
    │   │                                             │  │
    │   └─────────────────────────────────────────────┘  │
    │                                                     │
    │   ┌─────────────────────────────────────────────┐  │
    │   │  色相条 (H): 红─橙─黄─绿─青─蓝─紫─红         │  │
    │   └─────────────────────────────────────────────┘  │
    │                                                     │
    │   选择流程:                                         │
    │   1. 在色相条选择基础色相 (H)                       │
    │   2. 在方形区域调整饱和度 (S) 和亮度 (L)            │
    │   3. 可选: 调整透明度 (Alpha)                       │
    └─────────────────────────────────────────────────────┘
              `}</pre>
            </div>

            <div className="info-box">
              <strong>CSS 颜色新特性</strong>
              <ul>
                <li><strong>hex with alpha</strong> - #RRGGBBAA 格式支持透明度，如 #ff572280</li>
                <li><strong>color()</strong> - color(display-p3 1 0 0) 支持 P3 广色域</li>
                <li><strong>oklch()</strong> - 感知均匀的颜色空间，更适合调色</li>
                <li><strong>lab()</strong> - 基于人眼感知的颜色模型</li>
              </ul>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>设计开发协作</strong> - 快速获取设计稿颜色值并转换为开发格式</li>
              <li><strong>样式调试</strong> - 实时选取颜色并验证在界面中的效果</li>
              <li><strong>主题配置</strong> - 收集和整理项目配色方案</li>
              <li><strong>颜色格式转换</strong> - 在不同颜色表示方式间快速切换</li>
              <li><strong>CSS 变量定义</strong> - 为主题色生成标准化的 CSS 变量值</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>颜色选择器</h2>
            <div className="color-picker-demo">
              {/* 大颜色预览 */}
              <div
                style={{
                  width: '100%',
                  height: '150px',
                  borderRadius: '8px',
                  background: color,
                  marginBottom: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: hsl.l > 50 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                    color: hsl.l > 50 ? '#fff' : '#000',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                >
                  {color}
                </div>
              </div>

              {/* 颜色选择器 */}
              <div className="config-grid">
                <div className="config-item">
                  <label>选择颜色</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={handleColorChange}
                      style={{
                        width: '80px',
                        height: '60px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      style={{ flex: '1 1 150px', minWidth: '120px', fontSize: '16px', fontFamily: 'monospace', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    <button
                      onClick={addToHistory}
                      style={{ padding: '8px 16px', fontSize: '13px', background: '#4fc3f7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      收藏
                    </button>
                  </div>
                </div>
              </div>

              {/* 预设颜色 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>预设颜色</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetColors.map((preset) => (
                  <div
                    key={preset}
                    onClick={() => setColor(preset)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '4px',
                      background: preset,
                      cursor: 'pointer',
                      border: preset === '#ffffff' ? '1px solid #ccc' : 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    title={preset}
                  />
                ))}
              </div>

              {/* 颜色格式 */}
              <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>颜色格式</h3>
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
                    {colorFormats.map((format) => (
                      <tr key={format.label}>
                        <td><strong>{format.label}</strong></td>
                        <td><code>{format.value}</code></td>
                        <td>
                          <button
                            onClick={() => onCopy(format.value)}
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

              {/* 收藏历史 */}
              {history.length > 0 && (
                <>
                  <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}>
                    收藏的颜色
                    <button
                      onClick={() => setHistory([])}
                      style={{ marginLeft: '12px', padding: '2px 8px', fontSize: '12px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      清空
                    </button>
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {history.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => setColor(item.hex)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          background: item.hex,
                          cursor: 'pointer',
                          border: item.hex === '#ffffff' ? '1px solid #ccc' : 'none',
                          position: 'relative'
                        }}
                        title={`${item.hex}\n${item.rgb}\n${item.hsl}`}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            setHistory(history.filter((_, i) => i !== index))
                          }}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#ff5252',
                            color: '#fff',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          x
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>JavaScript/TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// 颜色工具类
class ColorPicker {
  private history: string[] = [];
  private maxHistory: number = 20;

  // HEX 转 RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // RGB 转 HSL
  rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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

  // 获取所有格式
  getAllFormats(hex: string) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
      hex: hex,
      rgb: \`rgb(\${rgb.r}, \${rgb.g}, \${rgb.b})\`,
      rgba: \`rgba(\${rgb.r}, \${rgb.g}, \${rgb.b}, 1)\`,
      hsl: \`hsl(\${hsl.h}, \${hsl.s}%, \${hsl.l}%)\`,
      hsla: \`hsla(\${hsl.h}, \${hsl.s}%, \${hsl.l}%, 1)\`
    };
  }

  // 添加到历史
  addToHistory(hex: string) {
    if (!this.history.includes(hex)) {
      this.history.unshift(hex);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
    }
  }

  // 获取历史
  getHistory(): string[] {
    return [...this.history];
  }
}

// React 组件示例
import { useState, useCallback } from 'react';

function ColorPickerComponent() {
  const [color, setColor] = useState('#3498db');

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  }, []);

  return (
    <div>
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
      />
      <span>{color}</span>
    </div>
  );
}`}</pre>
            </div>

            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`import colorsys
from typing import Tuple, Optional

class ColorPicker:
    def __init__(self, max_history: int = 20):
        self.history: list = []
        self.max_history = max_history

    @staticmethod
    def hex_to_rgb(hex_color: str) -> Optional[Tuple[int, int, int]]:
        """HEX 转 RGB"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) != 6:
            return None
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    @staticmethod
    def rgb_to_hex(r: int, g: int, b: int) -> str:
        """RGB 转 HEX"""
        return f'#{r:02x}{g:02x}{b:02x}'

    @staticmethod
    def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[int, int, int]:
        """RGB 转 HSL"""
        h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
        return round(h * 360), round(s * 100), round(l * 100)

    def get_all_formats(self, hex_color: str) -> dict:
        """获取所有颜色格式"""
        rgb = self.hex_to_rgb(hex_color)
        if not rgb:
            return {}

        r, g, b = rgb
        h, s, l = self.rgb_to_hsl(r, g, b)

        return {
            'hex': hex_color,
            'rgb': f'rgb({r}, {g}, {b})',
            'rgba': f'rgba({r}, {g}, {b}, 1)',
            'hsl': f'hsl({h}, {s}%, {l}%)',
            'hsla': f'hsla({h}, {s}%, {l}%, 1)'
        }

    def add_to_history(self, hex_color: str):
        """添加到历史记录"""
        if hex_color not in self.history:
            self.history.insert(0, hex_color)
            if len(self.history) > self.max_history:
                self.history.pop()

# 使用示例
picker = ColorPicker()
print(picker.get_all_formats('#3498db'))
# {'hex': '#3498db', 'rgb': 'rgb(52, 152, 219)', ...}`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "fmt"
    "image/color"
    "strconv"
)

// ColorPicker 颜色选择器
type ColorPicker struct {
    history    []string
    maxHistory int
}

// NewColorPicker 创建颜色选择器
func NewColorPicker() *ColorPicker {
    return &ColorPicker{
        history:    make([]string, 0),
        maxHistory: 20,
    }
}

// HEXToRGB HEX转RGB
func (cp *ColorPicker) HEXToRGB(hex string) (color.RGBA, error) {
    if len(hex) > 0 && hex[0] == '#' {
        hex = hex[1:]
    }
    val, err := strconv.ParseUint(hex, 16, 32)
    if err != nil {
        return color.RGBA{}, err
    }
    return color.RGBA{
        R: uint8((val >> 16) & 0xFF),
        G: uint8((val >> 8) & 0xFF),
        B: uint8(val & 0xFF),
        A: 255,
    }, nil
}

// RGBToHSL RGB转HSL
func (cp *ColorPicker) RGBToHSL(c color.RGBA) (h, s, l int) {
    r, g, b := float64(c.R)/255, float64(c.G)/255, float64(c.B)/255
    max := max(r, g, b)
    min := min(r, g, b)
    l = int((max + min) / 2 * 100)

    if max == min {
        h, s = 0, 0
        return
    }

    d := max - min
    if l > 50 {
        s = int(d / (2 - max - min) * 100)
    } else {
        s = int(d / (max + min) * 100)
    }

    switch max {
    case r:
        h = int((g-b)/d*60 + 360) % 360
    case g:
        h = int((b-r)/d*60 + 120)
    case b:
        h = int((r-g)/d*60 + 240)
    }
    return
}

// GetAllFormats 获取所有格式
func (cp *ColorPicker) GetAllFormats(hex string) map[string]string {
    rgb, err := cp.HEXToRGB(hex)
    if err != nil {
        return nil
    }
    h, s, l := cp.RGBToHSL(rgb)

    return map[string]string{
        "hex":  hex,
        "rgb":  fmt.Sprintf("rgb(%d, %d, %d)", rgb.R, rgb.G, rgb.B),
        "rgba": fmt.Sprintf("rgba(%d, %d, %d, 1)", rgb.R, rgb.G, rgb.B),
        "hsl":  fmt.Sprintf("hsl(%d, %d%%, %d%%)", h, s, l),
        "hsla": fmt.Sprintf("hsla(%d, %d%%, %d%%, 1)", h, s, l),
    }
}

// AddToHistory 添加到历史
func (cp *ColorPicker) AddToHistory(hex string) {
    for _, h := range cp.history {
        if h == hex {
            return
        }
    }
    cp.history = append([]string{hex}, cp.history...)
    if len(cp.history) > cp.maxHistory {
        cp.history = cp.history[:cp.maxHistory]
    }
}

func main() {
    picker := NewColorPicker()
    formats := picker.GetAllFormats("#3498db")
    fmt.Println(formats)
    // map[hex:#3498db rgb:rgb(52, 152, 219) ...]
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
