import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  icon?: string
  accentColor?: string
  children: ReactNode
}

export function SectionCard({ title, icon, accentColor = '#4fc3f7', children }: SectionCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #e8e8e8',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '10px 16px',
        fontSize: 14,
        fontWeight: 600,
        color: '#333',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderLeft: `3px solid ${accentColor}`
      }}>
        {icon && <span>{icon}</span>}
        {title}
      </div>
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  )
}
