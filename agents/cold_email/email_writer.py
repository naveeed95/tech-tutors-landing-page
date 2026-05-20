"""
Uses Claude API to write a personalised cold email for each lead.
Returns {"subject": str, "body": str}
"""
import json
import os
import anthropic
import config


_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise EnvironmentError("ANTHROPIC_API_KEY is not set in environment")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def _build_system_prompt() -> str:
    services = "\n".join(f"  • {s}" for s in config.SERVICES)
    pain_points = "\n".join(f"  • {p}" for p in config.PAIN_POINTS)
    return f"""You are an outreach specialist for {config.SENDER_BUSINESS}, a software development agency.
{config.SENDER_TAGLINE}

Our services:
{services}

Common pain points we solve for clients:
{pain_points}

Target clients: {config.TARGET_COMPANY_SIZE} across industries like {", ".join(config.TARGET_INDUSTRIES[:4])}.

Writing rules:
- Tone: {config.EMAIL_TONE}
- Maximum {config.MAX_EMAIL_WORDS} words in the email body
- Open with the lead's first name (no "Dear", no "Hello there")
- One specific sentence that shows you know something real about their company or industry
- One clear value prop sentence — what problem we solve for them
- One call to action: book a 15-min call ({config.CALENDLY_LINK if config.INCLUDE_CALENDLY else "reply to this email"})
- Sign off as: Naveed | {config.SENDER_BUSINESS}
- Final line (always): Reply STOP to unsubscribe.
- No buzzwords: "synergy", "leverage", "paradigm", "innovative", "cutting-edge"
- Do NOT use bullet points inside the email
- Output ONLY valid JSON with keys "subject" and "body". No markdown fences."""


def write_email(lead: dict) -> dict:
    """
    lead: dict with keys first_name, last_name, company, title, industry, website
    Returns: {"subject": str, "body": str}
    """
    first = lead.get("first_name") or lead.get("company", "there").split()[0]
    user_prompt = f"""Write a cold outreach email for this lead:

Name:     {lead.get("first_name", "")} {lead.get("last_name", "")}
Company:  {lead.get("company", "")}
Title:    {lead.get("title", "Founder")}
Industry: {lead.get("industry", "Technology")}
Website:  {lead.get("website", "N/A")}

Address them as "{first}". Output only JSON with "subject" and "body"."""

    response = _get_client().messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=_build_system_prompt(),
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw = response.content[0].text.strip()

    # Strip markdown fences if model adds them despite instruction
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude returned invalid JSON for {lead.get('email')}: {e}\nRaw: {raw}")

    if "subject" not in result or "body" not in result:
        raise ValueError(f"JSON missing subject/body keys: {result}")

    return result
