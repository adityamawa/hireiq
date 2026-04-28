import os
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

# Define the structure for the AI to follow
class JobStructure(BaseModel):
    title: str
    skills: List[str]
    description: str

def get_structured_jd(raw_text: str):
    # Use the same client config as your main.py
    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY"),
        http_options=types.HttpOptions(api_version="v1")
    )
    
    prompt = f"""
    Extract the following from this raw job description text:
    1. A professional Job Title.
    2. A list of key technical skills.
    3. A concise summary of the role.

    Text: {raw_text}
    """
    
    # Using the Pydantic schema ensures you get valid JSON back
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': JobStructure
        }
    )
    
    return response.parsed

if __name__ == "__main__":
    # Quick test loop
    test_text = "Looking for a Python dev with React skills for a 6 month project."
    print(get_structured_jd(test_text))