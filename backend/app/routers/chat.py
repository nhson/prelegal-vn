import logging
from datetime import date
from typing import Optional, Literal, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from litellm import completion

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

GREETING = (
    "Hi! I'm here to help you create a Mutual Non-Disclosure Agreement. "
    "Let's start — what's your company name and who will be signing on your behalf?"
)


class NDAFields(BaseModel):
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1Address: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2Address: Optional[str] = None
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["years", "until_terminated"]] = None
    mndaTermYears: Optional[str] = None
    confidentialityTermType: Optional[Literal["years", "perpetuity"]] = None
    confidentialityTermYears: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    fields: NDAFields


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=8_000)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(max_length=50)


def _build_system_prompt() -> str:
    today = date.today().isoformat()
    return f"""You are a friendly legal assistant helping a user create a Mutual Non-Disclosure Agreement (NDA).

Your goals:
1. Have a natural conversation to gather all information needed for the NDA
2. Ask 1-2 questions at a time — do not ask everything at once
3. After each user reply, extract every NDA field value you can from the ENTIRE conversation history
4. Return all currently known field values in the fields object (use null for fields not yet provided)
5. When all required fields are known, congratulate the user and tell them their NDA is ready to download

NDA fields to collect:
- party1Name: signatory full name for Party 1 (the user's side)
- party1Title: signatory job title for Party 1
- party1Company: company name for Party 1
- party1Address: notice address for Party 1 (email or postal address)
- party2Name: signatory full name for Party 2 (the other side)
- party2Title: signatory job title for Party 2
- party2Company: company name for Party 2
- party2Address: notice address for Party 2
- purpose: brief description of the business purpose of the NDA
- effectiveDate: start date in YYYY-MM-DD format (default to today {today} if not mentioned)
- mndaTermType: "years" if the agreement expires after N years, "until_terminated" if it runs until cancelled
- mndaTermYears: string number of years (e.g. "2"), only when mndaTermType is "years" — default "1"
- confidentialityTermType: "years" if confidentiality expires, "perpetuity" if it lasts forever
- confidentialityTermYears: string number of years, only when confidentialityTermType is "years" — default "1"
- governingLaw: US state whose laws govern the agreement (e.g. "Delaware")
- jurisdiction: courts for disputes (e.g. "New Castle, DE")
- modifications: any special modifications to the standard terms (use empty string "" if none)

Keep your tone warm and professional. Re-read the entire conversation each turn to extract all known fields accurately."""


@router.get("/greeting")
def get_greeting():
    return {"message": GREETING}


@router.post("/message")
def send_message(req: ChatRequest) -> ChatResponse:
    messages = [{"role": "system", "content": _build_system_prompt()}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        result = response.choices[0].message.content
        return ChatResponse.model_validate_json(result)
    except Exception:
        logger.exception("AI service error")
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable")
