/** 按行做 LCS 回溯，输出 unified 风格（前缀 + / - / 空格） */
export function diffLines(a: string, b: string): string {
  const la = a.split(/\r?\n/)
  const lb = b.split(/\r?\n/)
  const n = la.length
  const m = lb.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (la[i - 1] === lb[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const out: string[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && la[i - 1] === lb[j - 1]) {
      out.unshift(`  ${la[i - 1]}`)
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      out.unshift(`+ ${lb[j - 1]}`)
      j--
    } else if (i > 0) {
      out.unshift(`- ${la[i - 1]}`)
      i--
    }
  }
  return out.join('\n')
}
