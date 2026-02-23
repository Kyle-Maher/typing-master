import { useEffect, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog ref={dialogRef} className={styles.modal} onClose={onClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
