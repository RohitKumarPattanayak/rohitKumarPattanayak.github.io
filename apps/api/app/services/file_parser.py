import io
from typing import Callable, Dict
from fastapi import HTTPException
from pypdf import PdfReader
from docx import Document
from app.core.logger import logger


class FileParserService:
    def __init__(self):
        self.parsers: Dict[str, Callable] = {
            "txt": self._parse_txt,
            "pdf": self._parse_pdf,
            "docx": self._parse_docx,
        }

    def parse(self, filename: str, content: bytes) -> str:
        try:
            extension = self._get_extension(filename)
            parser = self.parsers.get(extension)
            if not parser:
                raise HTTPException(
                    status_code=400, detail="Unsupported file type")

            result = parser(content)

            logger.info("parse - File parsed successfully")

            return result
        except Exception as e:
            logger.error("parse - Error occurred", exc_info=True)
            raise

    def _get_extension(self, filename: str) -> str:
        return filename.lower().split(".")[-1]

    def _parse_txt(self, content: bytes) -> str:
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Invalid TXT encoding")

    def _parse_pdf(self, content: bytes) -> str:
        pdf = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
        return text

    def _parse_docx(self, content: bytes) -> str:
        doc = Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs])
