import { useState } from 'react'
import './ToolPage.css'

export default function VideoParserToolPage() {
  const [activeTab, setActiveTab] = useState<'concept' | 'demo' | 'code'>('concept')

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>视频解析</h1>
        <p>Video Parser - 解析短视频链接，获取无水印视频</p>
      </div>

      <div className="tool-tabs">
        <button className={activeTab === 'concept' ? 'active' : ''} onClick={() => setActiveTab('concept')}>概念详解</button>
        <button className={activeTab === 'demo' ? 'active' : ''} onClick={() => setActiveTab('demo')}>交互演示</button>
        <button className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}>代码示例</button>
      </div>

      <div className="tool-content">
        {activeTab === 'concept' && (
          <div className="concept-section">
            <h2>核心原理</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>链接解析</h3>
                <p>短视频分享链接通常是短链接，需要解析重定向获取真实视频地址</p>
              </div>
              <div className="feature-card">
                <h3>无水印提取</h3>
                <p>通过分析视频页面源码或 API 接口，提取无水印的视频源地址</p>
              </div>
              <div className="feature-card">
                <h3>平台识别</h3>
                <p>根据 URL 特征自动识别视频平台，选择对应的解析策略</p>
              </div>
              <div className="feature-card">
                <h3>格式转换</h3>
                <p>部分平台视频为特殊格式，需转换为通用 MP4 格式便于播放</p>
              </div>
            </div>

            <h2>解析流程</h2>
            <div className="diagram-box">
              <pre className="ascii-art">{`
    用户                      解析服务                    视频平台
       |                          |                          |
       |  ──── 分享链接 ────────> |                          |
       |                          |  ──── 请求短链接 ──────> |
       |                          |  <─── 重定向地址 ─────── |
       |                          |                          |
       |                          |  ──── 请求视频页面 ────> |
       |                          |  <─── 页面 HTML ──────── |
       |                          |                          |
       |                          |  [解析视频 ID]           |
       |                          |  [构造 API 请求]         |
       |                          |                          |
       |                          |  ──── API 请求 ────────> |
       |                          |  <─── 视频元数据 ─────── |
       |                          |                          |
       |                          |  [提取无水印地址]        |
       |  <─── 视频下载地址 ───── |                          |
       |                          |                          |
              `}</pre>
            </div>

            <h2>支持平台</h2>
            <div className="config-table">
              <table>
                <thead>
                  <tr>
                    <th>平台</th>
                    <th>链接格式</th>
                    <th>特点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>抖音</td>
                    <td><code>v.douyin.com</code></td>
                    <td>国内最大短视频平台，水印处理复杂</td>
                  </tr>
                  <tr>
                    <td>快手</td>
                    <td><code>v.kuaishou.com</code></td>
                    <td>支持多清晰度，视频质量高</td>
                  </tr>
                  <tr>
                    <td>TikTok</td>
                    <td><code>vm.tiktok.com</code></td>
                    <td>抖音海外版，需特殊网络环境</td>
                  </tr>
                  <tr>
                    <td>YouTube</td>
                    <td><code>youtu.be</code></td>
                    <td>支持多分辨率，需第三方工具</td>
                  </tr>
                  <tr>
                    <td>微博</td>
                    <td><code>weibo.com</code></td>
                    <td>视频时长较短，格式多样</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>应用场景</h2>
            <ul className="scenario-list">
              <li><strong>内容创作</strong> - 下载素材进行二次创作</li>
              <li><strong>视频收藏</strong> - 保存喜欢的视频到本地</li>
              <li><strong>离线观看</strong> - 无网络环境下观看视频</li>
              <li><strong>素材整理</strong> - 收集整理视频素材库</li>
              <li><strong>学习研究</strong> - 分析视频内容和创作技巧</li>
            </ul>

            <div className="info-box warning">
              <strong>注意事项</strong>
              <ul>
                <li>请尊重原创作者版权，仅用于个人学习和合理使用</li>
                <li>不要用于商业用途或未经授权的传播</li>
                <li>平台可能更新反爬机制，解析方法需持续更新</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="demo-section">
            <h2>链接识别演示</h2>
            <VideoParserDemo />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-section">
            <h2>Python 示例</h2>
            <div className="code-block">
              <pre>{`# 视频链接解析示例
import requests
import re

def parse_douyin(url: str) -> dict:
    """解析抖音视频链接"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)'
    }

    # 1. 获取重定向地址
    resp = requests.get(url, headers=headers, allow_redirects=False)
    if resp.status_code == 302:
        redirect_url = resp.headers.get('Location', '')

        # 2. 提取视频 ID
        match = re.search(r'/video/(\\d+)', redirect_url)
        if match:
            video_id = match.group(1)

            # 3. 请求 API 获取视频信息
            api_url = f"https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids={video_id}"
            api_resp = requests.get(api_url, headers=headers)
            data = api_resp.json()

            if data.get('status_code') == 0:
                item = data['item_list'][0]
                return {
                    'title': item.get('desc', ''),
                    'author': item['author'].get('nickname', ''),
                    'video_url': item['video']['play_addr']['url_list'][0]
                }

    return {'error': '解析失败'}

# 使用示例
if __name__ == '__main__':
    url = "https://v.douyin.com/xxx"
    result = parse_douyin(url)
    print(result)`}</pre>
            </div>

            <h2>Go 语言示例</h2>
            <div className="code-block">
              <pre>{`package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "regexp"
    "time"
)

type VideoInfo struct {
    Title    string \`json:"title"\`
    Author   string \`json:"author"\`
    VideoURL string \`json:"video_url"\`
}

func ParseDouyin(url string) (*VideoInfo, error) {
    client := &http.Client{
        Timeout: 10 * time.Second,
        CheckRedirect: func(req *http.Request, via []*http.Request) error {
            return http.ErrUseLastResponse // 不自动跟随重定向
        },
    }

    // 创建请求
    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)")

    // 获取重定向地址
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode == 302 {
        location := resp.Header.Get("Location")

        // 提取视频 ID
        re := regexp.MustCompile(\`/video/(\\d+)\`)
        match := re.FindStringSubmatch(location)
        if len(match) > 1 {
            videoID := match[1]

            // 请求 API
            apiURL := fmt.Sprintf("https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=%s", videoID)
            apiResp, _ := http.Get(apiURL)
            defer apiResp.Body.Close()

            body, _ := io.ReadAll(apiResp.Body)

            var result struct {
                ItemList []struct {
                    Desc   string \`json:"desc"\`
                    Author struct {
                        Nickname string \`json:"nickname"\`
                    } \`json:"author"\`
                    Video struct {
                        PlayAddr struct {
                            URLList []string \`json:"url_list"\`
                        } \`json:"play_addr"\`
                    } \`json:"video"\`
                } \`json:"item_list"\`
            }

            json.Unmarshal(body, &result)

            if len(result.ItemList) > 0 {
                item := result.ItemList[0]
                return &VideoInfo{
                    Title:    item.Desc,
                    Author:   item.Author.Nickname,
                    VideoURL: item.Video.PlayAddr.URLList[0],
                }, nil
            }
        }
    }

    return nil, fmt.Errorf("parse failed")
}

func main() {
    info, err := ParseDouyin("https://v.douyin.com/xxx")
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Printf("Title: %s\\nAuthor: %s\\nURL: %s\\n", info.Title, info.Author, info.VideoURL)
}`}</pre>
            </div>

            <h2>JavaScript 示例</h2>
            <div className="code-block">
              <pre>{`// 视频解析示例 (Node.js)
const axios = require('axios');

async function parseVideo(url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X)'
    };

    try {
        // 获取重定向地址
        const resp = await axios.get(url, {
            headers,
            maxRedirects: 0,
            validateStatus: (status) => status === 302 || status === 301
        });

        const location = resp.headers.location;

        // 提取视频 ID (以抖音为例)
        const match = location.match(/\\/video\\/(\\d+)/);
        if (match) {
            const videoId = match[1];

            // 请求 API
            const apiResp = await axios.get(
                \`https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=\${videoId}\`,
                { headers }
            );

            const item = apiResp.data.item_list[0];
            return {
                title: item.desc,
                author: item.author.nickname,
                videoUrl: item.video.play_addr.url_list[0],
                cover: item.video.cover.url_list[0]
            };
        }
    } catch (error) {
        console.error('解析失败:', error.message);
    }

    return null;
}

// 使用示例
parseVideo('https://v.douyin.com/xxx')
    .then(info => console.log(info))
    .catch(err => console.error(err));`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 视频解析演示组件
function VideoParserDemo() {
  const [videoUrl, setVideoUrl] = useState('')
  const [result, setResult] = useState<{ platform: string; note: string } | null>(null)

  const platforms = [
    { name: '抖音', icon: '🎵', pattern: /douyin\.com|iesdouyin\.com/ },
    { name: '快手', icon: '⚡', pattern: /kuaishou\.com|gif\.kuaishou\.com/ },
    { name: 'TikTok', icon: '🎬', pattern: /tiktok\.com/ },
    { name: 'YouTube', icon: '▶️', pattern: /youtube\.com|youtu\.be/ },
    { name: '微博', icon: '📝', pattern: /weibo\.com|weibo\.cn/ },
    { name: 'B站', icon: '📺', pattern: /bilibili\.com/ }
  ]

  const handleAnalyze = () => {
    if (!videoUrl.trim()) {
      setResult(null)
      return
    }

    for (const platform of platforms) {
      if (platform.pattern.test(videoUrl)) {
        setResult({
          platform: `${platform.icon} ${platform.name}`,
          note: `检测到 ${platform.name} 平台链接`
        })
        return
      }
    }

    setResult({
      platform: '未知平台',
      note: '未能识别视频平台，请检查链接格式'
    })
  }

  const clearInput = () => {
    setVideoUrl('')
    setResult(null)
  }

  return (
    <div className="video-parser-demo">
      <div className="config-row" style={{ marginBottom: '16px' }}>
        <label>视频链接</label>
        <textarea
          className="tool-textarea"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="粘贴短视频分享链接..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '13px',
            resize: 'vertical'
          }}
        />
      </div>

      <div className="demo-controls" style={{ marginBottom: '16px' }}>
        <button onClick={handleAnalyze}>识别平台</button>
        <button onClick={clearInput}>清除</button>
      </div>

      {result && (
        <div className="result-box">
          <h4>{result.platform}</h4>
          <p className="hint">{result.note}</p>
        </div>
      )}

      <div className="info-box" style={{ marginTop: '16px' }}>
        <strong>支持的链接格式</strong>
        <ul>
          <li><code>v.douyin.com/xxx</code> - 抖音短视频</li>
          <li><code>v.kuaishou.com/xxx</code> - 快手短视频</li>
          <li><code>vm.tiktok.com/xxx</code> - TikTok</li>
          <li><code>youtu.be/xxx</code> - YouTube</li>
        </ul>
      </div>
    </div>
  )
}
