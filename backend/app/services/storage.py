import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from ..database.connection import supabase_client

# Local storage path
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

async def save_image_file(file: UploadFile) -> str:
    """
    Saves an uploaded image.
    If Supabase is configured and has a 'parking-images' bucket, uploads there.
    Otherwise, saves locally and returns a public static URL.
    """
    filename = file.filename or "image.jpg"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4()}{ext}"
    content = await file.read()
    
    # Try Supabase Storage first if client is available
    if supabase_client:
        try:
            bucket_name = "parking-images"
            res = supabase_client.storage.from_(bucket_name).upload(
                path=unique_filename,
                file=content,
                file_options={"content-type": file.content_type or "image/jpeg"}
            )
            # Get public URL
            public_url = supabase_client.storage.from_(bucket_name).get_public_url(unique_filename)
            if public_url:
                return public_url
        except Exception as e:
            print(f"Supabase storage upload fallback to local due to: {e}")

    # Local storage fallback
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
        
    return f"/static/uploads/{unique_filename}"
