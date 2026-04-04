import enum


class UserMode(enum.Enum):
    recruiter = "recruiter"
    candidate = "candidate"


class ContentType(enum.Enum):
    text = 'text'
    other = 'other'
    list_projects = 'list_projects'
    list_experience = 'list_experience'
    list_education = 'list_education'
    list_skills = 'list_skills'
