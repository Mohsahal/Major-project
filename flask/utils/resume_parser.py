"""Extract text from resume files (PDF, DOCX, TXT)."""
import PyPDF2
import docx2txt
from typing import Set

ALLOWED_EXTENSIONS: Set[str] = {'pdf', 'docx', 'txt'}


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_resume_text(file_path: str, file_extension: str) -> str:
    """Extract text from resume file based on its extension."""
    try:
        if file_extension == 'pdf':
            text = ""
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    text += page_text + "\n"
            return text.strip()
        if file_extension == 'docx':
            return docx2txt.process(file_path)
        if file_extension == 'txt':
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        raise ValueError("Unsupported resume format. Use PDF, DOCX, or TXT.")
    except Exception as e:
        raise Exception(f"Error extracting text from {file_extension} file: {str(e)}")
