# உங்கள் திட்டம் — UngalThittam 🇮🇳

> **AI-powered Indian Government Scheme Discovery Platform**  
> Search 1,000+ government schemes in Tamil, English & Hindi — with voice input, smart profile matching, and text-to-speech narration.

---

## 📌 Overview

**UngalThittam** (உங்கள் திட்டம் — *"Your Scheme"*) is a multilingual, AI-driven web application that helps Indian citizens discover government welfare schemes they are eligible for — simply by describing their needs in their own language.

Built for a Hackathon, it combines semantic AI search, profile-based personalization, and an accessible UI designed to serve rural and urban users alike.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **AI Semantic Search** | Uses `sentence-transformers` + cosine similarity to find the most relevant schemes |
| 🎙️ **Voice Input** | Search via microphone using the Web Speech API |
| 🌐 **3-Language UI** | Full interface localization in Tamil, English, and Hindi |
| 👤 **Profile-Based Matching** | Personalized results based on age, gender, income, occupation, state, and disability status |
| 🏆 **Tamil Nadu Priority Boost** | Automatically surfaces Tamil Nadu-specific schemes for local users |
| 📖 **Text-to-Speech Narration** | Listen to scheme details with chunked TTS playback (pause, play, rewind, forward) |
| 🌗 **Light / Dark Theme** | Persistent theme toggle inspired by government portal aesthetics |
| 📋 **Application Tracker** | Save and track schemes you've applied for (stored per user) |
| 🔒 **Privacy by Design** | All user data stored locally in SQLite — no external data sharing |

---

## 🗂️ Project Structure

```
UngalThittam/
├── app2.py                 # FastAPI backend — AI search engine & REST API
├── index.html              # Main application page
├── login.html              # User registration / login page
├── app.js                  # Frontend logic (search, profile, TTS, localization)
├── login.js                # Login/registration frontend logic
├── style.css               # Full responsive stylesheet (light + dark themes)
├── schemes.csv             # Dataset of 1,000+ Indian government schemes
├── scheme_embeddings.npy   # Pre-computed AI embeddings (auto-generated on first run)
├── govscheme_users.db      # SQLite user database (auto-created on first run)
└── requirements.txt        # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Python **3.9+**
- `pip` package manager

### 1. Clone the Repository

```bash
git clone https://github.com/nive2007/UngalThittam.git
cd UngalThittam
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
uvicorn app2:app --reload --host 0.0.0.0 --port 8000
```

> ⏳ **First launch** will encode all 1,000+ schemes into AI embeddings — this takes ~1–2 minutes.  
> Subsequent starts load the cached `scheme_embeddings.npy` instantly.

### 4. Open in Browser

```
http://localhost:8000
```

---

## 🌐 Accessing from Mobile (via Ngrok)

To test on a mobile device on the same or different network:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 8000
```

Copy the `https://xxxx.ngrok.io` URL and open it on your mobile browser.

> ⚠️ Make sure `app.js` and `login.js` use a **dynamic base URL** (not hardcoded `localhost`) when accessing via Ngrok.

---

## 🔌 API Reference

The backend exposes a REST API at `http://localhost:8000`.

### Search Schemes

```http
POST /ask
Content-Type: application/json

{
  "query": "விவசாயிகள் திட்டங்கள்",
  "top_k": 10,
  "threshold": 0.38,
  "profile": {
    "gender": "Male",
    "age_bracket": "26-35",
    "income_range": "Below ₹1,00,000",
    "state": "Tamil Nadu",
    "category": "OBC",
    "occupation": { "sector": "Agriculture" },
    "disability": { "status": "None" }
  }
}
```

### User Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `GET` | `/user/{user_id}` | Get user profile |
| `PUT` | `/user/{user_id}` | Update user profile |
| `POST` | `/user/{user_id}/apply` | Mark a scheme as applied |
| `GET` | `/user/{user_id}/applications` | Get all applied schemes |
| `DELETE` | `/user/{user_id}/apply/{scheme_name}` | Remove an applied scheme |
| `GET` | `/health` | Server health check |

---

## 🤖 AI Search Architecture

```
User Query (Tamil / English / Hindi)
        │
        ▼
Tamil Keyword Expansion  ──►  Adds English translations for Tamil terms
        │
        ▼
Sentence Embedding  ──►  paraphrase-multilingual-MiniLM-L12-v2
        │
        ▼
Cosine Similarity  ──►  vs. 1,000+ pre-computed scheme embeddings
        │
        ▼
Profile Scoring  ──►  Gender, Age, Income, State, Occupation, Disability filters
        │
        ▼
Keyword Boost  ──►  Rewards strong thematic matches (farmer, student, women…)
        │
        ▼
TN Priority Boost  ──►  Tamil Nadu schemes surfaced first for TN users
        │
        ▼
Top-K Ranked Results
```

---

## 🛠️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [sentence-transformers](https://www.sbert.net/) — Multilingual AI embeddings (`paraphrase-multilingual-MiniLM-L12-v2`)
- [scikit-learn](https://scikit-learn.org/) — Cosine similarity
- [pandas](https://pandas.pydata.org/) + [numpy](https://numpy.org/) — Data processing
- [SQLite](https://www.sqlite.org/) — Lightweight local user database

**Frontend**
- Vanilla HTML, CSS, JavaScript — Zero framework dependencies
- Web Speech API — Voice input & TTS narration
- Google Fonts — Noto Sans Tamil, Poppins, Tiro Devanagari Hindi

---

## 📦 Dependencies

```txt
fastapi
uvicorn
pandas
numpy
sentence-transformers
scikit-learn
```

---

## 🎯 Supported Languages

| Language | Script | UI | Search |
|---|---|---|---|
| Tamil | தமிழ் | ✅ | ✅ |
| English | English | ✅ | ✅ |
| Hindi | हिंदी | ✅ | ✅ |

---

## 📸 Key Pages

| Page | File | Description |
|---|---|---|
| Main App | `index.html` | Search, results, profile sidebar, TTS controls |
| Login / Register | `login.html` | User ID creation and profile setup |

---

## 🔐 Privacy & Data

- User data is stored **only** in a local `govscheme_users.db` SQLite file on your machine.
- No data is sent to external servers.
- User IDs are randomly generated 8-character alphanumeric codes (e.g. `A3F2B1C4`).

---

## 🙌 Acknowledgements

- Scheme data sourced from publicly available Indian government portals.
- Built with ❤️ for the people of India — especially Tamil Nadu.

---

## 📄 License

This project is open-source and free to use for educational and non-commercial purposes.

---

*உங்கள் திட்டம் — Your Scheme. Your Right. Your Future.* 🇮🇳
