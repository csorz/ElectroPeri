import { ipcMain } from 'electron'
import https from 'node:https'
import http from 'node:http'

export interface MetaInfo {
  title: string
  description: string
  keywords: string
  author: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  canonical: string
  robots: string
  viewport: string
  charset: string
  language: string
  favicon: string
  h1: string[]
  h2: string[]
  images: { alt: string; src: string }[]
  links: { text: string; href: string }[]
}

function extractMeta(html: string, url: string): MetaInfo {
  const result: MetaInfo = {
    title: '',
    description: '',
    keywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogType: '',
    twitterCard: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonical: '',
    robots: '',
    viewport: '',
    charset: '',
    language: '',
    favicon: '',
    h1: [],
    h2: [],
    images: [],
    links: []
  }

  // 提取 title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch) result.title = titleMatch[1].trim()

  // 提取 meta 标签
  const metaRegex = /<meta\s+([^>]*?)\/?>/gi
  let match
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1]
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i)
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i)
    const contentMatch = attrs.match(/content=["']([^"']*)["']/i)
    const httpEquivMatch = attrs.match(/http-equiv=["']([^"']+)["']/i)
    const charsetMatch = attrs.match(/charset=["']?([^"'\s>]+)/i)

    const name = nameMatch?.[1]?.toLowerCase() || ''
    const property = propertyMatch?.[1]?.toLowerCase() || ''
    const content = contentMatch?.[1] || ''
    const httpEquiv = httpEquivMatch?.[1]?.toLowerCase() || ''
    const charset = charsetMatch?.[1] || ''

    if (charset) result.charset = charset
    if (httpEquiv === 'content-type' && content.includes('charset=')) {
      const cs = content.match(/charset=([^;\s]+)/i)
      if (cs) result.charset = cs[1]
    }

    switch (name) {
      case 'description': result.description = content; break
      case 'keywords': result.keywords = content; break
      case 'author': result.author = content; break
      case 'robots': result.robots = content; break
      case 'viewport': result.viewport = content; break
      case 'twitter:card': result.twitterCard = content; break
      case 'twitter:title': result.twitterTitle = content; break
      case 'twitter:description': result.twitterDescription = content; break
      case 'twitter:image': result.twitterImage = content; break
    }

    switch (property) {
      case 'og:title': result.ogTitle = content; break
      case 'og:description': result.ogDescription = content; break
      case 'og:image': result.ogImage = content; break
      case 'og:type': result.ogType = content; break
    }
  }

  // 提取 canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  if (canonicalMatch) result.canonical = canonicalMatch[1]

  // 提取 favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
  if (faviconMatch) {
    result.favicon = faviconMatch[1]
    if (result.favicon.startsWith('/')) {
      try {
        const urlObj = new URL(url)
        result.favicon = `${urlObj.protocol}//${urlObj.host}${result.favicon}`
      } catch {}
    }
  }

  // 提取语言
  const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i)
  if (langMatch) result.language = langMatch[1]

  // 提取 h1
  const h1Regex = /<h1[^>]*>([^<]*)<\/h1>/gi
  while ((match = h1Regex.exec(html)) !== null) {
    result.h1.push(match[1].trim())
  }

  // 提取 h2
  const h2Regex = /<h2[^>]*>([^<]*)<\/h2>/gi
  while ((match = h2Regex.exec(html)) !== null) {
    result.h2.push(match[1].trim())
  }

  // 提取图片
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/gi
  while ((match = imgRegex.exec(html)) !== null) {
    result.images.push({ src: match[1], alt: match[2] })
  }

  // 提取链接
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
  while ((match = linkRegex.exec(html)) !== null) {
    const text = match[2].trim()
    if (text && !match[1].startsWith('#') && !match[1].startsWith('javascript:')) {
      result.links.push({ href: match[1], text })
    }
  }

  return result
}

export function setupMetaHandlers(): void {
  ipcMain.handle('meta:check', async (_event, url: string) => {
    // 确保 URL 有协议
    let targetUrl = url
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    return new Promise((resolve) => {
      const client = targetUrl.startsWith('https://') ? https : http

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      }, (res) => {
        let html = ''

        res.on('data', (chunk) => {
          html += chunk.toString()
        })

        res.on('end', () => {
          try {
            const meta = extractMeta(html, targetUrl)
            resolve({ success: true, url: targetUrl, meta, statusCode: res.statusCode })
          } catch (e) {
            resolve({ success: false, error: e instanceof Error ? e.message : 'Parse failed' })
          }
        })
      })

      req.on('error', (e) => {
        resolve({ success: false, error: e.message })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({ success: false, error: 'Request timeout' })
      })
    })
  })
}
