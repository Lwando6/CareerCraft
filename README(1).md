# CareerCraft SA 🚀

CareerCraft is a modern, responsive web application built to help South African graduates and technical professionals create ATS-compliant resumes, dynamic online portfolios, and high-impact LinkedIn profiles.

---

## 🌐 Page Structure & Key Features

* **Homepage (`index.html`)**: Clean landing page highlighting core offerings, corporate trust badges, and primary navigation.
* **Resume Templates (`resumes.html`)**: Industry-specific CV layouts tailored for Finance, Engineering, Healthcare, Trades, Design, and HR.
* **My CV (`editor.html`)**: Modular CV workspace with live editing, theme controls, optional sections, custom content, secure saves, and PDF export.
* **Live GitHub Portfolio (`portfolio.html`)**: Dynamic project grid powered by the GitHub REST API to fetch and display live repositories automatically.
* **CV Builder (`editor.html`)**: Live editing, secure Supabase saves, and print-ready PDF export.
* **Pricing & Plans (`pricing.html`)**: Free, Starter (**R49/month**), and Pro (**R99/month**) plans with Paystack checkout.
* **AI Prompt Builder (`prompts.html`)**: Generates tailored CV, cover-letter, LinkedIn, and interview prompts with one-click copying.
* **LinkedIn Transformations (`linkedin.html`)**: Practical before-and-after examples of optimized recruiter headlines.
* **Personal Branding (`branding.html`)**: Executive bio writing, digital identity design, and career strategy services.
* **Mission & Vision (`mission.html`)**: Purpose-driven company mission and vision focused on uplifting South African talent.

---

## 🛠️ Tech Stack

* **Markup:** HTML5
* **Styling:** Tailwind CSS (via CDN)
* **Typography:** Inter (Google Fonts)
* **Icons:** FontAwesome 6
* **Authentication & data:** Supabase Auth, Postgres, and row-level security
* **Payments:** Paystack subscriptions through secure Netlify Functions
* **API Integration:** JavaScript Fetch API with GitHub REST API

---

## 🚀 Getting Started

1. Clone or download the repository to your local environment.
2. Ensure all HTML files reside together in the same root directory.
3. Open `index.html` in any web browser, or run via VS Code **Live Server** for the best development experience.

## ▶️ Run Locally (recommended)

For pages that do not call server functions, start a static server from the project root and open the site at http://localhost:5500.

Run with Python (works on Windows/macOS/Linux):

```bash
python -m http.server 5500
```

In VS Code you can instead:

- Run the `serve-static-site` task (Terminal → Run Task → `serve-static-site`).
- Start the `Open CareerCraft in Browser` launch configuration (Run and Debug → `Open CareerCraft in Browser`).

Stop the server with Ctrl+C in the terminal.

For checkout testing, install the Netlify CLI and use `netlify dev`. Configure these environment variables in Netlify (never commit them):

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_STARTER_PLAN_CODE`
- `PAYSTACK_PRO_PLAN_CODE`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Set the Paystack webhook URL to `https://YOUR-DOMAIN/.netlify/functions/paystack-webhook`. Use Paystack test keys and test plan codes until the complete checkout, callback, renewal, failure, and cancellation journeys have passed.
