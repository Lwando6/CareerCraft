# CareerCraft SA 🚀

CareerCraft is a modern, responsive web application built to help South African graduates and technical professionals create ATS-compliant resumes, dynamic online portfolios, and high-impact LinkedIn profiles.

---

## 🌐 Page Structure & Key Features

* **Homepage (`index.html`)**: Clean landing page highlighting core offerings, corporate trust badges, and primary navigation.
* **Resume Templates (`resumes.html`)**: Industry-specific CV layouts tailored for Finance, Engineering, Healthcare, Trades, Design, and HR.
* **Tech CV (`tech-resume.html`)**: Specialized, high-density technical resume template designed for IT, networking, and security specialists.
* **Live GitHub Portfolio (`portfolio.html`)**: Dynamic project grid powered by the GitHub REST API to fetch and display live repositories automatically.
* **Pricing & Plans (`pricing.html`)**: Straightforward ZAR pricing tiers with no hidden fees (**R49.00 Starter Pack** and **R100.00 Pro Career Suite**).
* **AI Prompt Library (`prompts.html`)**: Direct copy-and-paste prompt templates for ATS keyword optimization and targeted cover letters.
* **LinkedIn Transformations (`linkedin.html`)**: Practical before-and-after examples of optimized recruiter headlines.
* **Personal Branding (`branding.html`)**: Executive bio writing, digital identity design, and career strategy services.
* **Mission & Vision (`mission.html`)**: Purpose-driven company mission and vision focused on uplifting South African talent.

---

## 🛠️ Tech Stack

* **Markup:** HTML5
* **Styling:** Tailwind CSS (via CDN)
* **Typography:** Inter (Google Fonts)
* **Icons:** FontAwesome 6
* **API Integration:** JavaScript Fetch API with GitHub REST API

---

## 🚀 Getting Started

1. Clone or download the repository to your local environment.
2. Ensure all HTML files reside together in the same root directory.
3. Open `index.html` in any web browser, or run via VS Code **Live Server** for the best development experience.

## ▶️ Run Locally (recommended)

The project is a static multi-page site. Start a local static server from the project root and open the site at http://localhost:5500.

Run with Python (works on Windows/macOS/Linux):

```bash
python -m http.server 5500
```

In VS Code you can instead:

- Run the `serve-static-site` task (Terminal → Run Task → `serve-static-site`).
- Start the `Open CareerCraft in Browser` launch configuration (Run and Debug → `Open CareerCraft in Browser`).

Stop the server with Ctrl+C in the terminal.

