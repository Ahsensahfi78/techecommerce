import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from .. import models, schemas
from ..auth import get_current_admin

router = APIRouter(prefix="/api", tags=["upload"])

UPLOAD_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"
)
ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}


@router.post("/upload", response_model=schemas.UploadOut)
def upload_image(
    file: UploadFile = File(...),
    admin: models.User = Depends(get_current_admin),
):
    if not file.content_type or file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400, detail="Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed"
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = ALLOWED_TYPES[file.content_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as out:
        shutil.copyfileobj(file.file, out)

    return schemas.UploadOut(url=f"/uploads/{filename}")
