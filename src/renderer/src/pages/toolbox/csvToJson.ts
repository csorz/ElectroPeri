/** 简易 CSV 解析：支持双引号包裹、转义 "" */
export function csvToJsonRows(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length === 0) return []

  const parseRow = (line: string): string[] => {
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQuotes) {
        if (c === '"') {
          if (line[i + 1] === '"') {
            cur += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          cur += c
        }
      } else if (c === '"') {
        inQuotes = true
      } else if (c === ',') {
        cells.push(cur)
        cur = ''
      } else {
        cur += c
      }
    }
    cells.push(cur)
    return cells
  }

  const headers = parseRow(lines[0])
  const rows: Record<string, string>[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = parseRow(lines[r])
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? ''
    })
    rows.push(obj)
  }
  return rows
}
