from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session

from ..database.connection import get_db
from ..models.parking import ParkingSpaceModel
from ..services.storage import save_image_file

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/image")
async def upload_single_image(file: UploadFile = File(...)):
    """
    Uploads a single image for parking space listers.
    Supports JPG, PNG, WEBP.
    Stores either in Supabase Storage or local static storage and returns public URL.
    """
    url = await save_image_file(file)
    return {"url": url, "filename": file.filename}

@router.post("/images")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    """Uploads multiple parking spot photos at once."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    urls = []
    for file in files:
        url = await save_image_file(file)
        urls.append(url)
        
    return {"urls": urls, "count": len(urls)}

@router.post("/parking/{parking_id}/images")
async def attach_images_to_parking(
    parking_id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Uploads photos and directly links them to a parking space listing."""
    space = db.query(ParkingSpaceModel).filter(ParkingSpaceModel.id == parking_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Parking space not found")

    new_urls = []
    for file in files:
        url = await save_image_file(file)
        new_urls.append(url)

    current_images = space.images or []
    space.images = current_images + new_urls
    db.commit()
    db.refresh(space)

    return {
        "parking_id": space.id,
        "images": space.images,
        "newly_added": new_urls
    }
