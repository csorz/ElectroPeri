import { useCallback, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../toolbox.css'

export default function VoiceSynthesisToolPage() {
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
        // 默认选择中文语音
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
    <div className="toolbox-page">
      <Link to="/frontend-toolbox/fun" className="toolbox-back">
        ← 返回娱乐工具
      </Link>
      <div className="page-header">
        <div className="page-header-title">
          <span className="page-icon">🎤</span>
          <h1>语音合成</h1>
        </div>
        <p className="page-sub">将文字转换为语音播放</p>
      </div>

      <section className="tool-card">
        <div className="tool-block" style={{ borderTop: 'none', paddingTop: 0 }}>
          <div className="tool-block-title">输入文本</div>
          <textarea
            className="tool-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要朗读的文字..."
            rows={6}
          />
        </div>

        <div className="tool-block">
          <div className="tool-block-title">快捷文本</div>
          <div className="tool-actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
            {presetTexts.map((preset, index) => (
              <button
                key={index}
                type="button"
                className="btn btn-secondary"
                onClick={() => setText(preset)}
                style={{ fontSize: '12px' }}
              >
                {preset.length > 15 ? preset.substring(0, 15) + '...' : preset}
              </button>
            ))}
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">语音设置</div>
          <div className="tool-row" style={{ marginBottom: '12px' }}>
            <label className="tool-label" style={{ flex: 1 }}>
              语音
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{ marginLeft: '8px' }}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="tool-row" style={{ marginBottom: '12px' }}>
            <label className="tool-label" style={{ flex: 1 }}>
              语速: {rate.toFixed(1)}x
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                style={{ marginLeft: '8px', flex: 1 }}
              />
            </label>
          </div>
          <div className="tool-row" style={{ marginBottom: '12px' }}>
            <label className="tool-label" style={{ flex: 1 }}>
              音调: {pitch.toFixed(1)}
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                style={{ marginLeft: '8px', flex: 1 }}
              />
            </label>
          </div>
          <div className="tool-row">
            <label className="tool-label" style={{ flex: 1 }}>
              音量: {Math.round(volume * 100)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ marginLeft: '8px', flex: 1 }}
              />
            </label>
          </div>
        </div>

        <div className="tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSpeak}
            disabled={speaking || !text.trim()}
          >
            {speaking ? '播放中...' : '播放'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handlePause}>
            暂停
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleResume}>
            继续
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleStop}>
            停止
          </button>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">使用说明</div>
          <div className="tool-result">
            <p>本工具使用浏览器内置的 Web Speech API 进行语音合成。</p>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>不同浏览器支持的语音可能不同</li>
              <li>Chrome 浏览器支持最多种语音</li>
              <li>部分语音需要联网才能使用</li>
              <li>语速建议在 0.8-1.2 之间效果最佳</li>
            </ul>
          </div>
        </div>

        <div className="tool-block">
          <div className="tool-block-title">功能特点</div>
          <div className="tool-result">
            <ul style={{ paddingLeft: '20px' }}>
              <li>支持多语言语音合成</li>
              <li>可调节语速、音调、音量</li>
              <li>支持暂停和继续播放</li>
              <li>无需安装额外软件</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
