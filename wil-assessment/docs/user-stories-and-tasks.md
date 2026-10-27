# User Stories and Tasks

## Epic 1: Account and career profile

### US-01 - Create an account

**As a** student or graduate, **I want** to create an account, **so that** my career information and documents can be saved securely.

**Acceptance criteria**

- The user can register with valid required details.
- Validation errors are understandable.
- A successful registration creates an authenticated session or directs the user to log in.

**Tasks**

- Build signup and login forms.
- Connect Supabase authentication.
- Add form validation and error states.
- Test successful, invalid and duplicate-registration paths.

### US-02 - Maintain a master career profile

**As a** logged-in user, **I want** to maintain my core career details once, **so that** I can reuse them across CareerCraft tools.

**Acceptance criteria**

- The user can create and update profile details.
- Saved details return after a new session.
- Private profile actions require authentication.

**Tasks**

- Define the profile data model.
- Build editable profile sections.
- Implement save and retrieve operations.
- Add authentication guards and save feedback.

## Epic 2: CV creation and templates

### US-03 - Create and save a modular CV

**As a** job seeker, **I want** to edit individual CV sections and save my work, **so that** I can build a complete CV over time.

**Acceptance criteria**

- The user can add, edit, reorder and remove supported sections.
- Save commits the CV to the authenticated user's database record.
- A saved CV can be retrieved and edited later.

**Tasks**

- Map the CV editor to the database schema.
- Implement create, read and update operations.
- Show save progress, success and failure states.
- Test new and existing CV flows.

### US-04 - Select a resume layout

**As a** user, **I want** to preview and select a suitable layout, **so that** my CV matches my role and experience.

**Acceptance criteria**

- At least two layouts are available on the Free plan.
- Locked layouts explain the required membership.
- The selected layout is saved with the CV.

**Tasks**

- Create layout previews and plan labels.
- Centralise template entitlement rules.
- Persist the selected template identifier.
- Test free and paid access paths.

## Epic 3: Portfolio integration

### US-05 - Import GitHub projects

**As a** technical candidate, **I want** to select projects from GitHub, **so that** I can present real evidence of my work.

**Acceptance criteria**

- The user can provide or connect a GitHub username.
- Repositories are displayed with useful project information.
- The user can select projects for the portfolio.

**Tasks**

- Fetch public repository data from the GitHub API.
- Add empty, loading and error states.
- Build project-selection controls.
- Save selected repository identifiers.

### US-06 - Add selected projects to a CV

**As a** user, **I want** selected portfolio projects to appear in my CV, **so that** recruiters can see relevant evidence.

**Acceptance criteria**

- Selected projects appear in the CV preview.
- The user controls which projects are included.
- Project changes remain after saving and reopening the CV.

**Tasks**

- Link saved project selections to CV data.
- Render project title, description, technologies and link.
- Add include/remove controls.
- Test persistence and layout behaviour.

## Epic 4: AI career tools

### US-07 - Improve a LinkedIn profile

**As a** job seeker, **I want** an AI-assisted profile audit, **so that** I can improve recruiter visibility without inventing experience.

**Acceptance criteria**

- The user can provide profile text or supported screenshots.
- The response includes editable recommendations.
- Errors and quota limits are communicated clearly.
- The user must review outputs before use.

**Tasks**

- Build text and image input controls with consent.
- Create the serverless AI request.
- Validate and render structured results.
- Add copy, retry and accessible status controls.

### US-08 - Generate a LinkedIn post without photos

**As a** professional, **I want** to generate a post from written details with optional photos, **so that** I can share meaningful career updates.

**Acceptance criteria**

- Photos are optional.
- Required text fields guide the user.
- The tool returns editable variations.

**Tasks**

- Separate required text inputs from optional media.
- Build prompt and response schemas.
- Add edit, copy, regenerate and save-history controls.

### US-09 - Generate a career document

**As a** user, **I want** to select a document type and generate a draft from my details, **so that** I can prepare applications faster.

**Acceptance criteria**

- The user can select CV, cover letter or another supported document.
- The generated document uses only supplied or saved facts.
- The result can be edited before export.

**Tasks**

- Add document-type and context inputs.
- Reuse the master profile where authorised.
- Generate structured editable content.
- Add save and export preparation.

## Epic 5: Membership and payment

### US-10 - Understand and select a plan

**As a** user, **I want** to compare Free, Starter and Pro, **so that** I can choose the right level of support.

**Acceptance criteria**

- Pricing and included tools are clear.
- Restricted tools show a meaningful upgrade path.
- A plan selection starts a secure payment flow where required.

**Tasks**

- Define the entitlement matrix.
- Update pricing and workspace messaging.
- Implement server-side payment initialisation and verification.
- Update subscription status only after verified payment.

