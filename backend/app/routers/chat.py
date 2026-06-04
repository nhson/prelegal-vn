import logging
from datetime import date
from typing import Optional, Literal, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ValidationError
from litellm import completion

from app.document_catalog import CATALOG, catalog_summary, get_doc_by_slug

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}
VALID_SLUGS: frozenset[str] = frozenset(d["slug"] for d in CATALOG)

GREETING = (
    "Hi! I'm here to help you create a legal document. "
    "What type of agreement do you need? For example: Mutual NDA, Cloud Service Agreement, "
    "Pilot Agreement, Data Processing Agreement, and more."
)


class FieldValue(BaseModel):
    key: str
    value: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    documentType: Optional[str] = None
    fields: List[FieldValue] = Field(default_factory=list)


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=8_000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(max_length=50)
    documentType: Optional[str] = None


def _build_system_prompt(doc_type: Optional[str]) -> str:
    today = date.today().isoformat()

    if not doc_type:
        return f"""You are a friendly legal assistant helping users create legal documents.

Supported document types:
{catalog_summary()}

Your job on this turn:
1. Identify which document type the user wants based on their message.
2. If it matches one of the supported types above, return its slug as documentType.
3. If they ask for something NOT on the list (e.g. employment contract, lease, will), explain politely that you only support the documents listed, and suggest the closest available match.
4. If it is unclear what they want, ask a clarifying question.

Return documentType as the exact slug string from the list above, or null if not yet determined.
Return an empty fields list on this turn — field collection begins once the document type is confirmed.
Today's date: {today}"""

    doc = get_doc_by_slug(doc_type)
    if not doc:
        return _build_system_prompt(None)

    field_list = "\n".join(f"  - {f}" for f in doc["fields"])
    return f"""You are a friendly legal assistant helping a user create a {doc["name"]}.

Your goals:
1. Have a natural conversation to gather all required information for this document.
2. Ask 1-2 questions at a time — do not overwhelm the user.
3. After each user reply, re-read the ENTIRE conversation and extract every field value you can.
4. Return ALL currently known field values in the fields array (omit fields you don't yet know).
5. When all required fields are collected, congratulate the user and tell them the document is ready to download.

Required fields for this document:
{field_list}

Always return:
- documentType: "{doc_type}" (unchanged — do not change this)
- fields: a list of {{key, value}} objects for every field you have extracted so far
- reply: your conversational response asking for missing information

Today's date for default date values: {today}"""


@router.get("/greeting")
def get_greeting():
    return {"message": GREETING}


@router.get("/catalog")
def get_catalog():
    return {"documents": [{"slug": d["slug"], "name": d["name"], "description": d["description"]} for d in CATALOG]}


@router.post("/message")
def send_message(req: ChatRequest) -> ChatResponse:
    if req.documentType is not None and req.documentType not in VALID_SLUGS:
        raise HTTPException(status_code=422, detail=f"Unknown documentType: {req.documentType!r}")

    messages = [{"role": "system", "content": _build_system_prompt(req.documentType)}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        raw = response.choices[0].message.content
    except Exception:
        logger.exception("AI service error")
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable")

    try:
        parsed = ChatResponse.model_validate_json(raw)
    except ValidationError:
        logger.exception("Failed to parse AI response: %s", raw)
        raise HTTPException(status_code=502, detail="AI returned an unexpected response format")

    # Enforce documentType consistency — AI must not switch type mid-conversation
    if req.documentType and parsed.documentType != req.documentType:
        parsed.documentType = req.documentType

    return parsed
