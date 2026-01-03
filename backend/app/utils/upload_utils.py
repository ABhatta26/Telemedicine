import os
import uuid
from fastapi import UploadFile

BASE_UPLOAD_DIR = "uploads"

def save_file(file: UploadFile, folder: str) -> str:
    os.makedirs(f"{BASE_UPLOAD_DIR}/{folder}", exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = f"{folder}/{filename}"
    full_path = f"{BASE_UPLOAD_DIR}/{file_path}"

    with open(full_path, "wb") as f:
        f.write(file.file.read())

    return file_path
