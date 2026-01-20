# Mental Wellbeing

AI-powered mental wellbeing app with a Next.js frontend and FastAPI backend.

## Structure
- /frontend: Next.js web application
- /backend: FastAPI service (SambaNova LLM)

## Local Development

### Backend
1. cd backend
2. Create .env.local (see .env.example)
3. pip install -r requirements.txt
4. uvicorn app.main:app --reload

### Frontend
1. cd frontend
2. npm install
3. npm run dev

## Deployment

### Frontend (Vercel)
1. Push the repository to GitHub.
2. In Vercel, import the repository.
3. Set the **Root Directory** to frontend.
4. Add NEXT_PUBLIC_API_BASE to Environment Variables pointing to your production backend.

### Backend
Deploy the FastAPI app to a service like Render, Railway, or Fly.io.

---

## Important Note
This website is for informational and wellness purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing a mental health crisis, please seek professional help immediately.
