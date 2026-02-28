# RohitKumarPattanayak.github.io
This is my personal professional portfolio

1) Local : 
ssh-add -D
ssh-add C:\Users\acer\.ssh\rohitsshwin
ssh-add -l
ssh -T git@github.com



2) run the app : 
GO inside /apps/api
- python -m venv venv
- venv\Scripts\activate
- pip install -r requirements.txt

python -m app.main



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






