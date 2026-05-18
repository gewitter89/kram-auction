# /spec — Specification Creation Skill

This skill governs the requirement elicitation and specification phase. Before writing any plan or modifying any code, the agent MUST understand and document the goal.

## 📋 Standard Workflow
1. Read the user requirements and analyze the existing codebase.
2. Draft a clear specification including:
   - **Context**: Why is this feature or fix required?
   - **Functional Requirements**: What must the application do?
   - **Technical Constraints**: APIs, schemas, performance limits, and framework boundaries.
3. Save the specification for user verification or review.

## 🛡️ anti-rationalizations (Excuses Agents Use to Skip Work)
| Rationalization | Counter-Argument |
|---|---|
| "The request is very simple; I don't need a spec." | Simple requests often have implicit assumptions that break existing features. |
| "I will write the spec while I write the code." | Specifying during coding leads to design churn and incomplete requirements. |

## 📐 Template
```markdown
# Specification: [Feature Name]

## 1. Context & Motivation
[Describe the problem to be solved and its value.]

## 2. Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## 3. Boundary Conditions & Non-Goals
- [What is explicitly OUT of scope.]
```
