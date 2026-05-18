# /review — Security & Architecture Review Skill

This skill enforces strict security audits, pattern checks, and dependency evaluations before shipping changes.

## 📋 Standard Workflow
1. Check for exposed secrets, passwords, connection strings, or API tokens in:
   - Modified code and new files.
   - Documentation, markdown logs, or terminal logs.
2. Confirm the Git-tracking status:
   - Ensure `.env*`, database sqlite files (`dev.db`), and temporary artifacts are 100% untracked and excluded in `.gitignore`.
3. Check for unauthorized backdoors:
   - Ensure no developer testing headers, bypass keys, or auth credential workarounds are present in production-bound files.
4. Verify database schema safety:
   - Confirm no dangerous commands (`db push --accept-data-loss`) exist in compilation/build scripts.

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "I'll clean up the keys before pushing." | If a key is saved on disk or committed locally even once, it is at high risk of leaking. |
| "The bypass header is only for my tests; nobody will discover it." | Obscurity is not security. All development testing helpers must be isolated or removed. |
