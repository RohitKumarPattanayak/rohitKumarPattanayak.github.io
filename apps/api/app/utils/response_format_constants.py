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
                            "impact": {"type": "string"}
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
                }
            },
            "required": [
                "introduction", 
                "total_experience", 
                "projects", 
                "experience", 
                "skills", 
                "education"
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
