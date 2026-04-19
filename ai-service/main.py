import os
import io
import json
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types  # Import types for configuration
from pypdf import PdfReader

load_dotenv()

# Initialize Supabase
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# MODIFIED: Force API v1 to avoid the 404/v1beta issue
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=types.HttpOptions(api_version="v1")
)

def process_pending_applications():
    response = supabase.table("applications").select("*, jobs(*)").eq("status", "pending").execute()
    apps = response.data

    if not apps:
        print("No pending applications found.")
        return

    for app in apps:
        print(f"Processing resume for: {app['candidate_name']}")
        
        try:
            # Download PDF
            file_data = supabase.storage.from_('resumes').download(app['resume_path'])
            
            # Extract Text
            reader = PdfReader(io.BytesIO(file_data))
            resume_text = "".join([page.extract_text() for page in reader.pages])

            job_title = app['jobs']['title']
            job_desc = app['jobs']['description']
            required_skills = app['jobs']['required_skills']

            prompt = f"""
            Compare this resume to the job description.
            JOB: {job_title} | DESC: {job_desc} | SKILLS: {required_skills}
            RESUME: {resume_text}
            Return ONLY a JSON object: {{"score": 0-100, "summary": "2 sentences", "matched_skills": [], "missing_skills": []}}
            """

            # MODIFIED: Use the 2026 stable model
            response = client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=prompt
            )

            # Extract text and clean JSON
            res_text = response.text.replace('```json', '').replace('```', '').strip()
            analysis = json.loads(res_text)

            # Update Supabase
            supabase.table("applications").update({
                "overall_score": analysis['score'],
                "ai_analysis": analysis['summary'],
                "status": "screened"
            }).eq("id", app['id']).execute()

            print(f"✅ Screened {app['candidate_name']} - Score: {analysis['score']}")

        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    process_pending_applications()