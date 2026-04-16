interface InfoRowProps {
  label: string
  value: string | number | undefined | null
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid #f0f0f0',
      fontSize: 13
    }}>
      <span style={{ color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#333', fontWeight: 500, textAlign: 'right', marginLeft: 16, wordBreak: 'break-all' }}>
        {value ?? '-'}
      </span>
    </div>
  )
}
