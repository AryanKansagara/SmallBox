# SmallBox — Product Specification
**Version:** 1.0 (v1)
**Last Updated:** 2026-05-08

---

## 1. Overview

**SmallBox** is a self-serve web application that gives small business owners access to enterprise-grade tools — powered by IBM technologies — without requiring technical expertise or dedicated IT staff. Where large corporations can afford specialists to navigate IBM's ecosystem, SmallBox abstracts that complexity into a clean, intuitive dashboard any business owner can use.

### Problem Statement
IBM technologies offer powerful capabilities (AI, analytics, databases, CI/CD), but their interfaces and setup processes are designed for enterprise technical teams. Small businesses are locked out not because the tools aren't useful, but because they're too complex to adopt independently.

### Solution
A unified web dashboard where a small business owner can: build their website with AI, manage their finances, and run their marketing — all backed by IBM's free-tier services under the hood.

---

## 2. UN Sustainable Development Goals Alignment

| SDG | How SmallBox Addresses It |
|-----|--------------------------|
| **SDG 8** — Decent Work & Economic Growth | Empowers small business owners to compete with larger businesses by giving them access to the same quality of digital tools |
| **SDG 9** — Industry, Innovation & Infrastructure | Democratizes access to IBM-grade infrastructure (cloud, AI, CI/CD) for businesses that couldn't otherwise afford it |
| **SDG 10** — Reduced Inequalities | Closes the technology gap between large corporations (with dedicated IBM specialists) and small business owners globally |

---

## 3. Target Audience

- **Who:** Small business owners globally (retail, food, services, e-commerce, etc.)
- **Technical level:** Non-technical; no coding or cloud knowledge required
- **Use case examples:** A local bakery in Mississauga wanting a website; a freelance consultant tracking monthly expenses; a clothing shop wanting to post AI-generated Instagram captions

---

## 4. App Structure

**Delivery:** Web application (browser-based)
**Layout:** Single dashboard with persistent sidebar navigation

### Sidebar Navigation
- 🏠 Home / Overview
- 🌐 Website Builder
- 💰 Finance & Budgeting
- 📣 Marketing
- *(v2)* 📦 Inventory Management
- *(v2)* 🧾 Expense Receipt Scanner
- *(v2)* 🔲 QR Code Generator
- ⚙️ Settings / Account

### Authentication
- IBM Verify handles login, SSO, MFA, and session management
- Users log in once and access all tools under their account

---

## 5. IBM Technologies Stack

Each tool operates independently in v1, powered by the IBM free-tier services below. A unified watsonx.ai orchestration layer is planned for v2.

| Layer | IBM Service | Free Tier | Purpose |
|-------|------------|-----------|---------|
| **AI Assistant** | watsonx.ai | Trial | Powers website generation, marketing copy, and AI Q&A per tool |
| **Database** | IBM Cloudant | 1 GB forever-free | Stores user profiles, business info, website configs, finance records |
| **Finance Analytics** | IBM Cloud SQL Query | 30 GB/day scan | Queries transaction data stored in Cloud Object Storage |
| **Auth** | IBM Verify | 90-day trial | SSO, MFA, user lifecycle management |
| **CI/CD / Deploy** | IBM Cloud Continuous Delivery | 500 jobs/month | Deploys generated websites to IBM Cloud |
| **Monitoring** | IBM Instana | 14-day trial + sandbox | App performance monitoring, error alerts, uptime notifications |
| **Sentiment Analysis** | Watson NLU | 1 custom model free | Analyzes customer reviews, extracts sentiment and keywords |
| **Voice / Accessibility** | Watson TTS + STT | 10k chars + 500 min/month | Voice-enables chatbot and accessibility features on generated sites |

---

## 6. V1 Features

### 6.1 Website Builder

**Goal:** Generate a professional website for any small business from a guided questionnaire, with the ability to edit the result.

**User Flow:**
1. User clicks "Create Website" from the dashboard
2. SmallBox walks them through an onboarding questionnaire:
   - Business name & industry
   - Business description (what you do, who you serve)
   - Key services or products (list up to 5)
   - Tone preference (professional / friendly / bold)
   - Color preferences or brand colors (hex or picker)
   - Do you want a contact form? Booking form?
   - Do you have a logo? (upload optional)
3. watsonx.ai generates website copy (headlines, about section, service descriptions, CTA text) based on questionnaire answers
4. A pre-built site template is populated with the generated content
5. User previews the site and can edit any text section inline
6. User publishes — IBM Cloud Continuous Delivery handles the build and deploy pipeline
7. Site is live on a SmallBox subdomain (e.g. `mybakery.smallbox.app`); custom domain connection in v2

**IBM Services Used:**
- `watsonx.ai` — generates all website copy from questionnaire input
- `IBM Cloudant` — stores website config, content, and publish state
- `IBM Cloud Continuous Delivery` — CI/CD pipeline to build and deploy the site
- `Watson TTS` — optional voice accessibility layer on deployed site

**Out of scope for v1:** Drag-and-drop editor, e-commerce/payment integration, custom domains

---

### 6.2 Finance & Budgeting

**Goal:** Give small business owners a simple way to track income, expenses, and budgets — either by manual entry or by uploading receipts/statements.

**User Flow:**

*Manual Entry:*
1. User navigates to Finance tab
2. Adds income or expense entries (amount, category, date, note)
3. Dashboard shows: monthly summary, category breakdown (pie chart), income vs. expense trend (line chart)

*Upload & Scan:*
1. User uploads a receipt image or bank statement CSV/PDF
2. Watson STT or OCR extracts line items and amounts
3. Items are auto-categorized (food, rent, utilities, supplies, etc.) using watsonx.ai
4. User reviews, confirms, or edits categorizations before saving

*Budgeting:*
1. User sets monthly budget targets per category
2. Dashboard shows progress bars and alerts when nearing/exceeding budget
3. End-of-month summary report auto-generated

**IBM Services Used:**
- `IBM Cloudant` — stores all transaction records per user
- `IBM Cloud SQL Query` — runs analytics queries on transaction history
- `watsonx.ai` — categorizes uploaded receipts and suggests budget insights
- `Watson STT` — extracts text from audio/voice notes (optional)
- `Instana` — monitors app health and API error rates

**Out of scope for v1:** Bank API integrations (Plaid), tax filing, multi-currency

---

### 6.3 Marketing

**Goal:** Help small business owners generate marketing content, send email campaigns, and understand how customers feel about their business.

**Sub-features:**

#### A. AI Content Generator
1. User selects content type: Instagram caption, Facebook post, Google ad copy, or promotional email
2. User inputs context: product/service to promote, tone, any key details
3. watsonx.ai generates 3 variations
4. User picks one, edits if needed, copies or schedules

#### B. Email Campaign Builder
1. User creates an email list (manual CSV upload or manual entry in v1)
2. Chooses a template (promotional, newsletter, announcement)
3. AI fills in suggested content based on business profile
4. User reviews and sends (SMTP integration or IBM-managed send)

#### C. Review Analyzer
1. User pastes in customer reviews (Google, Yelp, manual)
2. Watson NLU processes reviews: extracts overall sentiment, top positive themes, top complaints
3. Dashboard displays: sentiment score, keyword cloud, trend over time (if multiple batches submitted)
4. AI suggests 1–2 actionable improvements based on negative themes

**IBM Services Used:**
- `watsonx.ai` — content generation and improvement suggestions
- `Watson NLU` — sentiment extraction from customer reviews
- `IBM Cloudant` — stores campaigns, review history, content drafts
- `Instana` — monitors email delivery success rates and errors

**Out of scope for v1:** Native social media posting (API integrations), paid ad management, A/B testing

---

## 7. V2 Roadmap

| Feature | Description |
|---------|-------------|
| **Unified AI Assistant** | watsonx.ai becomes a central chat layer — "Generate my weekly social posts" or "Show me this month's expenses" |
| **Inventory Management** | Track stock levels, set low-stock alerts, log purchases |
| **Expense Receipt Scanner** | Mobile camera scan → auto-extract and log expense |
| **QR Code Generator** | Generate QR codes linking to website, menu, or payment page |
| **Custom Domains** | Connect your own domain to the generated website |
| **Blueworks Live Integration** | Let business owners map and improve their internal workflows |
| **IBM RPA (Premium)** | Automate repetitive tasks (invoice sending, nightly reports) for businesses with budget |

---

## 8. Technical Architecture (High Level)

```
[Browser Dashboard]
        |
   [SmallBox API Layer — Next.js / Node.js]
        |
   ┌────┴──────────────────────────────────┐
   │                                        │
[IBM Cloudant]    [watsonx.ai]    [Watson NLU / TTS / STT]
[IBM Verify]      [Cloud SQL]     [Continuous Delivery]
[Instana]
```

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js API routes (Next.js serverless functions)
- **Hosting:** IBM Cloud or Vercel
- **Auth:** IBM Verify (OAuth/SSO)
- **Database:** IBM Cloudant (NoSQL, JSON documents per user)
- **AI:** watsonx.ai API calls from backend (API key secured server-side)

---

## 9. Out of Scope (All Versions)

- Payment processing / e-commerce checkout
- Accounting software integrations (QuickBooks, Xero)
- Native mobile apps (web-responsive only in v1/v2)
- White-labeling for agencies

---

## 10. Open Questions

- [ ] What is the business model? (Free tier + paid upgrade, or fully free?)
- [ ] Who hosts the generated websites long-term once IBM free trial expires?
- [ ] Do users need their own IBM accounts, or does SmallBox hold one master IBM account?
- [ ] What happens to user data when IBM free trial limits are hit?

