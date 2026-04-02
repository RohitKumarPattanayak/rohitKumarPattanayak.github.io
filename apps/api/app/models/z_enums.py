import enum


class UserMode(enum.Enum):
    recruiter = "recruiter"
    candidate = "candidate"


class ContentType(enum.Enum):
    text = 'text'
    other = 'other'
