# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server at localhost:4200
ng build           # production build → dist/
ng watch           # watch-mode build for development
ng test            # unit tests via Karma/Jasmine in Chrome
```

Run a single spec file: `ng test --include='**/concat.spec.ts'`

## Architecture

**myFirstApp** is "DlimitR" — a list-formatting utility that converts pasted text into delimited output (SQL string, semicolon, or comma separated) with optional deduplication and line-wrapping.

### Standalone component model (Angular 20)

The app uses `bootstrapApplication` (no NgModule). All components are standalone and declare their own imports.

```
src/app/
  app.ts / app.html / app.scss   – root shell, imports ConCat
  app.routes.ts                  – currently empty (no routing in use)
  concat/
    concat.ts / concat.html / concat.scss  – sole feature component
```

`ConCatComponent` holds all state as plain class properties (`inputText`, `outputText`, `wrap`, `outputLength`) and uses template reference variables (`#inputtext`, `#wrapInput`, `#toggleGroup`) with imperative click/change handlers. There are no services, no RxJS streams, and no DI beyond Angular internals.

### Styling & Theming

- `src/custom-theme.scss` — Angular Material custom theme (dark scheme, cyan primary, orange tertiary, `#1A2035` background)
- `src/styles.css` — global resets
- `concat/concat.scss` — component layout (flexbox, fixed color palette: `#2E4152` slate, `#B7E4C7` sage green, `#FF8A5B` coral)

Material components in use: `MatFormFieldModule`, `MatButtonToggleModule`, `MatButtonModule`, `MatIconModule`, `MatInputModule`, `MatToolbarModule`.

### Build constraints

Angular budgets (from `angular.json`):
- Initial bundle: warn at 500 kB, error at 1 MB
- Per-component styles: warn at 4 kB, error at 8 kB

TypeScript strict mode is fully enabled (`tsconfig.json`).
