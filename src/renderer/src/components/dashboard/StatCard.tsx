interface StatCardProps {
  icon?: string
  title: string
  value: string | number
  subtitle?: string
  color?: string
}

export function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      padding: '16px 20px',
      border: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minHeight: 90
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
        <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: color || '#333', lineHeight: 1.3 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#999' }}>{subtitle}</div>
      )}
    </div>
  )
}
