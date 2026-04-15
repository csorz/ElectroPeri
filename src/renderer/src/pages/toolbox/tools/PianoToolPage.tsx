import { useCallback, useEffect, useRef, useState } from 'react'
import './ToolPage.css'

interface KeyConfig {
  note: string
  key: string
  frequency: number
}

// 钢琴键位配置（C4 到 B5）
const KEYS: KeyConfig[] = [
  { note: 'C4', key: 'a', frequency: 261.63 },
  { note: 'C#4', key: 'w', frequency: 277.18 },
  { note: 'D4', key: 's', frequency: 293.66 },
  { note: 'D#4', key: 'e', frequency: 311.13 },
  { note: 'E4', key: 'd', frequency: 329.63 },
  { note: 'F4', key: 'f', frequency: 349.23 },
  { note: 'F#4', key: 't', frequency: 369.99 },
  { note: 'G4', key: 'g', frequency: 392.00 },
  { note: 'G#4', key: 'y', frequency: 415.30 },
  { note: 'A4', key: 'h', frequency: 440.00 },
  { note: 'A#4', key: 'u', frequency: 466.16 },
  { note: 'B4', key: 'j', frequency: 493.88 },
  { note: 'C5', key: 'k', frequency: 523.25 },
  { note: 'C#5', key: 'o', frequency: 554.37 },
  { note: 'D5', key: 'l', frequency: 587.33 },
  { note: 'D#5', key: 'p', frequency: 622.25 },
  { note: 'E5', key: ';', frequency: 659.25 },
  { note: 'F5', key: "'", frequency: 698.46 },
]

export default function PianoToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎹 在线钢琴</h1>
        <p>Web Audio API - 浏览器音频合成</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心特性</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Web Audio API</h3>
                <p>浏览器原生音频处理接口，支持音频生成、处理、分析，无需任何插件</p>
              </div>
              <div className="feature-card">
                <h3>振荡器发声</h3>
                <p>使用 OscillatorNode 生成正弦波、方波、三角波等基础波形，模拟乐器声音</p>
              </div>
              <div className="feature-card">
                <h3>增益控制</h3>
                <p>通过 GainNode 控制音量大小，实现淡入淡出、音量包络等效果</p>
              </div>
              <div className="feature-card">
                <h3>实时交互</h3>
                <p>支持键盘和鼠标同时操作，可弹奏和弦，响应时间低于 10ms</p>
              </div>
            </div>

            <h2>音频原理</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    用户操作（按键/点击）
           │
           ▼
    ┌──────────────────┐
    │   AudioContext   │  音频上下文管理
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   OscillatorNode │  振荡器生成波形
    │   type: sine     │  正弦波 = 纯净音色
    │   frequency: Hz  │  频率决定音高
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │    GainNode      │  增益节点控制音量
    │   gain: 0-1      │  0 = 静音, 1 = 最大
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │   destination    │  音频输出设备
    └──────────────────┘
              `}</pre>
            </div>
            <div className="info-box">
              <strong>频率与音高的关系</strong>
              <p>音高由声波频率决定。标准音 A4 = 440Hz，每升高一个八度频率翻倍，每降低一个八度频率减半。</p>
              <p>相邻半音之间的频率比约为 1.0595（2 的 1/12 次方）。</p>
            </div>

            <h2>音名与频率对照</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>音名</th>
                    <th>频率 (Hz)</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>C4</td><td>261.63</td><td>中央 C，钢琴中央音</td></tr>
                  <tr><td>A4</td><td>440.00</td><td>标准音 A，调音基准</td></tr>
                  <tr><td>C5</td><td>523.25</td><td>高音 C，比 C4 高八度</td></tr>
                  <tr><td>C#4</td><td>277.18</td><td>升 C，比 C4 高半音</td></tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>在线音乐教育</strong> - 音乐理论学习、钢琴入门教学</li>
              <li><strong>音乐创作工具</strong> - 快速试听旋律、创作灵感记录</li>
              <li><strong>游戏音效</strong> - 网页游戏背景音乐、交互音效</li>
              <li><strong>音频可视化</strong> - 结合 AnalyserNode 实现频谱动画</li>
              <li><strong>辅助功能</strong> - 为视障用户提供音频反馈</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>在线钢琴</h2>
            <PianoDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// Web Audio API 钢琴实现
import { useRef, useCallback, useState } from 'react'

interface Note {
  note: string
  frequency: number
}

export function usePiano() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillators = useRef<Map<string, OscillatorNode>>(new Map())

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playNote = useCallback((note: Note, volume: number = 0.5) => {
    const ctx = getContext()
    if (ctx.state === 'suspended') ctx.resume()

    // 防止重复播放
    if (oscillators.current.has(note.note)) return

    // 创建振荡器
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine' // 正弦波
    osc.frequency.setValueAtTime(note.frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()

    oscillators.current.set(note.note, osc)
  }, [getContext])

  const stopNote = useCallback((note: string) => {
    const osc = oscillators.current.get(note)
    if (osc) {
      osc.stop()
      oscillators.current.delete(note)
    }
  }, [])

  return { playNote, stopNote }
}`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 原生 JavaScript 实现
class SimplePiano {
  constructor() {
    this.audioContext = null
    this.oscillators = new Map()
  }

  init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  play(frequency, noteId) {
    if (!this.audioContext) this.init()
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.value = 0.5

    osc.connect(gain)
    gain.connect(this.audioContext.destination)
    osc.start()

    this.oscillators.set(noteId, osc)
  }

  stop(noteId) {
    const osc = this.oscillators.get(noteId)
    if (osc) {
      osc.stop()
      this.oscillators.delete(noteId)
    }
  }
}

// 使用示例
const piano = new SimplePiano()

// C4 = 261.63Hz
piano.play(261.63, 'C4')

// 停止
piano.stop('C4')`}</pre>
            </div>

            <h2>Python 示例（pygame）</h2>
            <div className="code-block">
              <pre>{`# 使用 pygame 播放音符
import pygame
import numpy as np

def generate_tone(frequency, duration=0.5, sample_rate=44100):
    """生成指定频率的音调"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    tone = np.sin(2 * np.pi * frequency * t)
    # 淡入淡出效果
    fade = np.linspace(0, 1, int(sample_rate * 0.01))
    tone[:len(fade)] *= fade
    tone[-len(fade):] *= fade[::-1]
    return (tone * 32767).astype(np.int16)

class Piano:
    NOTES = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
        'F4': 349.23, 'G4': 392.00, 'A4': 440.00,
        'B4': 493.88, 'C5': 523.25
    }

    def __init__(self):
        pygame.mixer.init(frequency=44100, size=-16, channels=1)
        self.sounds = {}

    def play(self, note):
        if note not in self.sounds:
            freq = self.NOTES.get(note)
            if freq:
                tone = generate_tone(freq)
                self.sounds[note] = pygame.sndarray.make_sound(tone)

        if note in self.sounds:
            self.sounds[note].play()

# 使用
piano = Piano()
piano.play('C4')  # 播放中央C`}</pre>
            </div>

            <h2>Go 示例（beep 库）</h2>
            <div className="code-block">
              <pre>{`// Go 音频播放示例
package main

import (
    "fmt"
    "math"
    "time"

    "github.com/faiface/beep"
    "github.com/faiface/beep/speaker"
)

// 生成正弦波
type sineWave struct {
    freq     float64
    duration time.Duration
    pos     int
}

func (s *sineWave) Stream(samples [][2]float64) (int, bool) {
    sampleRate := 44100.0
    for i := range samples {
        t := float64(s.pos) / sampleRate
        val := math.Sin(2 * math.Pi * s.freq * t)
        samples[i][0] = val * 0.5 // 左声道
        samples[i][1] = val * 0.5 // 右声道
        s.pos++
    }
    return len(samples), true
}

func (s *sineWave) Err() error {
    return nil
}

func playNote(freq float64, duration time.Duration) {
    sr := beep.SampleRate(44100)
    speaker.Init(sr, sr.N(duration/10))

    wave := &sineWave{freq: freq, duration: duration}
    speaker.Play(wave)
    time.Sleep(duration)
}

func main() {
    // 音符频率
    notes := map[string]float64{
        "C4": 261.63, "D4": 293.66, "E4": 329.63,
        "F4": 349.23, "G4": 392.00, "A4": 440.00,
    }

    fmt.Println("Playing C4...")
    playNote(notes["C4"], 500*time.Millisecond)
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 钢琴演示组件
function PianoDemo() {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [volume, setVolume] = useState(0.5)
  const audioContextRef = useRef<AudioContext | null>(null)
  const activeOscillators = useRef<Map<string, OscillatorNode>>(new Map())

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playNote = useCallback((key: KeyConfig) => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    if (activeOscillators.current.has(key.note)) {
      return
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(key.frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start()
    activeOscillators.current.set(key.note, oscillator)
    setActiveKeys(prev => new Set(prev).add(key.note))
  }, [getAudioContext, volume])

  const stopNote = useCallback((note: string) => {
    const oscillator = activeOscillators.current.get(note)
    if (oscillator) {
      oscillator.stop()
      activeOscillators.current.delete(note)
    }
    setActiveKeys(prev => {
      const newSet = new Set(prev)
      newSet.delete(note)
      return newSet
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const keyConfig = KEYS.find(k => k.key === e.key.toLowerCase())
      if (keyConfig) {
        playNote(keyConfig)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyConfig = KEYS.find(k => k.key === e.key.toLowerCase())
      if (keyConfig) {
        stopNote(keyConfig.note)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [playNote, stopNote])

  const whiteKeys = KEYS.filter(k => !k.note.includes('#'))
  const blackKeys = KEYS.filter(k => k.note.includes('#'))

  return (
    <div className="piano-demo">
      <div className="piano-controls">
        <label>音量: </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>

      <div className="piano-keyboard">
        <div className="white-keys">
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              className={`white-key ${activeKeys.has(key.note) ? 'active' : ''}`}
              onMouseDown={() => playNote(key)}
              onMouseUp={() => stopNote(key.note)}
              onMouseLeave={() => stopNote(key.note)}
            >
              <span className="note-name">{key.note}</span>
              <span className="key-binding">{key.key.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="black-keys">
          {blackKeys.map((key, index) => {
            const blackKeyPositions: Record<number, number> = {
              0: 35, 1: 87, 2: 191, 3: 243, 4: 295, 5: 399, 6: 451
            }
            return (
              <button
                key={key.note}
                className={`black-key ${activeKeys.has(key.note) ? 'active' : ''}`}
                style={{ left: `${blackKeyPositions[index] || 0}px` }}
                onMouseDown={() => playNote(key)}
                onMouseUp={() => stopNote(key.note)}
                onMouseLeave={() => stopNote(key.note)}
              >
                <span className="note-name">{key.note}</span>
                <span className="key-binding">{key.key.toUpperCase()}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="key-shortcuts">
        <h4>键盘快捷键</h4>
        <div className="key-list">
          {KEYS.map((key) => (
            <span
              key={key.note}
              className={`key-hint ${key.note.includes('#') ? 'black' : 'white'}`}
            >
              {key.key.toUpperCase()}: {key.note}
            </span>
          ))}
        </div>
      </div>

      <div className="usage-tips">
        <h4>使用说明</h4>
        <ul>
          <li>点击钢琴键或按键盘对应的按键发声</li>
          <li>白键对应自然音，黑键对应升/降音</li>
          <li>可以同时按多个键弹奏和弦</li>
          <li>调节音量滑块控制声音大小</li>
        </ul>
      </div>
    </div>
  )
}
