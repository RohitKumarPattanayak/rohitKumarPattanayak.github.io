# AI Portfolio

## 📖 Overview
An AI-powered professional portfolio and interactive resume. The system is generation-driven—by simply injecting a raw resume (parsed via PyPDF/Python-Docx and GPT for structured data extraction), it automatically generates a fully functional, UI-integrated portfolio and an interactive bot representing my professional background. The application features a conversational interface that enables users and recruiters to query my experience, projects, and skills dynamically. Underlying this is a Retrieval-Augmented Generation (RAG) pipeline that fetches relevant context from the parsed resume and streams intelligent, context-aware responses.

## 🛠️ Technologies & Stack Used

**Frontend**
- **Framework:** React (TypeScript) managed via Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand, TanStack React Query
- **Routing:** React Router DOM
- **Data Visualization:** Recharts

**Backend**
- **Server:** Python, FastAPI, Uvicorn
- **Database ORM:** SQLAlchemy, Alembic
- **AI & Processing:** OpenAI API, PyPDF, Python-Docx

**Database & Infrastructure**
- **Database:** PostgreSQL
- **Vector Search:** `pgvector` extension for embeddings
- **Containerization:** Docker & Docker Compose (Master-Replica configuration)

## 🚀 Optimizations Implemented

- **Database Performance:** Configured PostgreSQL Read Replicas via Docker Compose to manage read-heavy analytics and reduce primary database load.
- **Fast Similarity Search:** Applied Hierarchical Navigable Small World (HNSW) indexing on resume chunks to execute blazing-fast semantic vector searches without full-table scans.
- **Frontend Code Splitting:** Implemented robust route-based and heavy-component code splitting to minimize initial bundle sizes and fast-track application loading.
- **React Rendering Checks:** Addressed unnecessary component re-renders and eliminated UI flickering by strictly applying constraints across Context layers using `React.memo`, `useCallback`, and `useMemo`.
- **Latency Optimizations:** Fine-tuned internal structured data pipelines to prevent SQL persistency crashes and seamlessly process unstructured chat messages.
