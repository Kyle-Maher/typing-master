# data/dictation/

Passage data for Dictation Practice mode.

## Structure

| File | Contents |
|---|---|
| `beginner.ts` | 5 short passages (1–2 sentences, everyday vocabulary) |
| `intermediate.ts` | 5 medium passages (2–3 sentences) |
| `advanced.ts` | 5 longer passages (3–5 sentences, richer vocabulary) |
| `index.ts` | Aggregator — `getAllDictationPassages()`, `getDictationPassageById(id)` |

## `DictationPassage` shape
```ts
export interface DictationPassage {
  id: string;
  title: string;
  text: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

## Notes
- Passage text is hidden from the user during the listening and typing phases
- Scoring uses `coverageScore` (% of content words matched), not character accuracy
- Import from `index.ts` only, not sub-files directly
