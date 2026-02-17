RohitKumarPattanayak.github.io

This is my personal professional portfolio.


Local :

ssh-add -D
ssh-add C:\Users\acer\.ssh\rohitsshwin
ssh-add -l
ssh -T git@github.com


Run the App :

1) Go inside /apps/api

python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

2) Start the application

python -m app.main


Index Addition :

As only one resume can be active at a time.

docker exec -it ai_portfolio_postgres psql -U rohit -d ai_portfolio

Inside psql:

CREATE UNIQUE INDEX idx_one_active_resume
ON resumes ((1))
WHERE is_active = true;


pgVector Activation :

docker exec -it ai_portfolio_postgres psql -U rohit -d ai_portfolio

Inside psql:

CREATE EXTENSION IF NOT EXISTS vector;
\dx   (verify)
