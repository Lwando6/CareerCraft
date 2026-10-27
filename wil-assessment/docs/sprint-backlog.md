# Sprint Backlog

## Sprint goal

Deliver a coherent core workflow in which a logged-in user can maintain career information, build and save a CV, select available templates and add chosen GitHub projects. Stabilise the supporting AI and membership experience without expanding into institution analytics.

## Sprint boundaries

- **Cadence:** two-week iteration.
- **Priority:** data persistence and complete user journeys before new tools.
- **Definition of done:** acceptance criteria pass, errors are visible, responsive behaviour is checked, and no secrets are committed.

## Selected sprint items

| Task | Related item | Estimate | Owner | Status | Verification |
|---|---|---:|---|---|---|
| Confirm CV and profile database schema | PB-03, PB-05 | 4 h | Product team | In progress | Schema matches UI fields |
| Implement CV create/read/update flow | PB-04, PB-05 | 10 h | Product team | In progress | Saved CV reopens correctly |
| Add save loading, success and error feedback | PB-05 | 3 h | Product team | Planned | Manual happy/error-path test |
| Define template catalogue and two Free layouts | PB-06, PB-07 | 6 h | Product team | In progress | Free user can select both layouts |
| Persist selected template with CV | PB-06 | 4 h | Product team | Planned | Selection survives reload |
| Fetch GitHub repositories with clear states | PB-09 | 5 h | Product team | In progress | Loading, empty and failure states work |
| Save selected portfolio projects | PB-10 | 5 h | Product team | In progress | Selections return after login |
| Render selected projects in CV | PB-11 | 8 h | Product team | Planned | Preview matches saved selection |
| Make LinkedIn post photos optional | PB-13 | 3 h | Product team | In progress | Text-only request succeeds |
| Improve AI response and error validation | PB-18 | 5 h | Product team | In progress | Invalid/HTML responses do not crash UI |
| Review plan access rules | PB-16 | 4 h | Product team | In progress | Test matrix passes for each plan |
| Run responsive and keyboard review | PB-20 | 5 h | Product team | Planned | Mobile and keyboard checklist |

## Daily review questions

1. What was completed since the last review?
2. What will be completed next?
3. What is blocked by configuration, data or an external service?
4. Does new work threaten the sprint goal?

## Sprint review evidence

- Demonstration of signup/login and authenticated workspace access.
- Demonstration of CV save and retrieval.
- Demonstration of template selection.
- Demonstration of GitHub project selection and CV inclusion.
- Text-only LinkedIn post generation.
- Updated repository documentation and issue list.

## Retrospective prompts

- Which integration caused the most rework and why?
- Which acceptance criteria prevented ambiguity?
- Which manual steps should become automated tests?
- What should be removed or deferred from the next sprint?

