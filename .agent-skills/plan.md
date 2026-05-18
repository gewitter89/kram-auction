# /plan — Implementation Planning Skill

This skill governs the planning phase. No code modifications should be executed before a detailed implementation plan is written and approved.

## 📋 Standard Workflow
1. List all components and modules affected by the changes.
2. Group proposed modifications logically (dependencies first).
3. Specify exactly:
   - Modified files (including target ranges or line blocks).
   - New files to be created.
   - Deleted files.
4. Define the **Verification Plan** detailing how each step will be proven to work.

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "Planning takes too much time; I'll just write the code directly." | Coding without a plan leads to bugs, complex rollbacks, and architectural misalignment. |
| "I'll update the plan after I finish the implementation." | A plan is a map to guide development, not a retrospective summary. |

## 📐 Template
```markdown
# Implementation Plan: [Goal Description]

## Proposed Changes
### [Component/Feature Name]
- **[MODIFY]** `path/to/file`
  - Exact lines to change and the code diff.
- **[NEW]** `path/to/newfile`

## Verification Plan
### Automated Tests
- [Command to run tests]
### Manual Checks
- [Step-by-step E2E validation]
```
