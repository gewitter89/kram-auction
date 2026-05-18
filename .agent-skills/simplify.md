# /simplify — Code Simplification & DRY Skill

This skill enforces code simplicity, cleanliness, and the prevention of over-engineering or code duplication.

## 📋 Standard Workflow
1. Analyze new or modified files for repetitive patterns.
2. Refactor complex, nested logic blocks into focused, testable helper functions.
3. Check for unnecessary external packages; leverage core native APIs (like fetch instead of axios, vanilla Tailwind utilities, or native Next.js helpers) wherever possible.
4. Remove commented-out code blocks, obsolete debugging `console.log` statements, and dead test functions.

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "I'll keep this old block of commented code in case I need it later." | Git stores history; keeping dead code on active pages degrades readability and quality. |
| "Writing a dedicated utility takes too long; I'll duplicate the logic just this once." | Duplicated logic is the leading cause of out-of-sync states, bugs, and maintainability fatigue. |
