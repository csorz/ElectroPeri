import { ipcMain } from 'electron'
import dns from 'node:dns'
import { promisify } from 'node:util'

const resolve4 = promisify(dns.resolve4)
const resolve6 = promisify(dns.resolve6)
const resolveMx = promisify(dns.resolveMx)
const resolveTxt = promisify(dns.resolveTxt)
const resolveNs = promisify(dns.resolveNs)
const resolveCname = promisify(dns.resolveCname)
const reverse = promisify(dns.reverse)

export interface DnsResult {
  type: string
  records: string[]
  error?: string
}

export interface DnsFullResult {
  domain: string
  results: DnsResult[]
}

async function queryType(domain: string, type: string): Promise<DnsResult> {
  try {
    let records: string[] = []

    switch (type) {
      case 'A':
        records = await resolve4(domain)
        break
      case 'AAAA':
        records = await resolve6(domain)
        break
      case 'MX':
        const mxRecords = await resolveMx(domain)
        records = mxRecords.map(r => `${r.priority} ${r.exchange}`)
        break
      case 'TXT':
        const txtRecords = await resolveTxt(domain)
        records = txtRecords.map(r => r.join(''))
        break
      case 'NS':
        records = await resolveNs(domain)
        break
      case 'CNAME':
        records = await resolveCname(domain)
        break
      default:
        return { type, records: [], error: 'Unsupported record type' }
    }

    return { type, records }
  } catch (e) {
    return { type, records: [], error: e instanceof Error ? e.message : 'Query failed' }
  }
}

export function setupDnsHandlers(): void {
  // 查询单个类型
  ipcMain.handle('dns:query', async (_event, domain: string, type: string) => {
    return queryType(domain, type)
  })

  // 查询所有常见类型
  ipcMain.handle('dns:queryAll', async (_event, domain: string) => {
    const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']
    const results: DnsResult[] = []

    for (const type of types) {
      const result = await queryType(domain, type)
      if (result.records.length > 0 || !result.error) {
        results.push(result)
      }
    }

    return { domain, results } as DnsFullResult
  })

  // 反向查询（IP -> 域名）
  ipcMain.handle('dns:reverse', async (_event, ip: string) => {
    try {
      const hostnames = await reverse(ip)
      return { success: true, hostnames }
    } catch (e) {
      return { success: false, hostnames: [], error: e instanceof Error ? e.message : 'Reverse lookup failed' }
    }
  })

  // 获取本地 DNS 服务器
  ipcMain.handle('dns:getServers', () => {
    return dns.getServers()
  })
}
