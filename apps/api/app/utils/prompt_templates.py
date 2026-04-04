from string import Template

RESUME_PARSER_PROMPT_TEMP = Template("""
            You are a strict resume parser.

            Extract structured JSON from the resume text.

            Return ONLY valid JSON. Do not include explanations, markdown, or extra text.

            Follow this exact structure:

            {{
            "introduction": "",
            "total_experience": "",
            "projects": [
                {{
                "title": "",
                "company": "",
                "tech_stack": [],
                "description": "",
                "impact": ""
                }}
            ],
            "experience": [
                {{
                "company": "",
                "role": "",
                "start_date": "",
                "end_date": "",
                "description": ""
                }}
            ],
            "skills": "",
            "education": [
                {{
                "institution": "",
                "degree": "",
                "start_year": "",
                "end_year": ""
                }}
            ]
            }}

            Rules:
            - CHARACTER ENCODING: Use ONLY standard ASCII characters in string values. 
            - IMPORTANT: Dont use smart quotes (’, “, ”) use instead standard straight quotes (' or ").
            - IMPORTANT: Replace all curly apostrophes (’) with a standard straight apostrophe (').
            - JSON SAFETY: Ensure all double quotes within text values are properly escaped with a backslash (\\").
            - introduction: Provide a brief 2-3 sentence professional summary of the candidate.
            - total_experience: Calculate and store the total duration of work experience (e.g., "5 years, 3 months").
            - skills: This must be a single comma-separated string of all identified technical and soft skills.
            - Extract all available sections.
            - If a section is missing, return an empty array [] or empty string "" accordingly.
            - Do NOT hallucinate information.
            - Do NOT summarize project or experience descriptions; preserve technical details.
            - Dates should remain as strings.
            - Tech stack within projects must remain an array of strings.

            Resume Text:
            ${raw_text}
            """)
INTENT_PROMPT_TEMP = Template("""
            Classify the user's intent.

            Return ONLY valid JSON in this format:

            {{
            "intent": "list_projects | semantic_search | list_skills | list_experience | list_education"
            }}

            User message:
            {message}
            """)


TEMPLATE_FACTORY = {
    'resume_parser': RESUME_PARSER_PROMPT_TEMP,
    'intent_clsify': INTENT_PROMPT_TEMP
}
