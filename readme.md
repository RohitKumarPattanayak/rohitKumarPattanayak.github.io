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
CREATE UNIQUE INDEX idx_one_active_resume
ON resumes ((1))
WHERE is_active = true;



4) pgVector Activation : 
docker exec -it ai_portfolio_postgres psql -U rohit -d ai_portfolio
psql
CREATE EXTENSION IF NOT EXISTS vector;
\dx --> verify






