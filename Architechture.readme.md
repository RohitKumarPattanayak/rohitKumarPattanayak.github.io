High level chat lifecycle : 
User Message
     ↓
Check Mode (normal / recruiter)
     ↓
Embed Query
     ↓
Search Vector DB (resume chunks)
     ↓
Fetch Relevant Context
     ↓
Add Conversation Memory
     ↓
Send to OpenAI
     ↓
Return Streamed Response





Resume injection architecture :  
Raw Resume Text
      ↓
GPT Structured Parser
      ↓
Structured JSON Sections
      ↓
Store in DB (JSONB + embedding)
      ↓
Ready for:
   - Semantic search
   - Section filtering
   - Project UI rendering
