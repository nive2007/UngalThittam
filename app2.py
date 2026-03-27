import os
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load dataset ──
df = pd.read_csv("schemes.csv", encoding="latin1", engine="python", on_bad_lines="skip")
df.columns = df.columns.str.strip().str.lower()

# ── Fix corrupted rupee symbol (? before digits → ₹) ──
import re as _re
def fix_rupee(val):
    if isinstance(val, str):
        return _re.sub(r'\?(?=[\d,])', '\u20b9', val)
    return val
df = df.applymap(fix_rupee)

# ── Load model ──
print("Loading AI model...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# ── Tamil keyword map → English expansion ──
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

# ── Combine columns for embedding ──
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
        print("Dataset length changed! Re-encoding scheme embeddings...")
        scheme_embeddings = model.encode(df['combined_text'].tolist(), show_progress_bar=True)
        np.save(EMBEDDINGS_FILE, scheme_embeddings)
else:
    print("Encoding scheme embeddings for the first time...")
    scheme_embeddings = model.encode(df['combined_text'].tolist(), show_progress_bar=True)
    np.save(EMBEDDINGS_FILE, scheme_embeddings)

print("✅ Ready!")

# ── Keyword boost map ──
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

# ── API endpoint ──
@app.post("/ask")
def ask(data: dict):
    query = data.get("query", "").strip()
    top_k = data.get("top_k", 10)
    threshold = data.get("threshold", 0.38)

    if not query:
        return {"results": []}

    # Expand Tamil → English
    expanded_query = expand_tamil_query(query)
    final_query = f"{expanded_query} scheme government benefits eligibility subsidy loan help"

    query_embedding = model.encode([final_query])
    similarities = cosine_similarity(query_embedding, scheme_embeddings)[0]

    results = []
    for i, score in enumerate(similarities):
        text = df.iloc[i]['combined_text'].lower()
        bonus = keyword_boost(query.lower(), text)
        final_score = float(score) + bonus

        if final_score >= threshold:
            # Boost Tamil Nadu schemes to the top of the valid results
            if "tamil nadu" in text or "tamilnadu" in text:
                final_score += 50.0
            results.append((i, final_score))

    results.sort(key=lambda x: x[1], reverse=True)

    final_results = []
    for idx, score in results[:top_k]:
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
        })

    return {"results": final_results, "total": len(results)}

@app.get("/health")
def health():
    return {"status": "ok", "schemes_loaded": len(df)}