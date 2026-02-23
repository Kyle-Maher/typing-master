import { type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button className={clsx(styles.button, styles[variant], styles[size], className)} {...props}>
      {children}
    </button>
  );
}
