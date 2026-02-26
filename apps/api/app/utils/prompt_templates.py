from string import Template

RESUME_PARSER_PROMPT_TEMP = Template("""
            You are a strict resume parser.

            Extract structured JSON from the resume text.

            Return ONLY valid JSON. Do not include explanations, markdown, or extra text.

            Follow this exact structure:

            {{
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
            "skills": [
                ""
            ],
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
            - Extract all available sections.
            - If a section is missing, return an empty array [].
            - Do NOT hallucinate information.
            - Do NOT summarize.
            - Preserve technical details exactly as written.
            - Dates should remain as strings.
            - Tech stack must be an array of strings.
            - Skills must be an array of strings.

            Resume Text:
            ${raw_text}
            """)

TEMPLATE_FACTORY = {
    'resume_parser': RESUME_PARSER_PROMPT_TEMP
}
