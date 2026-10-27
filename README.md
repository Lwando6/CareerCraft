# CareerCraft SA

CareerCraft is a South Africa-first career platform that helps students and graduates maintain one reusable career profile and turn it into recruiter-ready CVs, portfolios, LinkedIn content and application documents.

## Live links

- **CareerCraft application:** [careercraft-sa.netlify.app](https://careercraft-sa.netlify.app)
- **WIL Agile assessment portfolio:** [lwando6.github.io/CareerCraft/wil-assessment/](https://lwando6.github.io/CareerCraft/wil-assessment/)
- **Assessment evidence folder:** [`wil-assessment/`](wil-assessment/)

## WIL Assessment 2 portfolio

The GitHub portfolio includes the compulsory evidence for the entrepreneurial WIL project:

1. [Agile Project Charter](wil-assessment/docs/agile-project-charter.md)
2. [User Stories and Tasks](wil-assessment/docs/user-stories-and-tasks.md)
3. [Product Backlog](wil-assessment/docs/product-backlog.md)
4. [Sprint Backlog](wil-assessment/docs/sprint-backlog.md)
5. [Agile Logbook](wil-assessment/docs/agile-logbook.md)

The portfolio distinguishes between **Completed**, **In progress**, **Planned** and **Won't yet** work. Repository commits, deployment history and demonstrations provide supporting evidence.

## Core product capabilities

- Account registration, authentication and user profiles
- Modular CV creation and template selection
- Saved CVs and reusable career information
- GitHub project selection for portfolios and CVs
- AI-assisted LinkedIn profile and post tools
- Career prompt and document generation workflows
- Free, Starter and Pro membership journeys
- Personal branding guidance

## Technology

| Layer | Technology |
|---|---|
| Front end | HTML5, Tailwind CSS and JavaScript |
| Authentication and database | Supabase |
| AI services | Serverless functions with configured AI provider |
| Portfolio data | GitHub REST API |
| Production hosting | Netlify |
| Assessment hosting | GitHub Pages |

## Run locally

Clone the repository and serve the project root with a local static server:

```bash
git clone https://github.com/Lwando6/CareerCraft.git
cd CareerCraft
python -m http.server 5500
```

Open `http://localhost:5500` for the application or `http://localhost:5500/wil-assessment/` for the assessment portfolio.

## Configuration and security

- Do not commit API keys or service-role credentials.
- Store secrets in the hosting provider's environment variables.
- Public Supabase browser configuration must use the publishable key and appropriate Row Level Security policies.
- Payment and membership updates must be verified server-side.
- AI outputs require user review and must not invent qualifications or achievements.

## Project structure

```text
CareerCraft/
├── index.html
├── profile.html
├── resumes.html
├── editor.html
├── portfolio.html
├── linkedin.html
├── prompts.html
├── netlify/
│   └── functions/
├── wil-assessment/
│   ├── index.html
│   ├── styles.css
│   └── docs/
└── .github/
    └── workflows/
        └── pages.yml
```

## Evidence and limitations

CareerCraft is an evolving entrepreneurial project. Features should be judged against the current repository and live demonstration. Planned functionality is documented as planned rather than presented as completed.

