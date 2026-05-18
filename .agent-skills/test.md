# /test — Verification & Testing Skill

This skill ensures that all changes are strictly verified. Code is not complete until it has passed all verification criteria and raw evidence is provided.

## 📋 Standard Workflow
1. Run local linter and type checker: `npm run lint` and `npm run build`.
2. Execute automated unit/integration tests and capture the logs.
3. Test critical API endpoints using raw cURL or fetch statements.
4. Record E2E visual layout rendering or network network console logs.
5. Create a table showing the result (PASS/FAIL) and the exact evidence (JSON response, stdout) for every test criteria.

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "The build passed, so the feature definitely works." | A successful compile only proves type safety, not correct runtime business logic. |
| "I'll test this directly in staging/production." | Unchecked code pushed directly to remote environments causes crashes and regressions. |

## 📐 Template
```markdown
# Verification Report

## Test Results
| Test Scenario | Method | Result | Evidence |
|---|---|---|---|
| Scenario 1 | [e.g., cURL request] | PASS/FAIL | [Raw output or log snippet] |
```
