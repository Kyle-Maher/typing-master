import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/common/Button';
import type { CustomWordList } from '@/types/user';
import styles from './CustomWordListEditor.module.css';

export function CustomWordListEditor() {
  const { progress, updateProgress } = useUser();
  const [name, setName] = useState('');
  const [wordsText, setWordsText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!progress) return null;

  const handleSave = () => {
    if (!name.trim() || !wordsText.trim()) return;
    const words = wordsText.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean);
    if (words.length === 0) return;

    const updatedLists = [...progress.customWordLists];

    if (editingId) {
      const idx = updatedLists.findIndex((l) => l.id === editingId);
      if (idx >= 0) {
        updatedLists[idx] = { ...updatedLists[idx]!, name: name.trim(), words };
      }
    } else {
      const newList: CustomWordList = {
        id: crypto.randomUUID(),
        name: name.trim(),
        words,
        createdAt: new Date().toISOString(),
      };
      updatedLists.push(newList);
    }

    updateProgress({ ...progress, customWordLists: updatedLists });
    setName('');
    setWordsText('');
    setEditingId(null);
  };

  const handleEdit = (list: CustomWordList) => {
    setEditingId(list.id);
    setName(list.name);
    setWordsText(list.words.join('\n'));
  };

  const handleDelete = (id: string) => {
    const updatedLists = progress.customWordLists.filter((l) => l.id !== id);
    updateProgress({ ...progress, customWordLists: updatedLists });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="List name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={styles.textarea}
          placeholder="Enter words, one per line or comma-separated"
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          rows={6}
        />
        <div className={styles.actions}>
          <Button onClick={handleSave} disabled={!name.trim() || !wordsText.trim()}>
            {editingId ? 'Update List' : 'Save List'}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={() => { setEditingId(null); setName(''); setWordsText(''); }}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {progress.customWordLists.length > 0 && (
        <div className={styles.lists}>
          <h3>Your Word Lists</h3>
          {progress.customWordLists.map((list) => (
            <div key={list.id} className={styles.listItem}>
              <div>
                <strong>{list.name}</strong>
                <span className={styles.count}>{list.words.length} words</span>
              </div>
              <div className={styles.listActions}>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(list)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(list.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
