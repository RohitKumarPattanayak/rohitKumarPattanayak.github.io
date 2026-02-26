from app.utils import constants

PARSE_RESUME_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "resume_structure",
        "schema": {
            "type": "object",
            "properties": {
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
                        "required": constants.PARSE_SECTION_PROJECT
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
                        "required": constants.PARSE_SECTION_EXPERIANCE
                    }
                },

                "skills": {
                    "type": "array",
                    "items": {"type": "string"}
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
                        "required": constants.PARSE_SECTION_EDUCATION
                    }
                }
            },

            "required": ["projects", "experience", "skills", "education"],

            "additionalProperties": False
        }
    }
}
