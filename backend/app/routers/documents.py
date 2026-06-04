import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Document, User

router = APIRouter()


class DocumentCreate(BaseModel):
    title: str
    document_type: str
    fields: dict


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    fields: Optional[dict] = None


def _as_list_item(doc: Document) -> dict:
    return {
        "id": doc.id,
        "title": doc.title,
        "document_type": doc.document_type,
        "created_at": doc.created_at.isoformat(),
        "updated_at": doc.updated_at.isoformat(),
    }


def _as_full(doc: Document) -> dict:
    return {**_as_list_item(doc), "fields": json.loads(doc.fields)}


@router.get("")
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    docs = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.updated_at.desc())
        .all()
    )
    return [_as_list_item(d) for d in docs]


@router.post("", status_code=201)
def create_document(
    req: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = Document(
        user_id=current_user.id,
        title=req.title,
        document_type=req.document_type,
        fields=json.dumps(req.fields),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _as_full(doc)


@router.get("/{doc_id}")
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _as_full(doc)


@router.put("/{doc_id}")
def update_document(
    doc_id: int,
    req: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if req.title is not None:
        doc.title = req.title
    if req.fields is not None:
        doc.fields = json.dumps(req.fields)
    doc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return _as_full(doc)


@router.delete("/{doc_id}", status_code=204, response_class=Response)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id, Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
