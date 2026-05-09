# SmallBox

SmallBox is a Next.js dashboard prototype for small businesses built around IBM-powered website generation, finance tooling, and marketing workflows.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill in your IBM Watson NLU credentials:

```bash
cp .env.example .env.local
```

Required variables:

- `IBM_NLU_API_KEY`
- `IBM_NLU_URL`
- `IBM_NLU_VERSION` optional, defaults to `2022-08-10`

3. Start the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000), then go to `Dashboard -> Marketing -> Review Analyzer`.

## Watson NLU Integration

The first live IBM integration is the Review Analyzer:

- UI: `src/app/dashboard/marketing/page.tsx`
- API route: `src/app/api/ibm/nlu/analyze/route.ts`
- Shared types/helpers: `src/lib/ibm-nlu.ts`

The browser sends pasted review text to the local API route, and the server calls IBM Watson Natural Language Understanding with:

- `sentiment`
- `keywords`
- `categories`

Credentials stay server-side only.
