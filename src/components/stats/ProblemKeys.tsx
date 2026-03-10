import { QWERTY_LAYOUT, fingerColor } from '@/data/keyboard-layouts';
import styles from './ProblemKeys.module.css';

interface ProblemKeysProps {
  problemKeys: Record<string, number>;
}

export function ProblemKeys({ problemKeys }: ProblemKeysProps) {
  const maxCount = Math.max(...Object.values(problemKeys), 1);

  if (Object.keys(problemKeys).length === 0) {
    return <p className={styles.empty}>No problem keys yet. Keep practicing!</p>;
  }

  return (
    <div className={styles.keyboard}>
      {QWERTY_LAYOUT.map((row, rowIdx) => (
        <div key={rowIdx} className={styles.row}>
          {row.map((keyData) => {
            const count = problemKeys[keyData.key] ?? problemKeys[keyData.key.toLowerCase()] ?? 0;
            const intensity = count > 0 ? Math.min(count / maxCount, 1) : 0;
            const bgColor = intensity > 0
              ? `rgba(239, 68, 68, ${0.15 + intensity * 0.7})`
              : undefined;

            return (
              <div
                key={keyData.key}
                className={styles.key}
                style={{
                  width: `${keyData.width * 36}px`,
                  background: bgColor,
                  borderBottomColor: fingerColor(keyData.finger),
                }}
                title={count > 0 ? `${keyData.label}: ${count} errors` : keyData.label}
              >
                <span className={styles.label}>{keyData.label}</span>
                {count > 0 && <span className={styles.count}>{count}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
