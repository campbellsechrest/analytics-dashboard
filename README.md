# IM Concierge Analytics Dashboard

This project contains a Vite + React (TypeScript) single-page dashboard that visualizes the layered intent routing analytics for the IM Concierge chatbot. All metrics shown are backed by the specification provided in the product brief and are currently powered by curated sample data that mimics the production analytics API responses.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 to view the dashboard.

## Available scripts

- `npm run dev` – start a local development server with hot module replacement.
- `npm run build` – type-check and bundle the application for production.
- `npm run preview` – preview the production build locally.
- `npm run lint` – run ESLint using the shared TypeScript + React configuration.

## Project structure

```
frontend/
├── public/             # Static assets served by Vite
├── src/
│   ├── data/           # Mock analytics data aligned to the KPI spec
│   ├── App.tsx         # Dashboard layout and visualizations
│   ├── App.css         # Global dashboard styling system
│   └── main.tsx        # React entry point
└── vite.config.ts      # Vite build and dev server configuration
```

## Next steps

- Replace the mock data module with real API integrations for `/api/analytics` endpoints.
- Extend charts with live libraries (e.g., Recharts or ECharts) once the backend schema is finalized.
- Wire the time range selector and filters to the analytics API to support custom reporting windows.
