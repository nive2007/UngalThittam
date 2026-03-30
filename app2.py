import os
import uuid
import json
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ── Pydantic Models ──
class EducationSchema(BaseModel):
    level: Optional[str] = None
    field: Optional[str] = None
    specialization: Optional[str] = None
    percentage: Optional[str] = None

class OccupationSchema(BaseModel):
    sector: Optional[str] = None
    role: Optional[str] = None
    specialization: Optional[str] = None

class DisabilitySchema(BaseModel):
    status: Optional[str] = None
    percentage: Optional[str] = None

class UserProfile(BaseModel):
    full_name: Optional[str] = None
    age_bracket: Optional[str] = None
    gender: Optional[str] = None
    income_range: Optional[str] = None
    state: Optional[str] = None
    category: Optional[str] = None
    education: Optional[EducationSchema] = None
    occupation: Optional[OccupationSchema] = None
    disability: Optional[DisabilitySchema] = None

# ── FastAPI App ──
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse

@app.get("/")
async def serve_home():
    return FileResponse("index.html", media_type="text/html")

@app.get("/style.css")
async def serve_css():
    return FileResponse("style.css", media_type="text/css")

@app.get("/app.js")
async def serve_js():
    return FileResponse("app.js", media_type="application/javascript")

@app.get("/login.html")
async def serve_login():
    return FileResponse("login.html", media_type="text/html")

@app.get("/login.js")
async def serve_login_js():
    return FileResponse("login.js", media_type="application/javascript")

# ════════════════════════════════════════════════════════════
#  DATABASE — SQLite
# ════════════════════════════════════════════════════════════
DB_FILE = "govscheme_users.db"

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id      TEXT PRIMARY KEY,
            full_name    TEXT,
            created_at   TEXT,
            profile_json TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS applied_schemes (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      TEXT NOT NULL,
            scheme_name  TEXT NOT NULL,
            scheme_json  TEXT,
            applied_at   TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    conn.commit()
    conn.close()
    print("Database ready.")

init_db()

# ════════════════════════════════════════════════════════════
#  USER API ENDPOINTS
# ════════════════════════════════════════════════════════════

@app.post("/register")
def register_user(data: dict):
    """Create a new user and return a unique user_id."""
    profile = data.get("profile", {})
    full_name = profile.get("full_name", "User")
    # Generate short readable 8-char uppercase ID e.g. "A3F2B1C4"
    user_id = str(uuid.uuid4()).replace("-", "")[:8].upper()
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (user_id, full_name, created_at, profile_json) VALUES (?,?,?,?)",
            (user_id, full_name, datetime.now().isoformat(), json.dumps(profile))
        )
        conn.commit()
    finally:
        conn.close()
    return {"user_id": user_id, "full_name": full_name, "message": "Registered successfully"}


@app.get("/user/{user_id}")
def get_user(user_id: str):
    """Fetch user profile by user_id."""
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        profile = json.loads(row["profile_json"]) if row["profile_json"] else {}
        return {
            "user_id": row["user_id"],
            "full_name": row["full_name"],
            "created_at": row["created_at"],
            "profile": profile
        }
    finally:
        conn.close()


@app.put("/user/{user_id}")
def update_user(user_id: str, data: dict):
    """Update user profile (does not change user_id)."""
    profile = data.get("profile", {})
    full_name = profile.get("full_name", "User")
    conn = get_db()
    try:
        row = conn.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        conn.execute(
            "UPDATE users SET profile_json = ?, full_name = ? WHERE user_id = ?",
            (json.dumps(profile), full_name, user_id)
        )
        conn.commit()
    finally:
        conn.close()
    return {"message": "Profile updated", "user_id": user_id}


@app.post("/user/{user_id}/apply")
def apply_scheme(user_id: str, data: dict):
    """Mark a scheme as applied for a user."""
    scheme_name = data.get("scheme_name", "")
    scheme_json = json.dumps(data.get("scheme", {}))
    if not scheme_name:
        raise HTTPException(status_code=400, detail="scheme_name is required")
    conn = get_db()
    try:
        row = conn.execute("SELECT user_id FROM users WHERE user_id = ?", (user_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        existing = conn.execute(
            "SELECT id FROM applied_schemes WHERE user_id = ? AND scheme_name = ?",
            (user_id, scheme_name)
        ).fetchone()
        if existing:
            return {"message": "Already applied", "already_exists": True}
        conn.execute(
            "INSERT INTO applied_schemes (user_id, scheme_name, scheme_json, applied_at) VALUES (?,?,?,?)",
            (user_id, scheme_name, scheme_json, datetime.now().isoformat())
        )
        conn.commit()
    finally:
        conn.close()
    return {"message": "Scheme application saved", "scheme_name": scheme_name}


@app.delete("/user/{user_id}/apply/{scheme_name}")
def remove_applied_scheme(user_id: str, scheme_name: str):
    """Remove a tracked application."""
    from urllib.parse import unquote
    scheme_name = unquote(scheme_name)
    conn = get_db()
    try:
        conn.execute(
            "DELETE FROM applied_schemes WHERE user_id = ? AND scheme_name = ?",
            (user_id, scheme_name)
        )
        conn.commit()
    finally:
        conn.close()
    return {"message": "Removed"}


@app.get("/user/{user_id}/applications")
def get_applications(user_id: str):
    """Get all schemes a user has applied for."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT scheme_name, scheme_json, applied_at FROM applied_schemes WHERE user_id = ? ORDER BY applied_at DESC",
            (user_id,)
        ).fetchall()
        results = []
        for r in rows:
            scheme = json.loads(r["scheme_json"]) if r["scheme_json"] else {}
            results.append({
                "scheme_name": r["scheme_name"],
                "applied_at": r["applied_at"],
                "scheme": scheme
            })
        return {"applications": results, "total": len(results)}
    finally:
        conn.close()


# ════════════════════════════════════════════════════════════
#  AI SCHEME SEARCH (unchanged logic)
# ════════════════════════════════════════════════════════════

df = pd.read_csv("schemes.csv", encoding="latin1", engine="python", on_bad_lines="skip")
df = df.fillna('')
df.columns = df.columns.str.strip().str.lower()

import re as _re
def fix_rupee(val):
    if isinstance(val, str):
        return _re.sub(r'\?(?=[\d,])', '\u20b9', val)
    return val
df = df.map(fix_rupee)

print("Loading AI model...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

TAMIL_KEYWORDS = {
    "விவசாயி": "farmer agriculture",
    "விவசாயிகள்": "farmer agriculture",
    "மாணவர்": "student education scholarship",
    "மாணவர்கள்": "student education scholarship",
    "பெண்": "women female girl",
    "பெண்கள்": "women female girl",
    "கடன்": "loan subsidy credit",
    "வீடு": "housing home shelter",
    "முதியோர்": "elderly senior old age pension",
    "குழந்தை": "child children",
    "ஊனமுற்றோர்": "disabled disability differently abled",
    "சுகாதாரம்": "health medical hospital",
    "தொழில்": "business entrepreneur self employment",
    "உதவித்தொகை": "scholarship financial assistance",
    "மானியம்": "subsidy grant",
}

def expand_tamil_query(query: str) -> str:
    expansions = []
    for tamil_word, english_expansion in TAMIL_KEYWORDS.items():
        if tamil_word in query:
            expansions.append(english_expansion)
    return query + " " + " ".join(expansions) if expansions else query

def combine_text(row):
    return (
        f"{row.get('scheme name', '')} "
        f"{row.get('details', '')} "
        f"{row.get('eligibility', '')} "
        f"{row.get('tags', '')} "
        f"{row.get('target_beneficiaries_states', '')} "
        f"{row.get('ministries/departments', '')}"
    )

df['combined_text'] = df.apply(combine_text, axis=1)

EMBEDDINGS_FILE = "scheme_embeddings.npy"
if os.path.exists(EMBEDDINGS_FILE):
    print("Loading cached scheme embeddings...")
    scheme_embeddings = np.load(EMBEDDINGS_FILE)
    if len(scheme_embeddings) != len(df):
        print("Dataset length changed — re-encoding...")
        scheme_embeddings = model.encode(df['combined_text'].tolist(), show_progress_bar=True)
        np.save(EMBEDDINGS_FILE, scheme_embeddings)
else:
    print("Encoding scheme embeddings for the first time...")
    scheme_embeddings = model.encode(df['combined_text'].tolist(), show_progress_bar=True)
    np.save(EMBEDDINGS_FILE, scheme_embeddings)

print("✅ Ready!")

BOOST_RULES = [
    (["farmer", "vivasayi", "agriculture", "விவசாய"], ["farmer", "agriculture"], 0.25),
    (["student", "scholarship", "மாணவர்", "education"], ["student", "education", "scholarship"], 0.25),
    (["women", "pengal", "பெண்", "female", "girl"], ["women", "female", "girl"], 0.25),
    (["loan", "கடன்", "credit"], ["loan", "subsidy", "credit"], 0.2),
    (["health", "சுகாதாரம்", "medical", "hospital"], ["health", "medical", "hospital"], 0.2),
    (["housing", "வீடு", "home", "shelter"], ["housing", "home", "shelter"], 0.2),
    (["elderly", "முதியோர்", "pension", "old age"], ["elderly", "pension", "old age"], 0.2),
    (["disabled", "ஊனமுற்றோர்", "disability"], ["disabled", "disability"], 0.2),
    (["business", "தொழில்", "entrepreneur", "startup"], ["business", "entrepreneur", "startup"], 0.2),
]

def keyword_boost(query_lower: str, text: str) -> float:
    bonus = 0.0
    for query_triggers, text_keywords, boost in BOOST_RULES:
        if any(t in query_lower for t in query_triggers):
            if any(k in text for k in text_keywords):
                bonus += boost
    return bonus


@app.post("/ask")
def ask(data: dict):
    query = data.get("query", "").strip()
    top_k = data.get("top_k", 10)
    threshold = data.get("threshold", 0.38)

    if not query:
        return {"results": []}

    profile = data.get("profile", {})
    expanded_query = expand_tamil_query(query)
    final_query = f"{expanded_query} scheme government benefits eligibility subsidy loan help"

    query_embedding = model.encode([final_query])
    similarities = cosine_similarity(query_embedding, scheme_embeddings)[0]

    results = []
    for i, score in enumerate(similarities):
        text = df.iloc[i]['combined_text'].lower()
        bonus = keyword_boost(query.lower(), text)
        final_score = float(score) + bonus

        match_reasons = []
        match_score_components = 0
        total_eval_components = 0

        if profile:
            gender = profile.get("gender", "").lower()
            age = profile.get("age_bracket")
            income = profile.get("income_range")
            state = profile.get("state", "").lower()
            category = profile.get("category", "").lower()
            edu = profile.get("education", {})
            occ = profile.get("occupation", {})
            disability = profile.get("disability", {})

            is_hard_excluded = False
            tags_eligibility_text = str(df.iloc[i].get('tags', '')) + " " + str(df.iloc[i].get('eligibility', ''))
            tags_eligibility_text = tags_eligibility_text.lower()

            dis_status = disability.get("status")
            if dis_status == "None":
                if any(w in tags_eligibility_text for w in ["differently abled", "pwd", "disabled", "handicap"]):
                    is_hard_excluded = True

            if gender == "male":
                if any(w in tags_eligibility_text for w in ["women only", "maternity", "pregnancy", "female only", "widow"]):
                    is_hard_excluded = True

            if is_hard_excluded:
                continue

            penalty_score = 0

            if gender == "male":
                if any(w in text for w in ["women", "girl", "female"]):
                    penalty_score -= 50
            elif gender == "female":
                total_eval_components += 1
                if any(w in text for w in ["women", "girl", "female", "maternity", "widow", "pregnancy"]):
                    match_score_components += 1
                    match_reasons.append("Designed for Women")

            if age == "18-25" or age == "26-35":
                total_eval_components += 1
                if any(w in text for w in ["senior citizen", "old age pension"]):
                    penalty_score -= 40
                if any(w in text for w in ["student", "scholarship", "youth"]):
                    match_score_components += 1
                    match_reasons.append("Youth/Student Phase")
            elif age == "60+":
                total_eval_components += 1
                if any(w in text for w in ["student", "scholarship", "youth"]):
                    penalty_score -= 40
                if any(w in text for w in ["senior citizen", "old age", "pension"]):
                    match_score_components += 1
                    match_reasons.append("Senior Citizen")

            sector = occ.get("sector")
            role = occ.get("role")
            if sector:
                if sector == "Agriculture":
                    total_eval_components += 1
                    if any(w in text for w in ["agriculture", "farmer", "crop", "kisan", "irrigation"]):
                        match_score_components += 1
                        match_reasons.append("Agriculture Match")
                elif sector == "Healthcare":
                    if any(w in text for w in ["health", "doctor", "nurse", "medical"]):
                        match_reasons.append("Healthcare Professional")
                        match_score_components += 1
                elif sector == "Technology":
                    if any(w in text for w in ["tech", "developer", "it ", "software"]):
                        match_reasons.append("Technology Sector")
                        match_score_components += 1
                if role and role != "Select...":
                    if role.lower() in text:
                        match_reasons.append(f"Role matched: {role}")
                        match_score_components += 0.5

            edu_level = edu.get("level")
            if edu_level and edu_level != "N/A":
                total_eval_components += 1
                if any(w in text.lower() for w in [edu_level.lower(), "education", "scholarship", "degree", "diploma", "vocational"]):
                    match_score_components += 1
                    match_reasons.append(f"Education Match: {edu_level}")

            dis_status = disability.get("status")
            if dis_status and dis_status != "None":
                total_eval_components += 1
                if any(w in text for w in ["differently abled", "pwd", "disabled", "handicapped", "blind", "deaf", "orthopedic"]):
                    match_score_components += 1
                    match_reasons.append(f"Disability Assistance ({dis_status})")

            if category and category != "General":
                total_eval_components += 1
                category_lower = category.lower()
                if category_lower in text or f" {category_lower} " in text:
                    match_score_components += 1
                    match_reasons.append(f"Category: {category}")

            if income in ["Below ₹1,00,000", "₹1,00,000 - ₹2,50,000"]:
                total_eval_components += 1
                if any(w in text for w in ["bpl", "below poverty line", "ews", "low income", "poor"]):
                    match_score_components += 1
                    match_reasons.append("Income Criteria Matched")
            elif income == "Above ₹8,00,000":
                if any(w in text for w in ["bpl", "below poverty line", "low income"]):
                    penalty_score -= 30

            if state:
                state_lower = state.lower()
                if state_lower in text:
                    match_reasons.append(f"State specific: {state}")
                    match_score_components += 1

        match_percentage = int((match_score_components / max(1, total_eval_components)) * 100) if profile else 0
        if match_percentage > 0:
            final_score += (match_percentage / 100.0) * 0.15

        if final_score >= threshold:
            if "tamil nadu" in text or "tamilnadu" in text:
                final_score += 50.0
            results.append((i, final_score, match_percentage, match_reasons))

    results.sort(key=lambda x: x[1], reverse=True)

    final_results = []
    for res in results[:top_k]:
        idx = res[0]
        score = res[1]
        match_pct = res[2] if len(res) > 2 else 0
        reasons = res[3] if len(res) > 3 else []
        scheme = df.iloc[idx]
        final_results.append({
            "name": scheme.get('scheme name', ''),
            "details": scheme.get('details', ''),
            "eligibility": scheme.get('eligibility', ''),
            "benefits": scheme.get('benefits', ''),
            "apply_link": scheme.get('apply link', ''),
            "ministry": scheme.get('ministries/departments', ''),
            "application_process": scheme.get('application process', ''),
            "documents_required": scheme.get('documents required', ''),
            "score": round(score, 3),
            "match_percentage": match_pct,
            "qualifying_reasons": reasons
        })

    return {"results": final_results, "total": len(results)}


@app.get("/health")
def health():
    return {"status": "ok", "schemes_loaded": len(df)}
