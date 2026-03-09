# styles/

## Files
- `variables.css` — all CSS custom properties (imported globally)
- `global.css` — base resets and body styles
- `animations.css` — keyframe definitions

## Token usage
Use `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)` in component CSS Modules. Never hardcode colors or spacing values.

## Theming
- `[data-theme='dark']` on `:root` overrides color variables only (spacing/radius unchanged)
- `data-theme` set by `SettingsContext` on `document.documentElement`
- No JS needed in components — CSS handles all visual differences

## Font size
- `[data-font-size='small'|'medium'|'large']` attribute on `<html>` set by SettingsContext
- Components can target these selectors in their CSS Modules if they need size variants

## Finger colors (keyboard components only)
`--finger-pinky` | `--finger-ring` | `--finger-middle` | `--finger-index` | `--finger-thumb`
