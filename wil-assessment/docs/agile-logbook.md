# Agile Logbook

This logbook records the iterative development of CareerCraft. It uses project periods rather than claiming unsupported daily time records. Repository commits, deployment history and screenshots should be used as supporting evidence.

| Period | Focus | Work completed or attempted | Outcome and learning | Next action |
|---|---|---|---|---|
| August 2026 | Problem definition | Defined the need for locally relevant CV, portfolio and career-branding support | A broad service concept needed one reusable profile at its centre | Clarify the MVP and user journey |
| Early September 2026 | Initial web product | Built the static multi-page CareerCraft website and core brand direction | The concept could be demonstrated quickly, but pages were disconnected | Create consistent navigation and workflows |
| Mid September 2026 | Source control and deployment | Published the project to GitHub and connected the site to Netlify | Continuous deployment made iteration faster; configuration errors became visible | Document environment variables and deployment settings |
| Mid September 2026 | Authentication and database | Connected Supabase authentication and began mapping saved user information | Front-end screens alone did not guarantee persistence or secure access | Validate schemas, policies and authenticated CRUD operations |
| Mid September 2026 | Payments | Designed subscription selection and attempted a secure payment flow | Payment initiation must remain server-side and failure messages need detail | Add verified webhook/payment status handling |
| Late September 2026 | CV experience | Replaced the narrow Tech CV idea with a modular My CV workspace | Users need flexible sections and multiple layouts rather than one occupation-specific CV | Complete reliable save/retrieve and layout persistence |
| Late September 2026 | AI provider integration | Implemented AI-backed LinkedIn tools and changed providers during troubleshooting | Provider/model errors, invalid JSON and usage limits must not break the interface | Add response validation, provider abstraction and retry guidance |
| Late September 2026 | LinkedIn tools | Expanded the section into Profile Makeover and Post Generator workflows | Photos should improve context but cannot be mandatory for post generation | Test text-only and image-assisted flows separately |
| Late September 2026 | GitHub portfolio | Added repository discovery and project-selection requirements | Imported repositories become more valuable when users control CV inclusion | Persist selections and link them to CV rendering |
| October 2026 | Membership experience | Defined Free, Starter and Pro access expectations | Scattered gating rules create inconsistent user journeys | Centralise the entitlement matrix and test each plan |
| October 2026 | Brand and usability | Standardised logo visibility, branding guidance and member navigation | Consistency improves trust, but the core workflow must remain the priority | Run responsive, accessibility and navigation checks |
| October 2026 | Assessment portfolio | Consolidated the charter, stories, backlogs and logbook in GitHub | Agile documentation is useful when it remains traceable to product evidence | Maintain statuses and link future commits or issues |

## Reflection

### What worked

- Deploying early exposed real configuration and integration problems.
- User-journey reviews revealed gaps that isolated page reviews missed.
- Reusing a master career profile simplified the product value proposition.
- Visible error messages made AI and payment troubleshooting more actionable.

### What needs improvement

- Backlog status must be updated alongside code changes.
- Database changes require documented schemas and repeatable tests.
- External service limits should be anticipated before demonstrations.
- Core flows should be completed before adding additional tools.

### Action plan

- Finish and test CV persistence end to end.
- Link portfolio selections to saved CV records.
- Centralise plan entitlements and payment verification.
- Add repeatable smoke tests for authentication, saving and AI failures.
- Run a measured student pilot before making outcome claims.

