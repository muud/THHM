try:
    import google.generativeai as genai
except ImportError:
    genai = None
from django.conf import settings
from decouple import config
import logging
import os
import json

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = config('GOOGLE_API_KEY', default=None)
if api_key and genai:
    genai.configure(api_key=api_key)

def analyze_xray(image_path, clinical_history=""):
    """
    Analyzes an X-ray image using MedGemma reasoning (via Gemini 2.0 Flash).
    """
    if not api_key:
        return {"findings": "AI API key not configured.", "impression": "Please add GOOGLE_API_KEY."}

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        if not os.path.exists(image_path):
            return {"error": "Image file not found."}
            
        with open(image_path, "rb") as f:
            image_data = f.read()
            
        prompt = f"""
        [SYSTEM: MEDGEMMA DIAGNOSTIC ENGINE v2.0]
        You are a specialized medical AI designed for clinical radiology and diagnostic reasoning.
        Analyze this X-ray with high precision.
        
        Clinical Context: {clinical_history}
        
        Provide a structured report including:
        1. [FINDINGS]: Detailed anatomical observations.
        2. [IMPRESSION]: Differential Diagnosis and Primary Impression.
        3. [MEDGEMMA_INSIGHT]: Specialized clinical reasoning regarding the pathology seen.
        4. [SUGGESTED_MEDICATION]: If applicable, mention standard-of-care medication classes.
        5. [PATIENT_EXPLANATION]: Plain language summary.
        
        Format sections clearly with brackets.
        """
        
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        
        text = response.text
        return {
            "findings": text.split("[FINDINGS]")[-1].split("[IMPRESSION]")[0].strip() if "[FINDINGS]" in text else text,
            "impression": text.split("[IMPRESSION]")[-1].split("[MEDGEMMA_INSIGHT]")[0].strip() if "[IMPRESSION]" in text else "See report.",
            "medgemma_insight": text.split("[MEDGEMMA_INSIGHT]")[-1].split("[SUGGESTED_MEDICATION]")[0].strip() if "[MEDGEMMA_INSIGHT]" in text else "",
            "medication": text.split("[SUGGESTED_MEDICATION]")[-1].split("[PATIENT_EXPLANATION]")[0].strip() if "[SUGGESTED_MEDICATION]" in text else "",
            "patient_explanation": text.split("[PATIENT_EXPLANATION]")[-1].strip() if "[PATIENT_EXPLANATION]" in text else "",
            "raw_response": text
        }
        
    except Exception as e:
        logger.error(f"MedGemma Analysis error: {e}")
        return {"error": str(e)}

def suggest_medication_diagnosis(symptoms, history=""):
    """
    Uses MedGemma reasoning to suggest a diagnosis and medication based on clinical description.
    """
    if not api_key:
        return {"error": "AI API key not configured."}

    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = f"""
        [SYSTEM: MEDGEMMA CLINICAL DIAGNOSTIC ENGINE]
        Persona: Clinical Pathologist and Pharmacologist.
        
        Analyze the following presentation:
        Symptoms: {symptoms}
        Patient History: {history}
        
        Provide:
        1. [PRIMARY_DIAGNOSIS]: Most likely diagnosis.
        2. [ICD10_CODE]: Matching ICD-10 code.
        3. [RATIONALE]: Clinical reasoning.
        4. [MEDICATION_PLAN]: Suggested pharmacological intervention (State clearly this is for admin review).
        5. [CONFIDENCE]: 0-100 score.
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        return {
            "diagnosis": text.split("[PRIMARY_DIAGNOSIS]")[-1].split("[ICD10_CODE]")[0].strip() if "[PRIMARY_DIAGNOSIS]" in text else "",
            "icd10": text.split("[ICD10_CODE]")[-1].split("[RATIONALE]")[0].strip() if "[ICD10_CODE]" in text else "",
            "rationale": text.split("[RATIONALE]")[-1].split("[MEDICATION_PLAN]")[0].strip() if "[RATIONALE]" in text else "",
            "medication": text.split("[MEDICATION_PLAN]")[-1].split("[CONFIDENCE]")[0].strip() if "[MEDICATION_PLAN]" in text else "",
            "confidence": text.split("[CONFIDENCE]")[-1].strip() if "[CONFIDENCE]" in text else "50"
        }
        
    except Exception as e:
        logger.error(f"MedGemma Clinical Suggestion error: {e}")
        return {"error": str(e)}
