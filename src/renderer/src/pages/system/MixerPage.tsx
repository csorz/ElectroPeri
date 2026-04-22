import { useState, useRef, useEffect, useCallback } from 'react'
import '../toolbox/tools/ToolPage.css'
import './MixerPage.css'
import { ElectronOnly } from '../../components/ElectronOnly'

export default function MixerPage() {
  return (
    <ElectronOnly>
      <MixerPageContent />
    </ElectronOnly>
  )
}

function MixerPageContent() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('demo')

  // --- 流源状态 ---
  const [localVideoPath, setLocalVideoPath] = useState<string | null>(null)
  const [localVideoName, setLocalVideoName] = useState<string | null>(null)
  const [localVideoLoop, setLocalVideoLoop] = useState(false)
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false)

  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [, setMicDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>('')
  const [selectedMicId, setSelectedMicId] = useState<string>('')
  const [cameraActive, setCameraActive] = useState(false)

  const [screenSources, setScreenSources] = useState<any[]>([])
  const [showSourceSelector, setShowSourceSelector] = useState(false)
  const [selectedScreenSource, setSelectedScreenSource] = useState<{ id: string; name: string } | null>(null)

  // --- 流引用 ---
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoStreamRef = useRef<MediaStream | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // --- 混流状态 ---
  const mixerCanvasRef = useRef<HTMLCanvasElement>(null)
  const [mainStreamKey, setMainStreamKey] = useState<'camera' | 'screen' | 'video'>('camera')
  const animFrameRef = useRef<number>(0)
  const [mixerActive, setMixerActive] = useState(false)

  // --- 录制状态 ---
  const [mixerRecording, setMixerRecording] = useState(false)
  const [cameraRecording, setCameraRecording] = useState(false)
  const [screenRecording, setScreenRecording] = useState(false)
  const [mixerRecTime, setMixerRecTime] = useState(0)
  const [cameraRecTime, setCameraRecTime] = useState(0)
  const [screenRecTime, setScreenRecTime] = useState(0)
  const [recordings, setRecordings] = useState<{ name: string; blob: Blob; size: number }[]>([])

  const mixerRecorderRef = useRef<MediaRecorder | null>(null)
  const cameraRecorderRef = useRef<MediaRecorder | null>(null)
  const screenRecorderRef = useRef<MediaRecorder | null>(null)
  const mixerChunksRef = useRef<Blob[]>([])
  const cameraChunksRef = useRef<Blob[]>([])
  const screenChunksRef = useRef<Blob[]>([])
  const mixerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cameraTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const screenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // ========== 流源操作 ==========

  // --- 本地视频 ---
  const handleSelectVideo = async () => {
    const result = await window.api.mixer.selectVideo()
    if (!result.canceled && result.path) {
      setLocalVideoPath(result.path)
      setLocalVideoName(result.path.split('/').pop() || result.path)
    }
  }

  const handleToggleVideoPlay = () => {
    const video = localVideoRef.current
    if (!video) return
    if (localVideoPlaying) {
      video.pause()
      setLocalVideoPlaying(false)
    } else {
      video.play()
      setLocalVideoPlaying(true)
    }
  }

  // --- 摄像头 ---
  const handleOpenCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cams = devices.filter((d) => d.kind === 'videoinput')
      const mics = devices.filter((d) => d.kind === 'audioinput')
      setCameraDevices(cams)
      setMicDevices(mics)

      const camId = selectedCameraId || cams[0]?.deviceId
      const micId = selectedMicId || mics[0]?.deviceId
      if (!camId) return

      // 只请求 video，避免 audio 设备抢占导致帧解码暂停
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: camId } }
      })
      // 麦克风音频单独获取
      let audioStream: MediaStream | null = null
      if (micId) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: micId } }
          })
        } catch {
          // 麦克风不可用，忽略
        }
      }
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...(audioStream?.getAudioTracks() || [])
      ])
      cameraStreamRef.current = combinedStream
      setSelectedCameraId(camId)
      setSelectedMicId(micId || '')
      setCameraActive(true)
    } catch (err: any) {
      console.error('Camera error:', err)
    }
  }

  const handleCloseCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
    cameraStreamRef.current = null
    setCameraActive(false)
  }

  // --- 屏幕共享 ---
  const handleSelectScreen = async () => {
    const sources = await window.api.mixer.getSources()
    setScreenSources(sources)
    setShowSourceSelector(true)
  }

  const handleConfirmScreenSource = async (sourceId: string, sourceName: string) => {
    setShowSourceSelector(false)
    try {
      // 只请求 video，chromeMediaSource desktop 的 audio 必须和 video 在同一调用中
      // 但同时请求 audio 会导致摄像头流暂停，所以这里只获取 video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxWidth: 1920,
            maxHeight: 1080
          }
        } as any
      })
      screenStreamRef.current = stream
      setSelectedScreenSource({ id: sourceId, name: sourceName })
    } catch (err: any) {
      console.error('Screen capture error:', err)
    }
  }

  const handleCloseScreen = () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current = null
    setSelectedScreenSource(null)
  }

  // --- 流绑定到可见 video 元素 ---
  useEffect(() => {
    const video = cameraVideoRef.current
    const stream = cameraStreamRef.current
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream
    }
  }, [cameraActive, selectedScreenSource, localVideoPlaying])

  useEffect(() => {
    const video = screenVideoRef.current
    const stream = screenStreamRef.current
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream
    }
  }, [selectedScreenSource, cameraActive, localVideoPlaying])

  // ========== 混流渲染 ==========

  const CANVAS_W = 1920
  const CANVAS_H = 1080
  const SMALL_W = 480
  const SMALL_H = 270
  const SMALL_MARGIN = 20

  const getAvailableStreams = useCallback(() => {
    const streams: { key: 'camera' | 'screen' | 'video'; label: string }[] = []
    if (cameraStreamRef.current) streams.push({ key: 'camera', label: '摄像头' })
    if (screenStreamRef.current) streams.push({ key: 'screen', label: '屏幕共享' })
    if (localVideoRef.current && localVideoPlaying) streams.push({ key: 'video', label: '本地视频' })
    return streams
  }, [localVideoPlaying])

  const drawMixerFrame = useCallback(() => {
    const canvas = mixerCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const streams = getAvailableStreams()
    if (streams.length === 0) {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
      ctx.fillStyle = '#666'
      ctx.font = '24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('请开启至少一个流源', CANVAS_W / 2, CANVAS_H / 2)
      animFrameRef.current = requestAnimationFrame(drawMixerFrame)
      return
    }

    const mainKey = streams.find((s) => s.key === mainStreamKey) ? mainStreamKey : streams[0].key
    const subStreams = streams.filter((s) => s.key !== mainKey)

    const getVideo = (key: string): HTMLVideoElement | null => {
      if (key === 'camera') return cameraVideoRef.current
      if (key === 'screen') return screenVideoRef.current
      if (key === 'video') return localVideoRef.current
      return null
    }

    // 大窗口
    const mainVideo = getVideo(mainKey)
    if (mainVideo && mainVideo.readyState >= 2) {
      ctx.drawImage(mainVideo, 0, 0, CANVAS_W, CANVAS_H)
    } else {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    }

    // 小窗口
    subStreams.forEach((sub, i) => {
      const subVideo = getVideo(sub.key)
      if (!subVideo || subVideo.readyState < 2) return

      const sx = CANVAS_W - SMALL_W - SMALL_MARGIN
      const sy = CANVAS_H - SMALL_H - SMALL_MARGIN - i * (SMALL_H + 10)

      ctx.save()
      ctx.beginPath()
      const r = 8
      ctx.moveTo(sx + r, sy)
      ctx.lineTo(sx + SMALL_W - r, sy)
      ctx.quadraticCurveTo(sx + SMALL_W, sy, sx + SMALL_W, sy + r)
      ctx.lineTo(sx + SMALL_W, sy + SMALL_H - r)
      ctx.quadraticCurveTo(sx + SMALL_W, sy + SMALL_H, sx + SMALL_W - r, sy + SMALL_H)
      ctx.lineTo(sx + r, sy + SMALL_H)
      ctx.quadraticCurveTo(sx, sy + SMALL_H, sx, sy + SMALL_H - r)
      ctx.lineTo(sx, sy + r)
      ctx.quadraticCurveTo(sx, sy, sx + r, sy)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(subVideo, sx, sy, SMALL_W, SMALL_H)
      ctx.restore()

      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.strokeRect(sx, sy, SMALL_W, SMALL_H)
    })

    animFrameRef.current = requestAnimationFrame(drawMixerFrame)
  }, [mainStreamKey, getAvailableStreams])

  useEffect(() => {
    const hasAnyStream = cameraActive || !!selectedScreenSource || localVideoPlaying
    if (hasAnyStream && !mixerActive) {
      setMixerActive(true)
    }
  }, [cameraActive, selectedScreenSource, localVideoPlaying, mixerActive])

  useEffect(() => {
    if (mixerActive) {
      animFrameRef.current = requestAnimationFrame(drawMixerFrame)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [mixerActive, drawMixerFrame])

  const handleSwitchMain = () => {
    const streams = getAvailableStreams()
    if (streams.length <= 1) return
    const currentIdx = streams.findIndex((s) => s.key === mainStreamKey)
    const nextIdx = (currentIdx + 1) % streams.length
    setMainStreamKey(streams[nextIdx].key)
  }

  // ========== 录制 ==========

  const startTimer = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(0)
    return setInterval(() => setter((t) => t + 1), 1000)
  }

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const mergeAudioTracks = (tracks: MediaStreamTrack[]): MediaStream => {
    if (tracks.length === 0) return new MediaStream()
    if (tracks.length === 1) return new MediaStream([tracks[0]])
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    const dest = ctx.createMediaStreamDestination()
    tracks.forEach((track) => {
      const source = ctx.createMediaStreamSource(new MediaStream([track]))
      source.connect(dest)
    })
    return dest.stream
  }

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
    return ''
  }

  // --- 混流录制 ---
  const handleStartMixerRec = () => {
    const canvas = mixerCanvasRef.current
    if (!canvas) return

    const canvasStream = canvas.captureStream(30)
    const audioTracks: MediaStreamTrack[] = []
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((t) => audioTracks.push(t))
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getAudioTracks().forEach((t) => audioTracks.push(t))
    }
    if (localVideoStreamRef.current) {
      localVideoStreamRef.current.getAudioTracks().forEach((t) => audioTracks.push(t))
    }

    const mergedAudio = mergeAudioTracks(audioTracks)
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...mergedAudio.getAudioTracks()
    ])

    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined)
    mixerChunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) mixerChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(mixerChunksRef.current, { type: 'video/webm' })
      setRecordings((prev) => [...prev, { name: `混流录制_${Date.now()}.webm`, blob, size: blob.size }])
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null }
    }
    recorder.start(1000)
    mixerRecorderRef.current = recorder
    setMixerRecording(true)
    mixerTimerRef.current = startTimer(setMixerRecTime)
  }

  const handleStopMixerRec = () => {
    mixerRecorderRef.current?.stop()
    mixerRecorderRef.current = null
    setMixerRecording(false)
    if (mixerTimerRef.current) { clearInterval(mixerTimerRef.current); mixerTimerRef.current = null }
  }

  // --- 摄像头+麦克风录制 ---
  const handleStartCameraRec = () => {
    if (!cameraStreamRef.current) return
    const stream = cameraStreamRef.current
    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    cameraChunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) cameraChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(cameraChunksRef.current, { type: 'video/webm' })
      setRecordings((prev) => [...prev, { name: `摄像头录制_${Date.now()}.webm`, blob, size: blob.size }])
    }
    recorder.start(1000)
    cameraRecorderRef.current = recorder
    setCameraRecording(true)
    cameraTimerRef.current = startTimer(setCameraRecTime)
  }

  const handleStopCameraRec = () => {
    cameraRecorderRef.current?.stop()
    cameraRecorderRef.current = null
    setCameraRecording(false)
    if (cameraTimerRef.current) { clearInterval(cameraTimerRef.current); cameraTimerRef.current = null }
  }

  // --- 屏幕共享+麦克风录制 ---
  const handleStartScreenRec = () => {
    if (!screenStreamRef.current) return
    const screenVTracks = screenStreamRef.current.getVideoTracks()
    const screenATracks = screenStreamRef.current.getAudioTracks()
    const micTracks: MediaStreamTrack[] = []
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getAudioTracks().forEach((t) => micTracks.push(t))
    }
    const allAudio = [...screenATracks, ...micTracks]
    const mergedAudio = mergeAudioTracks(allAudio)
    const combinedStream = new MediaStream([...screenVTracks, ...mergedAudio.getAudioTracks()])

    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined)
    screenChunksRef.current = []
    recorder.ondataavailable = (e) => { if (e.data.size > 0) screenChunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const blob = new Blob(screenChunksRef.current, { type: 'video/webm' })
      setRecordings((prev) => [...prev, { name: `屏幕录制_${Date.now()}.webm`, blob, size: blob.size }])
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null }
    }
    recorder.start(1000)
    screenRecorderRef.current = recorder
    setScreenRecording(true)
    screenTimerRef.current = startTimer(setScreenRecTime)
  }

  const handleStopScreenRec = () => {
    screenRecorderRef.current?.stop()
    screenRecorderRef.current = null
    setScreenRecording(false)
    if (screenTimerRef.current) { clearInterval(screenTimerRef.current); screenTimerRef.current = null }
  }

  // --- 下载录制 ---
  const handleDownload = async (rec: { name: string; blob: Blob }) => {
    const result = await window.api.mixer.saveRecording({ defaultName: rec.name })
    if (result.success && result.path) {
      const buffer = await rec.blob.arrayBuffer()
      const data = Array.from(new Uint8Array(buffer))
      await window.api.mixer.writeFile({ path: result.path, data })
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      handleCloseCamera()
      handleCloseScreen()
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>混流助手</h1>
        <p>Stream Mixer - 多流源混流、画中画布局与录制</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心能力</h2>
            <div className="feature-grid">
              <div className="feature-card"><h3>多流源混流</h3><p>本地视频、摄像头、屏幕共享三种流源自由组合</p></div>
              <div className="feature-card"><h3>画中画布局</h3><p>大窗口+小窗口布局，一键切换主画面</p></div>
              <div className="feature-card"><h3>实时预览</h3><p>Canvas 实时渲染混流画面，所见即所得</p></div>
              <div className="feature-card"><h3>独立录制</h3><p>混流录制、摄像头录制、屏幕录制三种模式独立控制</p></div>
            </div>
            <h2>技术架构</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
  本地视频          摄像头           屏幕共享
  <video>        getUserMedia     getUserMedia
     │                │                │
     ▼                ▼                ▼
  captureStream   MediaStream    MediaStream
     │                │                │
     └────────────────┼────────────────┘
                      ▼
               Canvas 混流 (画中画)
                      │
                ┌─────┴─────┐
                ▼            ▼
           实时预览    captureStream()
                           │
                           ▼
                     MediaRecorder
                           │
                           ▼
                       WebM 文件
              `}</pre>
            </div>
            <h2>应用场景</h2>
            <div className="scenario-grid">
              <div className="scenario-card"><h4>在线教学</h4><p>摄像头+屏幕共享混流，录制教学视频</p></div>
              <div className="scenario-card"><h4>游戏直播</h4><p>屏幕共享+摄像头画中画，录制直播回放</p></div>
              <div className="scenario-card"><h4>视频会议</h4><p>多流源合成，录制会议内容</p></div>
              <div className="scenario-card"><h4>产品演示</h4><p>本地视频+摄像头混流，录制产品介绍</p></div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>流源面板</h2>
            <div className="connection-demo">
              <div className="source-panel">
                {/* 本地视频 */}
                <div className="source-row">
                  <span className="source-label">本地视频</span>
                  {localVideoPath ? (
                    <>
                      <span className="source-status active">{localVideoName}</span>
                      <div className="source-controls">
                        <button onClick={handleToggleVideoPlay}>
                          {localVideoPlaying ? '⏸ 暂停' : '▶ 播放'}
                        </button>
                        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input type="checkbox" checked={localVideoLoop} onChange={(e) => {
                            setLocalVideoLoop(e.target.checked)
                            if (localVideoRef.current) localVideoRef.current.loop = e.target.checked
                          }} />
                          循环
                        </label>
                      </div>
                    </>
                  ) : (
                    <span className="source-status">未选择</span>
                  )}
                  <div className="source-controls">
                    <button onClick={handleSelectVideo}>选择文件</button>
                  </div>
                </div>
                {/* 本地视频预览 */}
                <div style={{ marginTop: 4, marginBottom: 4, display: localVideoPath ? 'block' : 'none' }}>
                  <video
                    ref={localVideoRef}
                    src={localVideoPath ? `local-video://${localVideoPath}` : undefined}
                    className="preview-video"
                    autoPlay loop={localVideoLoop}
                    muted
                    playsInline
                    onPlay={() => setLocalVideoPlaying(true)}
                    onPause={() => setLocalVideoPlaying(false)}
                    onEnded={() => { if (!localVideoLoop) setLocalVideoPlaying(false) }}
                  />
                </div>

                {/* 摄像头 */}
                <div className="source-row">
                  <span className="source-label">摄像头</span>
                  {cameraActive ? (
                    <span className="source-status active">已开启</span>
                  ) : (
                    <span className="source-status">未开启</span>
                  )}
                  <div className="source-controls">
                    {cameraActive ? (
                      <>
                        <select value={selectedCameraId} onChange={(e) => {
                          setSelectedCameraId(e.target.value)
                          handleCloseCamera()
                        }}>
                          {cameraDevices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
                          ))}
                        </select>
                        <button onClick={handleCloseCamera}>关闭</button>
                      </>
                    ) : (
                      <button onClick={handleOpenCamera}>开启</button>
                    )}
                  </div>
                </div>
                {/* 摄像头预览 */}
                <div style={{ marginTop: 4, marginBottom: 4, display: cameraActive ? 'block' : 'none' }}>
                  <video
                    ref={cameraVideoRef}
                    className="preview-video"
                    autoPlay muted playsInline
                  />
                </div>

                {/* 屏幕共享 */}
                <div className="source-row">
                  <span className="source-label">屏幕共享</span>
                  {selectedScreenSource ? (
                    <span className="source-status active">{selectedScreenSource.name}</span>
                  ) : (
                    <span className="source-status">未选择</span>
                  )}
                  <div className="source-controls">
                    {selectedScreenSource ? (
                      <button onClick={handleCloseScreen}>关闭</button>
                    ) : (
                      <button onClick={handleSelectScreen}>选择</button>
                    )}
                  </div>
                </div>
                {/* 屏幕共享预览 */}
                <div style={{ marginTop: 4, marginBottom: 4, display: selectedScreenSource ? 'block' : 'none' }}>
                  <video
                    ref={screenVideoRef}
                    className="preview-video"
                    autoPlay muted playsInline
                  />
                </div>
              </div>

              {/* 源选择弹窗 */}
              {showSourceSelector && (
                <div className="source-selector-overlay" onClick={() => setShowSourceSelector(false)}>
                  <div className="source-selector" onClick={(e) => e.stopPropagation()}>
                    <h3>选择屏幕或窗口</h3>
                    <div className="source-cards">
                      {screenSources.map((s) => (
                        <div key={s.id} className="source-card" onClick={() => handleConfirmScreenSource(s.id, s.name)}>
                          <img src={s.thumbnail} alt={s.name} />
                          <span className="source-name">{s.name}</span>
                          <span className="source-type">{s.type === 'screen' ? '屏幕' : '窗口'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 混流预览 */}
              <h2 style={{ marginTop: 16 }}>混流预览</h2>
              <div className="mixer-canvas-wrapper">
                <canvas ref={mixerCanvasRef} width={CANVAS_W} height={CANVAS_H} />
              </div>
              <div className="mixer-layout-controls">
                <button onClick={handleSwitchMain} disabled={getAvailableStreams().length <= 1}>
                  切换大窗口
                </button>
                <span style={{ fontSize: 13, color: '#777' }}>
                  布局: 画中画 | 主画面: {getAvailableStreams().find((s) => s.key === mainStreamKey)?.label || '-'}
                </span>
              </div>

              {/* 录制面板 */}
              <h2 style={{ marginTop: 16 }}>录制面板</h2>
              <div className="recording-panel">
                <div className="recording-row">
                  <span className="recording-label">混流录制</span>
                  {mixerRecording && <><div className="recording-indicator" /><span className="recording-timer">{formatTime(mixerRecTime)}</span></>}
                  <button onClick={mixerRecording ? handleStopMixerRec : handleStartMixerRec} disabled={!mixerActive}>
                    {mixerRecording ? '⏹ 停止' : '⏺ 开始'}
                  </button>
                </div>
                <div className="recording-row">
                  <span className="recording-label">摄像头录制</span>
                  {cameraRecording && <><div className="recording-indicator" /><span className="recording-timer">{formatTime(cameraRecTime)}</span></>}
                  <button onClick={cameraRecording ? handleStopCameraRec : handleStartCameraRec} disabled={!cameraActive}>
                    {cameraRecording ? '⏹ 停止' : '⏺ 开始'}
                  </button>
                </div>
                <div className="recording-row">
                  <span className="recording-label">屏幕录制</span>
                  {screenRecording && <><div className="recording-indicator" /><span className="recording-timer">{formatTime(screenRecTime)}</span></>}
                  <button onClick={screenRecording ? handleStopScreenRec : handleStartScreenRec} disabled={!selectedScreenSource}>
                    {screenRecording ? '⏹ 停止' : '⏺ 开始'}
                  </button>
                </div>

                {recordings.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {recordings.map((rec, i) => (
                      <div key={i} className="recording-result">
                        <span className="filename">{rec.name}</span>
                        <span className="filesize">({(rec.size / 1024 / 1024).toFixed(1)}MB)</span>
                        <button onClick={() => handleDownload(rec)}>下载</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>getUserMedia 示例</h2>
            <div className="code-block">
              <pre>{`// 获取摄像头+麦克风流
const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId: cameraId },
  audio: { deviceId: micId }
})

// 获取屏幕共享流 (Electron)
const screenStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    mandatory: {
      chromeMediaSource: 'desktop',
      chromeMediaSourceId: sourceId
    }
  },
  video: {
    mandatory: {
      chromeMediaSource: 'desktop',
      chromeMediaSourceId: sourceId,
      maxWidth: 1920, maxHeight: 1080
    }
  }
})`}</pre>
            </div>
            <h2>Canvas 混流示例</h2>
            <div className="code-block">
              <pre>{`const canvas = document.getElementById('mixer')
const ctx = canvas.getContext('2d')

function drawFrame() {
  // 大窗口：全屏
  ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height)
  // 小窗口：右下角
  const sw = 480, sh = 270
  const sx = canvas.width - sw - 20
  const sy = canvas.height - sh - 20
  ctx.drawImage(subVideo, sx, sy, sw, sh)
  requestAnimationFrame(drawFrame)
}`}</pre>
            </div>
            <h2>MediaRecorder 示例</h2>
            <div className="code-block">
              <pre>{`// 录制 Canvas 输出流
const outputStream = canvas.captureStream(30)
const recorder = new MediaRecorder(outputStream, {
  mimeType: 'video/webm;codecs=vp8,opus'
})
const chunks = []
recorder.ondataavailable = (e) => chunks.push(e.data)
recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' })
  const url = URL.createObjectURL(blob)
  // 下载或预览
}
recorder.start()`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
