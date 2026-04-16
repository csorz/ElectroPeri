interface GaugeBarProps {
  value: number
  label?: string
  showPercent?: boolean
  height?: number
}

export function GaugeBar({ value, label, showPercent = true, height = 8 }: GaugeBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const color = clamped > 80 ? '#ef5350' : clamped > 60 ? '#ff9800' : '#4caf50'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      {label && (
        <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', minWidth: 40 }}>{label}</span>
      )}
      <div style={{
        flex: 1,
        height,
        background: '#e0e0e0',
        borderRadius: height / 2,
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          borderRadius: height / 2,
          transition: 'width 0.3s ease'
        }} />
      </div>
      {showPercent && (
        <span style={{ fontSize: 12, color: '#333', fontWeight: 500, minWidth: 36, textAlign: 'right' }}>
          {clamped.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
