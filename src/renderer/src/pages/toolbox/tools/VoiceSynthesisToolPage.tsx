import { useCallback, useState, useRef, useEffect } from 'react'
import './ToolPage.css'

export default function VoiceSynthesisToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🎤 语音合成</h1>
        <p>Web Speech API - 文字转语音</p>
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
                <h3>多语言支持</h3>
                <p>支持数十种语言和方言，包括中文、英语、日语、韩语等主流语言</p>
              </div>
              <div className="feature-card">
                <h3>参数可调</h3>
                <p>可调节语速、音调、音量，实现个性化的语音效果</p>
              </div>
              <div className="feature-card">
                <h3>浏览器原生</h3>
                <p>无需安装插件或依赖外部服务，直接使用浏览器内置能力</p>
              </div>
              <div className="feature-card">
                <h3>实时控制</h3>
                <p>支持暂停、继续、停止等播放控制，响应速度快</p>
              </div>
            </div>

            <h2>API 架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    ┌─────────────────────────────────────────────┐
    │           Web Speech API 架构               │
    └─────────────────────────────────────────────┘

    输入文本
        │
        ▼
    ┌───────────────────┐
    │ SpeechSynthesis   │  语音合成控制器
    │  .speak()         │  开始播放
    │  .pause()         │  暂停播放
    │  .resume()        │  继续播放
    │  .cancel()        │  停止播放
    └────────┬──────────┘
             │ 创建
             ▼
    ┌───────────────────────────┐
    │ SpeechSynthesisUtterance  │  语音配置对象
    │  .text      - 要朗读的文本 │
    │  .voice     - 语音类型     │
    │  .rate      - 语速 0.1-10  │
    │  .pitch     - 音调 0-2     │
    │  .volume    - 音量 0-1     │
    └───────────────────────────┘
             │
             ▼
    ┌───────────────────┐
    │ SpeechSynthesisVoice │  可用语音列表
    │  .name  - 语音名称    │
    │  .lang  - 语言代码    │
    │  .local - 是否本地    │
    └───────────────────┘
              `}</pre>
            </div>
            <div className="info-box">
              <strong>浏览器兼容性</strong>
              <p>Web Speech API 在现代浏览器中有良好支持：</p>
              <ul>
                <li><strong>Chrome</strong> - 支持最完善，语音种类最多</li>
                <li><strong>Edge</strong> - 基于 Chromium，兼容性好</li>
                <li><strong>Firefox</strong> - 支持基本功能</li>
                <li><strong>Safari</strong> - 支持有限，建议使用 Chrome</li>
              </ul>
            </div>

            <h2>参数说明</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>参数</th>
                    <th>范围</th>
                    <th>默认值</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>rate</td><td>0.1 - 10</td><td>1</td><td>语速，1 为正常速度</td></tr>
                  <tr><td>pitch</td><td>0 - 2</td><td>1</td><td>音调，1 为正常音调</td></tr>
                  <tr><td>volume</td><td>0 - 1</td><td>1</td><td>音量，1 为最大音量</td></tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>无障碍辅助</strong> - 为视障用户提供文字朗读功能</li>
              <li><strong>语言学习</strong> - 发音练习、听力训练、口语模仿</li>
              <li><strong>内容播报</strong> - 新闻朗读、电子书阅读、通知播报</li>
              <li><strong>语音交互</strong> - 智能客服、语音助手、游戏配音</li>
              <li><strong>多语言应用</strong> - 翻译结果朗读、外语学习</li>
            </ul>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>语音合成工具</h2>
            <VoiceSynthesisDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>TypeScript 示例</h2>
            <div className="code-block">
              <pre>{`// Web Speech API 语音合成封装
import { useRef, useState, useCallback, useEffect } from 'react'

interface VoiceOptions {
  rate: number    // 语速 0.1-10
  pitch: number   // 音调 0-2
  volume: number  // 音量 0-1
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speaking, setSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis

    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || []
      setVoices(availableVoices)
    }

    loadVoices()
    synthRef.current.addEventListener('voiceschanged', loadVoices)

    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const speak = useCallback((
    text: string,
    voiceName: string,
    options: VoiceOptions
  ) => {
    if (!synthRef.current || !text.trim()) return

    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find(v => v.name === voiceName)
    if (voice) utterance.voice = voice

    utterance.rate = options.rate
    utterance.pitch = options.pitch
    utterance.volume = options.volume

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    synthRef.current.speak(utterance)
  }, [voices])

  const stop = useCallback(() => {
    synthRef.current?.cancel()
    setSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    synthRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    synthRef.current?.resume()
  }, [])

  return { voices, speaking, speak, stop, pause, resume }
}`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 原生 JavaScript 实现
class TextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis
    this.voices = []
    this.currentUtterance = null
    this.loadVoices()
  }

  loadVoices() {
    const setVoices = () => {
      this.voices = this.synth.getVoices()
    }

    // 某些浏览器需要等待 voiceschanged 事件
    if (this.synth.getVoices().length > 0) {
      setVoices()
    } else {
      this.synth.addEventListener('voiceschanged', setVoices)
    }
  }

  speak(text, options = {}) {
    // 取消当前播放
    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // 设置语音
    if (options.voiceName) {
      const voice = this.voices.find(v => v.name === options.voiceName)
      if (voice) utterance.voice = voice
    }

    // 设置参数
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1

    // 事件监听
    utterance.onstart = () => console.log('开始播放')
    utterance.onend = () => console.log('播放结束')
    utterance.onerror = (e) => console.error('播放错误:', e)

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  pause() { this.synth.pause() }
  resume() { this.synth.resume() }
  stop() { this.synth.cancel() }

  // 获取中文语音
  getChineseVoices() {
    return this.voices.filter(v => v.lang.includes('zh'))
  }
}

// 使用示例
const tts = new TextToSpeech()

// 播放文本
tts.speak('你好，欢迎使用语音合成工具', {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
})`}</pre>
            </div>

            <h2>Python 示例（pyttsx3）</h2>
            <div className="code-block">
              <pre>{`# Python 语音合成
import pyttsx3

class TextToSpeech:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.setup()

    def setup(self):
        # 获取可用语音
        voices = self.engine.getProperty('voices')

        # 设置中文语音（如果有）
        for voice in voices:
            if 'chinese' in voice.name.lower():
                self.engine.setProperty('voice', voice.id)
                break

        # 设置语速（默认200）
        self.engine.setProperty('rate', 150)

        # 设置音量（0-1）
        self.engine.setProperty('volume', 1.0)

    def speak(self, text, wait=True):
        """播放语音"""
        self.engine.say(text)
        if wait:
            self.engine.runAndWait()

    def save_to_file(self, text, filename):
        """保存为音频文件"""
        self.engine.save_to_file(text, filename)
        self.engine.runAndWait()

    def get_voices(self):
        """获取可用语音列表"""
        voices = self.engine.getProperty('voices')
        return [{'name': v.name, 'id': v.id} for v in voices]

# 使用示例
tts = TextToSpeech()

# 播放语音
tts.speak('你好，欢迎使用语音合成工具')

# 保存为文件
tts.save_to_file('这是测试文本', 'output.mp3')

# 查看可用语音
for voice in tts.get_voices():
    print(voice)`}</pre>
            </div>

            <h2>Go 示例</h2>
            <div className="code-block">
              <pre>{`// Go 语音合成（需要调用系统 TTS）
package main

import (
    "fmt"
    "os/exec"
    "runtime"
)

// macOS 使用 say 命令
func speakMacOS(text string) error {
    cmd := exec.Command("say", text)
    return cmd.Run()
}

// Windows 使用 PowerShell
func speakWindows(text string) error {
    ps := fmt.Sprintf(
        "Add-Type -AssemblyName System.Speech; " +
        "$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer; " +
        "$speak.Speak('%s')", text)
    cmd := exec.Command("powershell", "-Command", ps)
    return cmd.Run()
}

// Linux 使用 espeak
func speakLinux(text string) error {
    cmd := exec.Command("espeak", text)
    return cmd.Run()
}

// 跨平台语音合成
func Speak(text string) error {
    switch runtime.GOOS {
    case "darwin":
        return speakMacOS(text)
    case "windows":
        return speakWindows(text)
    case "linux":
        return speakLinux(text)
    default:
        return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
    }
}

func main() {
    err := Speak("Hello, this is a test")
    if err != nil {
        fmt.Println("Error:", err)
    }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 语音合成演示组件
function VoiceSynthesisDemo() {
  const [text, setText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    synthRef.current = window.speechSynthesis

    const loadVoices = () => {
      const availableVoices = synthRef.current?.getVoices() || []
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        const chineseVoice = availableVoices.find(v => v.lang.includes('zh'))
        if (chineseVoice) {
          setSelectedVoice(chineseVoice.name)
        } else {
          setSelectedVoice(availableVoices[0].name)
        }
      }
    }

    loadVoices()
    synthRef.current?.addEventListener('voiceschanged', loadVoices)

    return () => {
      synthRef.current?.removeEventListener('voiceschanged', loadVoices)
      synthRef.current?.cancel()
    }
  }, [selectedVoice])

  const handleSpeak = useCallback(() => {
    if (!text.trim() || !synthRef.current) return

    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    synthRef.current.speak(utterance)
  }, [text, selectedVoice, voices, rate, pitch, volume])

  const handleStop = useCallback(() => {
    synthRef.current?.cancel()
    setSpeaking(false)
  }, [])

  const handlePause = useCallback(() => {
    synthRef.current?.pause()
  }, [])

  const handleResume = useCallback(() => {
    synthRef.current?.resume()
  }, [])

  const presetTexts = [
    '你好，欢迎使用语音合成工具！',
    'The quick brown fox jumps over the lazy dog.',
    '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    '人工智能正在改变我们的生活方式。'
  ]

  return (
    <div className="voice-demo">
      <div className="voice-input">
        <label>输入文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要朗读的文字..."
          rows={4}
        />
      </div>

      <div className="preset-buttons">
        <label>快捷文本</label>
        <div className="button-group">
          {presetTexts.map((preset, index) => (
            <button
              key={index}
              className="preset-btn"
              onClick={() => setText(preset)}
            >
              {preset.length > 15 ? preset.substring(0, 15) + '...' : preset}
            </button>
          ))}
        </div>
      </div>

      <div className="voice-settings">
        <h4>语音设置</h4>

        <div className="setting-row">
          <label>语音</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        <div className="setting-row">
          <label>语速: {rate.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-row">
          <label>音调: {pitch.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-row">
          <label>音量: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="demo-controls">
        <button
          className="play-btn"
          onClick={handleSpeak}
          disabled={speaking || !text.trim()}
        >
          {speaking ? '播放中...' : '播放'}
        </button>
        <button className="control-btn" onClick={handlePause}>暂停</button>
        <button className="control-btn" onClick={handleResume}>继续</button>
        <button className="control-btn" onClick={handleStop}>停止</button>
      </div>

      <div className="usage-tips">
        <h4>使用说明</h4>
        <ul>
          <li>不同浏览器支持的语音可能不同</li>
          <li>Chrome 浏览器支持最多种语音</li>
          <li>部分语音需要联网才能使用</li>
          <li>语速建议在 0.8-1.2 之间效果最佳</li>
        </ul>
      </div>
    </div>
  )
}
