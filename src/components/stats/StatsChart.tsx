import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WpmOverTime } from '@/services/analytics';
import styles from './StatsChart.module.css';

interface StatsChartProps {
  data: WpmOverTime[];
}

export function StatsChart({ data }: StatsChartProps) {
  if (data.length === 0) {
    return <p className={styles.empty}>Complete some lessons to see your progress chart.</p>;
  }

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
          <YAxis yAxisId="wpm" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
          <YAxis yAxisId="acc" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line yAxisId="wpm" type="monotone" dataKey="wpm" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} name="WPM" />
          <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 4 }} name="Accuracy %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
