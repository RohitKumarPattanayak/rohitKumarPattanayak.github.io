# RohitKumarPattanayak.github.io
This is my personal professional portfolio

1) Local : 
ssh-add -D
ssh-add C:\Users\acer\.ssh\rohitsshwin
ssh-add -l
ssh -T git@github.com



2) run the app (Backend) : 
GO inside /apps/api
- python -m venv venv
- venv\Scripts\activate
- pip install -r requirements.txt
in /infra
- docker compose up -d
- python -m app.main



3) Index addition : 
So as only one resume can be active at a time.
docker exec -it ai_portfolio_postgres psql -U rohit -d ai_portfolio

   1) CREATE UNIQUE INDEX idx_one_active_resume
      ON resumes ((1))
      WHERE is_active = true;

   2) CREATE UNIQUE INDEX users_username_lower_idx
      ON users (LOWER(username));

   3) CREATE INDEX resume_chunks_embedding_idx
      ON resume_chunks
      USING hnsw (embedding vector_cosine_ops);

   4) CREATE INDEX IF NOT EXISTS resume_chunks_resume_id_idx
      ON resume_chunks (resume_id);

4) pgVector Activation : 
docker exec -it ai_portfolio_postgres psql -U rohit -d ai_portfolio
psql
CREATE EXTENSION IF NOT EXISTS vector;
\dx --> verify


What Is HNSW Index?
   HNSW = Hierarchical Navigable Small World
   It is a graph-based Approximate Nearest Neighbor (ANN) algorithm used for fast vector similarity search.
   In simple terms:
   It allows you to find the most similar vectors very fast, without scanning every row in the table.


5) run the app frontend : 
- npm create vite@latest web -- --template react-ts
- npm install @tanstack/react-query zustand react-router-dom recharts axios @tanstack/react-query-devtools
- npm install -D tailwindcss postcss autoprefixer
- npx tailwindcss init -p


6) Lambda Deployment :
 <!-- Windows Git Bash Quirk (Just a heads up)
Since you are on Windows, if you run this in Git Bash, sometimes Git Bash attempts to translate Windows paths in Docker commands and breaks the -v "$PWD" mount. If you see an error like invalid volume specification: 'C:/Program Files/Git/var/task', run your script by prepending MSYS_NO_PATHCONV=1: -->
- MSYS_NO_PATHCONV=1 ./build_lambda.sh
