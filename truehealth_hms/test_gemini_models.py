import os
import google.generativeai as genai
from decouple import config

api_key = config('GOOGLE_API_KEY', default=None)
if not api_key:
    print("No API key found")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Listing models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
