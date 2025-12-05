interface DataPoint {
  value: number;
  label?: string;
}

interface MiniLineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function MiniLineChart({ data, color = 'var(--color-accent)', height = 60 }: MiniLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          No data
        </span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - point.value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} style={{ overflow: 'visible' }}>
      {/* Gradient */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area under line */}
      <polygon
        points={`0,100 ${points} 100,100`}
        fill="url(#lineGradient)"
        vectorEffect="non-scaling-stroke"
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Points */}
      {data.map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = ((maxValue - point.value) / range) * 100;
        return (
          <circle
            key={index}
            cx={`${x}%`}
            cy={`${y}%`}
            r="3"
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

interface MiniBarChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function MiniBarChart({ data, color = 'var(--color-accent)', height = 60 }: MiniBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No data</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${height}px` }}>
      {data.map((point, index) => {
        const barHeight = (point.value / maxValue) * 100;
        const isHighest = point.value === maxValue;
        
        return (
          <div
            key={index}
            style={{
              flex: 1,
              background: isHighest ? color : `${color}60`,
              height: `${barHeight}%`,
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s ease',
              minHeight: '4px',
            }}
            title={`${point.label || ''}: ${point.value}`}
          />
        );
      })}
    </div>
  );
}

interface SleepChartProps {
  sleepHours: number;
  deepSleep?: number;
  lightSleep?: number;
  rem?: number;
  height?: number;
}

export function SleepChart({ sleepHours, deepSleep = 2, lightSleep = 4, rem = 2, height = 60 }: SleepChartProps) {
  const total = deepSleep + lightSleep + rem;
  const deepPercent = (deepSleep / total) * 100;
  const lightPercent = (lightSleep / total) * 100;
  const remPercent = (rem / total) * 100;

  return (
    <div style={{ width: '100%' }}>
      {/* Sleep Phase Bar */}
      <div
        style={{
          display: 'flex',
          height: '24px',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div
          style={{
            width: `${deepPercent}%`,
            background: '#4F46E5',
            transition: 'width 0.3s ease',
          }}
          title={`Deep: ${deepSleep}h`}
        />
        <div
          style={{
            width: `${lightPercent}%`,
            background: '#818CF8',
            transition: 'width 0.3s ease',
          }}
          title={`Light: ${lightSleep}h`}
        />
        <div
          style={{
            width: `${remPercent}%`,
            background: '#C7D2FE',
            transition: 'width 0.3s ease',
          }}
          title={`REM: ${rem}h`}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4F46E5' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Deep {deepSleep}h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>Light {lightSleep}h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C7D2FE' }} />
          <span style={{ color: 'var(--color-text-muted)' }}>REM {rem}h</span>
        </div>
      </div>
    </div>
  );
}