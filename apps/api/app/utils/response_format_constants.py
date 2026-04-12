from app.utils import constants

PARSE_RESUME_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "resume_structure",
        "schema": {
            "type": "object",
            "properties": {
                "introduction": {
                    "type": "string",
                    "description": "A brief professional introduction of the candidate."
                },
                "total_experience": {
                    "type": "string",
                    "description": "The total calculated duration of work experience (e.g., '5 years, 2 months')."
                },
                "projects": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "company": {"type": "string"},
                            "tech_stack": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "description": {"type": "string"},
                            "impact": {"type": "string"},
                            "project_pic": {
                                "type": "string",
                                "description": "A URL for the project thumbnail. If not available, use the default: https://dummyimage.com/600x400/000/fff&text=Project+Image"
                            }
                        },
                        "required": constants.PARSE_SECTION_PROJECT,
                        "additionalProperties": False
                    }
                },
                "experience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "company": {"type": "string"},
                            "role": {"type": "string"},
                            "start_date": {"type": "string"},
                            "end_date": {"type": "string"},
                            "description": {"type": "string"}
                        },
                        "required": constants.PARSE_SECTION_EXPERIANCE,
                        "additionalProperties": False
                    }
                },
                "skills": {
                    "type": "string",
                    "description": "A single comma-separated string containing all skills."
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "institution": {"type": "string"},
                            "degree": {"type": "string"},
                            "start_year": {"type": "string"},
                            "end_year": {"type": "string"}
                        },
                        "required": constants.PARSE_SECTION_EDUCATION,
                        "additionalProperties": False
                    }
                },
                "resume_owner_pic": {
                    "type": "string",
                    "description": "A URL for the profile picture of the candidate. If not found in the resume, output exactly: https://dummyimage.com/400x400/000/fff&text=Profile+Pic"
                },
                "social_links": {
                    "type": "object",
                    "description": "Social media links. If not found, use default placeholders: {'linkedin': 'https://linkedin.com/in/dummy', 'github': 'https://github.com/dummy'}",
                    "properties": {
                        "linkedin": {"type": "string"},
                        "github": {"type": "string"}
                    },
                    "additionalProperties": True
                },
                "personal_info": {
                    "type": "object",
                    "description": "Personal contact info. If any are missing, default to name='Dummy Name', email='dummy@example.com', phone='+1-000-000-0000'",
                    "properties": {
                        "name": {"type": "string"},
                        "email": {"type": "string"},
                        "phone": {"type": "string"}
                    },
                    "required": ["name", "email", "phone"],
                    "additionalProperties": False
                }
            },
            "required": [
                "introduction", 
                "total_experience", 
                "projects", 
                "experience", 
                "skills", 
                "education",
                "resume_owner_pic",
                "social_links",
                "personal_info"
            ],
            "additionalProperties": False
        }
    }
}

INTENT_CLASIFY_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "intent_classification",
        "schema": {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "enum": constants.SEGREGATION_ARR
                }
            },
            "required": ["intent"]
        }
    }
}
