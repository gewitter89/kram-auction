# /ship — Clean Commits & Shipping Skill

This skill governs the final stage before committing, pushing, and deploying code.

## 📋 Standard Workflow
1. Run final local verification checks:
   - Ensure the linter passes with zero errors: `npm run lint`.
   - Ensure the production build passes natively: `npm run build`.
2. Inspect the exact git status and changes:
   - Run `git diff` to double check every modified line.
3. Formulate atomic, descriptive commits following Conventional Commits (e.g., `fix: remove unsafe bypass`, `feat: add tracking sync`).
4. Perform final deployment check:
   - Ensure environment variables are successfully deployed and updated on the target host (e.g., Vercel dashboard).

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "I'll group all my unrelated changes into a single 'update files' commit." | Monolithic, descriptive-less commits degrade git logs and make rollbacks extremely painful. |
| "It works locally; no need to build the production bundle." | Local environments are permissive; differences in casing, strict types, or bundler configs will break the live build. |
