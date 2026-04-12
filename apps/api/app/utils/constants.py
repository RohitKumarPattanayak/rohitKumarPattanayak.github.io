import re

# Filename: constants.py

# Added new sections for intent segregation
SEGREGATION_ARR = [
    "introduction",
    "total_experience",
    "list_projects",
    "list_skills",
    "list_experience",
    "list_education",
    "semantic_search"
]

PARSE_SECTION_PROJECT = [
    "title",
    "company",
    "tech_stack",
    "description",
    "impact",
    "project_pic"
]

PARSE_SECTION_EXPERIANCE = [
    "company",
    "role",
    "start_date",
    "end_date",
    "description"
]

PARSE_SECTION_EDUCATION = [
    "institution",
    "degree",
    "start_year",
    "end_year"
]

# Updated Intents to include Introduction and Total Experience
INTENTS = {
    "introduction": "User asking for an overview or introduction of the candidate",
    "total_experience": "User asking about total years of professional experience",
    "list_experience": "User asking about past companies or work history or past experience",
    "list_skills": "User asking about technical skills or technologies",
    "list_education": "User asking about education background",
    "list_projects": "User asking about listing all projects",
}

_INTENT_PATTERNS = {
    # New pattern for introduction/summary
    "introduction": re.compile(
        r"\bwho\s+is\b|"
        r"\btell\s+me\s+about\b|"
        r"\bsummarize\b|"
        r"\bintroduction\b|"
        r"\boverview\b|"
        r"\bbrief\b"
    ),

    "total_experience": re.compile(
        r"\b(total|overall)\s+(work\s+)?experien[cs]e\b|"
        r"\b(total|overall)\s+(work\s+)?experiance\b|"
        r"\bhow\s+many\s+years\b|"
        r"\byears\s+of\s+experien[cs]e\b|"
        r"\byears\s+of\s+experiance\b"
    ),

    "list_experience": re.compile(
        r"\blist\s+experien[cs]e\b|"
        r"\blist\s+experiance\b|"
        r"\bexperience\b|"
        r"\bexperiance\b|"
        r"\bwhere\s+(have\s+you\s+)?work(ed)?\b|"
        r"\bcompanies\b|"
        r"\bwork\s+history\b|"
        r"\bprevious\s+employers\b"
    ),

    "list_skills": re.compile(
        r"\bskills?\b|"
        r"\btechnologies\b|"
        r"\btech\s+stack\b|"
        r"\btools\b|"
        r"\bframeworks?\b"
    ),

    "list_education": re.compile(
        r"\beducation\b|"
        r"\bdegree\b|"
        r"\bcollege\b|"
        r"\buniversity\b|"
        r"\bqualification\b"
    ),

    "list_projects": re.compile(
        r"\blist\s+projects?\b|"
        r"\bprojects?\s+list\b|"
        r"\bproject\s+names\b"
    ),

    "mention_projects": re.compile(
        r"\btell\s+me\s+about\s+projects?\b|"
        r"\bdescribe\s+projects?\b|"
        r"\bexplain\s+projects?\b|"
        r"\bworked\s+on\b|"
        r"\bproject\s+experience\b|"
        r"\bportfolio\b"
    ),
}

# Ensure the ingestion list matches the parser output
RESUME_INJESTION_SECTIONS = [
    "introduction", 
    "total_experience", 
    "projects", 
    "experience", 
    "education", 
    "skills",
    "resume_owner_pic",
    "social_links",
    "personal_info"
]

LIMIT_OF_MESSAGE = 4