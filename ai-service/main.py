import json
import os
import io
import json
import asyncio
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from google import genai
from google.genai import types
from pypdf import PdfReader

load_dotenv()

# --- INITIALIZATION ---
app = FastAPI()

# CRITICAL: Allow your Next.js frontend to talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=types.HttpOptions(api_version="v1")
)

# --- MODELS ---
class JDRequest(BaseModel):
    text: str

class JobStructure(BaseModel):
    title: str
    skills: List[str]
    description: str

# --- LOGIC FUNCTIONS ---

def process_applications_logic():
    """The original resume screening logic."""
    response = supabase.table("applications").select("*, jobs(*)").eq("status", "pending").execute()
    apps = response.data

    if not apps:
        print("No pending applications found.")
        return

    for app in apps:
        try:
            print(f"Processing resume for: {app['candidate_name']}")
            file_data = supabase.storage.from_('resumes').download(app['resume_path'])
            
            reader = PdfReader(io.BytesIO(file_data))
            resume_text = "".join([page.extract_text() for page in reader.pages])

            prompt = f"""
            Compare this resume to the job description.
            JOB: {app['jobs']['title']} | DESC: {app['jobs']['description']}
            RESUME: {resume_text}
            Return ONLY a JSON object: {{"score": 0-100, "summary": "2 sentences", "matched_skills": [], "missing_skills": []}}
            """

            response = client.models.generate_content(
                model="gemini-2.0-flash", # Use stable 2.0 or 1.5
                contents=prompt
            )

            res_text = response.text.replace('```json', '').replace('```', '').strip()
            analysis = json.loads(res_text)

            supabase.table("applications").update({
                "overall_score": analysis['score'],
                "ai_analysis": analysis['summary'],
                "status": "screened"
            }).eq("id", app['id']).execute()

            print(f"✅ Screened {app['candidate_name']}")

        except Exception as e:
            print(f"❌ Error processing application {app.get('id')}: {str(e)}")

# --- ENDPOINTS ---

@app.post("/api/extract-jd")
async def extract_jd_endpoint(request: JDRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    try:
        print("Received text, sending to Gemini...")
        
        # 1. Ask for JSON directly in the prompt
        prompt = f"""
        Extract the following from this raw job description text:
        1. A professional Job Title.
        2. A list of key technical skills.
        3. A concise summary of the role (3 sentences).

        Return ONLY a valid JSON object with the exact keys: "title", "skills" (array of strings), and "description".
        Do not include markdown blocks like ```json.

        Text: {request.text}
        """
        
        # 2. Call Gemini without the strict config block
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        # 3. Clean and parse the text exactly like your resume screener does
        res_text = response.text.replace('```json', '').replace('```', '').strip()
        structured_data = json.loads(res_text)
        
        print("Gemini extraction successful!")
        return structured_data
        
    except Exception as e:
        print(f"🔥 GEMINI CRASH REPORT: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/screen-applications")
async def trigger_screening(background_tasks: BackgroundTasks):
    """Manually trigger the resume screening process via API."""
    background_tasks.add_task(process_applications_logic)
    return {"message": "Screening process started in the background."}

@app.get("/")
async def root():
    return {"status": "HireIQ AI Service is Online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)