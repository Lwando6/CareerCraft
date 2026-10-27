# Agile Project Charter

## Project identification

| Field | Detail |
|---|---|
| Project | CareerCraft |
| Project type | Entrepreneurial WIL digital platform |
| Delivery approach | Agile, iterative and user-centred |
| Product owner | CareerCraft project owner |
| Primary market | South African students and recent graduates |
| Secondary customers | Universities, TVET colleges, career centres and youth employment programmes |

## Vision

CareerCraft will provide a guided career workspace where a user maintains one credible professional profile and uses it to produce consistent CVs, portfolios, LinkedIn content and application documents.

## Problem statement

Students and recent graduates often store career information across disconnected CV files, LinkedIn, GitHub and general-purpose AI tools. Repeating the same information wastes time, weak presentation can hide credible experience, and generic tools do not always reflect South African internships, learnerships and Work Integrated Learning requirements.

## Project objective

Develop and validate a responsive career platform that enables users to:

- Create and maintain a reusable career profile.
- Build, edit and save modular CVs.
- Select relevant CV layouts.
- Add selected GitHub projects to a portfolio and CV.
- Generate career documents and improve LinkedIn content with AI assistance.
- Access functionality according to the user's membership plan.

## Minimum viable product scope

### Included

- Responsive public landing pages and member navigation.
- User registration, login and profile management.
- Modular CV editor with save and retrieval.
- Resume template selection, including free layouts.
- GitHub portfolio connection and project selection.
- AI-assisted LinkedIn and document tools.
- Free, Starter and Pro membership presentation.
- Supabase authentication and data persistence.
- Netlify deployment and serverless functions.

### Excluded from the initial MVP

- Native Android or iOS applications.
- Guaranteed job placement.
- Automated submission of job applications.
- Full recruiter marketplace.
- Institution analytics not validated through a pilot.

## Key stakeholders

| Stakeholder | Need or responsibility |
|---|---|
| Students and graduates | Create credible, consistent career assets efficiently |
| CareerCraft product owner | Prioritise the backlog and approve increments |
| Universities and career centres | Support career readiness across student cohorts |
| Recruiters and employers | Receive clear, relevant and verifiable candidate information |
| Technology providers | Provide hosting, authentication, database, AI and repository services |

## Success criteria

- A user can register and sign in securely.
- A logged-in user can create, edit, save and retrieve a CV.
- A user can select a template permitted by the active plan.
- Selected GitHub projects can appear in the user's portfolio and CV.
- AI tools return editable outputs and handle errors clearly.
- The main user journey works on mobile and desktop.
- No secret API keys are committed to the public repository.
- The project and assessment portfolio are available through public links.

## Constraints and assumptions

- The project is developed with limited student-founder time and budget.
- External services can change quotas, pricing or availability.
- AI output must remain reviewable because generated content may contain errors.
- Payment and membership changes require secure server-side verification.
- Personal data must be handled with privacy and POPIA readiness in mind.

## Major risks and responses

| Risk | Impact | Response |
|---|---|---|
| AI service failure or quota limit | Tools become unavailable | Use server-side error handling, clear messages and provider abstraction |
| Incorrect or fabricated AI output | Damages user credibility | Require user review and prohibit invented achievements |
| CV data fails to save | Loss of user trust | Map the schema carefully, surface errors and test create/read/update flows |
| Secrets exposed in the repository | Security and build failure | Store keys in environment variables and enable secret scanning |
| Subscription access is inconsistent | Revenue and UX problems | Centralise plan rules and verify entitlements server-side |
| Scope growth delays delivery | Incomplete core product | Prioritise MVP stories and defer low-value features |

## Definition of done

A backlog item is done when its acceptance criteria pass, the interface works at mobile and desktop widths, errors are visible to the user, no secrets are introduced, and the change is committed with supporting documentation where required.

