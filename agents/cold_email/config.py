"""
Target client profile — edit this to define WHO you want to reach.
"""

# ── WHO YOU ARE ──────────────────────────────────────────────────────────────
SENDER_BUSINESS = "The Tech Tutors"
SENDER_TAGLINE  = "We build custom software, automate workflows, and create AI-powered tools."
SERVICES        = [
    "Custom web and mobile apps",
    "AI/ML integrations and chatbots",
    "Workflow automation (n8n, Zapier, Make)",
    "API development and integrations",
    "UI/UX design and Figma prototyping",
]

# ── IDEAL CUSTOMER PROFILE (ICP) ────────────────────────────────────────────
# These are used to guide Claude when writing personalised emails.
# They are NOT used to auto-scrape leads — export your own CSV from Apollo.io.

TARGET_INDUSTRIES = [
    "E-commerce",
    "Real Estate",
    "Healthcare / MedTech",
    "SaaS / Software",
    "Marketing agencies",
    "Logistics / Supply Chain",
    "Finance / FinTech",
    "Education",
]

TARGET_TITLES = [
    "Founder",
    "CEO",
    "CTO",
    "Head of Operations",
    "Product Manager",
    "Director of Engineering",
    "VP of Technology",
]

TARGET_COMPANY_SIZE = "1–200 employees (startups and SMBs)"

# ── PAIN POINTS TO REFERENCE ────────────────────────────────────────────────
# Claude will weave relevant pain points into the email body.
PAIN_POINTS = [
    "manual, repetitive back-office work eating up your team's time",
    "outdated software slowing growth",
    "no in-house tech team for custom builds",
    "AI tools that don't integrate with your existing stack",
    "expensive agency quotes for straightforward builds",
]

# ── EMAIL TONE & RULES ───────────────────────────────────────────────────────
EMAIL_TONE = "friendly, concise, and direct — like a message from a fellow founder, not a sales pitch"
MAX_EMAIL_WORDS = 120   # Keep emails short; Claude is told to stay under this
INCLUDE_CALENDLY = True
CALENDLY_LINK    = "https://calendly.com/the-techtutor27"  # replace with your real link
