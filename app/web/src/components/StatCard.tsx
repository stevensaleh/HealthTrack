// src/components/StatCard.tsx
import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  chart?: ReactNode;
  color?: string;
}

export default function StatCard({
  icon,
  title,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  chart,
  color = 'var(--color-accent)',
}: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'var(--color-success)';
    if (trend === 'down') return 'var(--color-error)';
    return 'var(--color-text-muted)';
  };

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-card)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-base)',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: color,
            }}
          >
            {icon}
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {title}
          </span>
        </div>

        {trend && trendValue && (
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: getTrendColor(),
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-muted)',
              marginLeft: 'var(--space-2)',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: chart ? 'var(--space-4)' : 0,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Chart */}
      {chart && <div style={{ flex: 1, marginTop: 'auto' }}>{chart}</div>}
    </div>
  );
}