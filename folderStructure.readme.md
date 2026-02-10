ai-portfolio/
├── apps/
│   ├── web/                    # React app (main interview focus)
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── features/       # Feature-based components (chat, profile)
│   │   │   ├── hooks/          # App-level custom hooks
│   │   │   ├── pages/          # Page-level components
│   │   │   ├── services/       # API calls, data fetching
│   │   │   ├── styles/         # Global styles
│   │   │   ├── utils/          # Helper functions
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│
│   └── api/                    # Backend (AWS Lambda - Node.js)
│       ├── src/
│       │   ├── handlers/       # Lambda handlers (entry points)
│       │   ├── routes/         # API route definitions
│       │   ├── services/       # Business logic
│       │   ├── repositories/   # DB access (DynamoDB later)
│       │   ├── models/         # Data models / schemas
│       │   ├── utils/          # Helpers (logger, response)
│       │   └── index.ts
│       ├── serverless.yml      # AWS Serverless config
│       └── package.json
│
├── packages/
│   ├── ui/                     # Shared UI components (later)
│   ├── hooks/                  # Shared React hooks (later)
│   └── shared/                 # Types, constants, utilities
│
├── infra/
│   ├── serverless/             # AWS configs (expanded later)
│   ├── docker/                 # Dockerfiles + compose
│   └── k8s/                    # Kubernetes manifests (optional)
│
├── .github/
│   └── workflows/
│       ├── web-ci.yml
│       ├── api-ci.yml
│       └── infra-check.yml
│
├── docs/
│   ├── architecture.md
│   ├── react-notes.md
│   ├── docker-k8s.md
│   ├── github-actions.md
│   └── ai-design.md
│
├── package.json                # Root (workspaces)
└── README.md
