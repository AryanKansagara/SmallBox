# SmallBox Documentation Index

**Last Updated:** May 9, 2026

Complete architecture, implementation, and product documentation for the SmallBox project.

---

## 📚 Documentation Structure

### Level 1: Overview & Quick Start

| Document | Purpose | Audience |
|----------|---------|----------|
| [../README.md](../README.md) | **Start here** — Product overview, high-level flow diagrams, quick start guide | Everyone |
| [spec.md](spec.md) | Product specification, features, scope, UN SDG alignment | Product managers, stakeholders |
| [DESIGN.md](DESIGN.md) | Design system, colors, typography, components, spacing | Designers, frontend engineers |

### Level 2: Technical Architecture

| Document | Purpose | Audience |
|----------|---------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Detailed technical architecture, database schema, API contracts, deployment | Backend engineers, DevOps |
| [DATA_FLOW.md](DATA_FLOW.md) | Sequence diagrams, request/response flows, feature pipelines | Full-stack engineers |
| [WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md) | IBM Watsonx.ai setup, prompt engineering, fallback mechanisms | AI/ML engineers, backend |
| [SMTP_EMAIL_CAMPAIGNS_PLAN.md](marketing/SMTP_EMAIL_CAMPAIGNS_PLAN.md) | Email infrastructure, recipient parsing, delivery tracking | Backend engineers |

### Level 3: Feature-Specific

| Document | Purpose | Audience |
|----------|---------|----------|
| [website-builder-prompt.md](website-builder-prompt.md) | Website builder AI prompt (v2 planned) | Prompt engineers |

---

## 🎯 Use Cases: Which Document to Read?

### "I'm new to the project. Where do I start?"
1. Read [../README.md](../README.md) — gives you the big picture
2. Read the **High-Level Flow** section to understand three core pipelines
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) **Section 1-3** for tech stack and system diagram

### "I need to set up development locally"
1. [../README.md](../README.md) — **Getting Started** section
2. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 9: Deployment Architecture**
3. [marketing/WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md) — **Setup instructions**

### "I need to add a new feature"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 2-3: System Architecture & API Contracts**
2. [DATA_FLOW.md](DATA_FLOW.md) — **See similar feature flow diagram**
3. [../README.md](../README.md) — **Technical Implementation section**

### "I'm debugging an API issue"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 7: Error Handling & Fallbacks**
2. [DATA_FLOW.md](DATA_FLOW.md) — **Section 6: Error Handling Decision Tree**
3. Relevant feature document (e.g., [marketing/WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md))

### "I need to deploy to production"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 9: Deployment Architecture**
2. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 8: Security Architecture**
3. [../README.md](../README.md) — **Security & Privacy section**

### "I need to understand the email feature"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 3.3: Email Campaign Send endpoint**
2. [DATA_FLOW.md](DATA_FLOW.md) — **Section 2: Email Campaign Pipeline** (complete sequence diagram)
3. [marketing/SMTP_EMAIL_CAMPAIGNS_PLAN.md](marketing/SMTP_EMAIL_CAMPAIGNS_PLAN.md) — **Technical details**

### "I need to understand content generation"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 3.1: Watsonx Content Generation endpoint**
2. [DATA_FLOW.md](DATA_FLOW.md) — **Section 1: Marketing Content Generation Pipeline**
3. [marketing/WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md) — **Prompt engineering**

### "I need to add finance feature X"
1. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 3.5: Finance Endpoints**
2. [DATA_FLOW.md](DATA_FLOW.md) — **Section 3: Finance Auto-Categorization Pipeline**
3. [ARCHITECTURE.md](ARCHITECTURE.md) — **Section 4: Database Schema**

---

## 🏗️ Architecture Diagrams Summary

### High-Level Flows (Mermaid Flowcharts)

| Flow | Document | Lines | Purpose |
|------|----------|-------|---------|
| **Content Generation** | [DATA_FLOW.md#1](DATA_FLOW.md#1-marketing-content-generation-pipeline) | Sequence | Frontend → API → Watsonx → Response |
| **Email Campaign** | [DATA_FLOW.md#2](DATA_FLOW.md#2-email-campaign-pipeline) | Graph | Full flow: draft → recipients → send → SMTP |
| **Auto-Categorize** | [DATA_FLOW.md#3](DATA_FLOW.md#3-finance-auto-categorization-pipeline) | Graph | User input → Watsonx → category → database |
| **Sentiment Analysis** | [DATA_FLOW.md#4](DATA_FLOW.md#4-customer-review-sentiment-analysis-pipeline) | Sequence | Reviews → NLU → themes + recommendations |
| **Dashboard Aggregation** | [DATA_FLOW.md#5](DATA_FLOW.md#5-dashboard-data-aggregation) | Graph | Database queries → calculation → render |
| **Error Handling** | [DATA_FLOW.md#6](DATA_FLOW.md#6-error-handling--fallback-chains) | Decision Tree | API call → timeout/error → fallback |

### System Architecture (Mermaid Graphs)

| Architecture | Document | Purpose |
|--------------|----------|---------|
| **Frontend ↔ Backend ↔ External** | [../README.md - System Architecture](../README.md#system-architecture) | High-level component diagram |
| **Detailed Layers** | [ARCHITECTURE.md#2](ARCHITECTURE.md#2-system-architecture-diagram-detailed) | Browser → Next.js → Lib → External APIs |

---

## 📋 Database Schema

**Location:** [ARCHITECTURE.md#4](ARCHITECTURE.md#4-database-schema)

**Tables:**
- `users` — User accounts (single-tenant v1, multi-tenant v2)
- `transactions` — Finance entries (income/expense)
- `budgets` — Monthly budget targets per category
- `campaigns` — Email campaign history
- `review_analyses` — Sentiment analysis batches
- `settings` — User preferences

**Key:** Foreign keys enabled, indexes on (user_id, date), (category)

---

## 🔌 API Endpoints

**Location:** [ARCHITECTURE.md#3](ARCHITECTURE.md#3-api-contracts--endpoints)

**Core Endpoints:**
- `POST /api/ibm/watsonx/generate-content` — 3 content variations
- `POST /api/ibm/watsonx/generate-email` — Email draft (subject, body, CTA)
- `POST /api/campaigns/send` — Send via SMTP (Brevo)
- `POST /api/ibm/nlu/analyze` — Sentiment + keyword analysis
- `POST /api/finance/transactions` — CRUD transactions
- `POST /api/finance/categorize` — Auto-categorize single expense
- `GET /api/finance/insights` — Monthly insights + recommendations

**Response Contracts:** See [ARCHITECTURE.md#3](ARCHITECTURE.md#3-api-contracts--endpoints) for full request/response JSON

---

## 🔐 Security & Environment

**Secrets:** [ARCHITECTURE.md#5](ARCHITECTURE.md#5-environment-variables--secrets)
- `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL`
- `IBM_NLU_API_KEY`, `IBM_NLU_URL`, `IBM_NLU_VERSION`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`

**Security Practices:** [../README.md#security--privacy](../README.md#security--privacy)
- Credentials server-side only
- HTTPS required (production)
- CORS configuration
- Rate limiting (future)

---

## 🚀 Tech Stack Quick Reference

**Location:** [../README.md#tech-stack](../README.md#tech-stack)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | 19.2.4 / 5.x |
| Framework | Next.js (App Router) | 16.2.6 |
| Styling | Tailwind CSS | 4.0 |
| Animation | Framer Motion | 12.38.0 |
| AI Generation | Watsonx.ai (Llama 3.3 70B) | Latest |
| Sentiment | Watson NLU | 2021-08-01 |
| Email | Nodemailer + Brevo | 8.0.7 |
| Database | SQLite | Latest |
| Charts | Recharts | 3.8.1 |

---

## 📖 Reading Order (Recommended)

### For New Team Members
1. [../README.md](../README.md) (15 min)
2. [ARCHITECTURE.md#1-3](ARCHITECTURE.md#1-overview) (20 min)
3. [DATA_FLOW.md#1-2](DATA_FLOW.md#1-marketing-content-generation-pipeline) (10 min)

### For Backend Engineers
1. [ARCHITECTURE.md](ARCHITECTURE.md) (30 min)
2. [DATA_FLOW.md](DATA_FLOW.md) (20 min)
3. Feature-specific docs (e.g., [marketing/WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md))

### For Frontend Engineers
1. [../README.md#system-architecture](../README.md#system-architecture)
2. [ARCHITECTURE.md#2](ARCHITECTURE.md#2-system-architecture-diagram-detailed)
3. [DATA_FLOW.md#5](DATA_FLOW.md#5-dashboard-data-aggregation) (dashboard patterns)

### For DevOps / SRE
1. [ARCHITECTURE.md#9](ARCHITECTURE.md#9-deployment-architecture)
2. [ARCHITECTURE.md#8](ARCHITECTURE.md#8-security-architecture)
3. [../README.md#security--privacy](../README.md#security--privacy)

### For Product / Stakeholders
1. [spec.md](spec.md)
2. [../README.md#the-problem](../README.md#the-problem)
3. [../README.md#how-it-works](../README.md#how-it-works)

---

## 🎓 Learning Paths

### "I want to understand the entire product"
```
README (15m)
  ↓
spec.md (15m)
  ↓
ARCHITECTURE System Architecture section (10m)
  ↓
DATA_FLOW all pipelines (20m)
  ↓
Feature-specific docs (30m)

Total: ~90 minutes
```

### "I want to implement the email feature"
```
README API Design section (5m)
  ↓
ARCHITECTURE Email Endpoints (5m)
  ↓
DATA_FLOW Email Campaign Pipeline (10m)
  ↓
SMTP_EMAIL_CAMPAIGNS_PLAN (20m)
  ↓
Code review (30m)

Total: ~70 minutes
```

### "I want to add content generation to a new platform"
```
ARCHITECTURE API Contracts (5m)
  ↓
DATA_FLOW Marketing Pipeline (10m)
  ↓
WATSONX_INTEGRATION Prompt Engineering (15m)
  ↓
Code implementation (30m)

Total: ~60 minutes
```

---

## 📝 Document Maintenance

### When to Update

- **README.md**: Major feature add/change, UX redesign, tech stack upgrade
- **ARCHITECTURE.md**: API contract change, database schema change, deployment process change
- **DATA_FLOW.md**: Feature pipeline change, error handling improvement
- **spec.md**: Product scope/feature change
- **DESIGN.md**: Brand/design system change
- **Feature docs** (marketing/): Detailed implementation changes

### Version History

| Date | Document | Change |
|------|----------|--------|
| 2026-05-09 | All | Initial documentation suite created |

---

## 🔗 Cross-References

### By Feature

**Marketing Content Generation:**
- High-level: [README.md#marketing-content-pipeline](../README.md#marketing-content-pipeline)
- API contract: [ARCHITECTURE.md#3.1](ARCHITECTURE.md#3-api-contracts--endpoints)
- Sequence diagram: [DATA_FLOW.md#1](DATA_FLOW.md#1-marketing-content-generation-pipeline)
- Implementation: [marketing/WATSONX_INTEGRATION.md](marketing/WATSONX_INTEGRATION.md)

**Email Campaigns:**
- High-level: [README.md#email-campaign-flow](../README.md#marketing-content-pipeline)
- API contract: [ARCHITECTURE.md#3.3](ARCHITECTURE.md#3-api-contracts--endpoints)
- Sequence diagram: [DATA_FLOW.md#2](DATA_FLOW.md#2-email-campaign-pipeline)
- Implementation: [marketing/SMTP_EMAIL_CAMPAIGNS_PLAN.md](marketing/SMTP_EMAIL_CAMPAIGNS_PLAN.md)

**Finance:**
- High-level: [README.md#finance-intelligence-pipeline](../README.md#finance-intelligence-pipeline)
- API contract: [ARCHITECTURE.md#3.5](ARCHITECTURE.md#3-api-contracts--endpoints)
- Auto-categorize: [DATA_FLOW.md#3](DATA_FLOW.md#3-finance-auto-categorization-pipeline)
- Database: [ARCHITECTURE.md#4](ARCHITECTURE.md#4-database-schema)

**Sentiment Analysis:**
- High-level: [README.md#customer-intelligence-pipeline](../README.md#customer-intelligence-pipeline)
- API contract: [ARCHITECTURE.md#3.4](ARCHITECTURE.md#3-api-contracts--endpoints)
- Sequence: [DATA_FLOW.md#4](DATA_FLOW.md#4-customer-review-sentiment-analysis-pipeline)

---

## ❓ FAQ

**Q: Where's the code?**
A: Documentation lives in `/docs/`; implementation code is in `/smallbox/src/`

**Q: How do I run the project locally?**
A: See [../README.md#local-development](../README.md#local-development)

**Q: Where are the secrets?**
A: Never commit `.env.local`; see [ARCHITECTURE.md#5](ARCHITECTURE.md#5-environment-variables--secrets)

**Q: How do I deploy?**
A: See [ARCHITECTURE.md#9](ARCHITECTURE.md#9-deployment-architecture)

**Q: How do I debug an API error?**
A: See [ARCHITECTURE.md#7](ARCHITECTURE.md#7-error-handling--fallbacks) or [DATA_FLOW.md#6](DATA_FLOW.md#6-error-handling--fallback-chains)

**Q: What's the database?**
A: SQLite; schema in [ARCHITECTURE.md#4](ARCHITECTURE.md#4-database-schema)

**Q: Is there a mobile app?**
A: Not in v1 (planned for v2+)

**Q: Can I self-host?**
A: Yes; see [ARCHITECTURE.md#9](ARCHITECTURE.md#9-deployment-architecture) for options

---

## 📞 Support

- **Issues**: GitHub issues with detailed reproduction steps
- **Security**: security@smallbox.app (not public issues)
- **Contributing**: Submit PRs with TypeScript + documentation
- **Community**: Discord (link in repo)

---

**Built with ❤️ by SmallBox team**
Powered by IBM Cloud technologies

Last updated: May 9, 2026
