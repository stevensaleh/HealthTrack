// src/components/TimePeriodToggle.tsx

export type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

interface TimePeriodToggleProps {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

export default function TimePeriodToggle({ selected, onChange }: TimePeriodToggleProps) {
  const periods: TimePeriod[] = ['DAY', 'WEEK', 'MONTH', 'YEAR'];

  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#f5f5f5',
        borderRadius: 'var(--radius-md)',
        padding: '4px',
        gap: '4px',
      }}
    >
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: selected === period ? 'var(--color-accent)' : 'transparent',
            color: selected === period ? 'white' : 'var(--color-text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={(e) => {
            if (selected !== period) {
              e.currentTarget.style.background = '#e8e8e8';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== period) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {period}
        </button>
      ))}
    </div>
  );
}