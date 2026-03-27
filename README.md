# UngalThittam
# 🏛️ GovScheme AI – Smart Government Scheme Assistant

GovScheme AI is an intelligent web-based assistant that helps users discover relevant government schemes using natural language queries, voice input, and AI-powered search.

It supports multilingual interaction (Tamil, English, Hindi), provides scheme details like eligibility and benefits, and includes voice output with translation for better accessibility.

---

## 🚀 Features

### 🔍 Smart Search

* Ask questions in natural language
* AI-powered matching using embeddings + keyword filtering

### 🎤 Voice Input

* Speak your query instead of typing
* Supports Tamil, English, and Hindi

### 🔊 Voice Output (TTS)

* English voice support
* Tamil voice with translation

### 🌐 Multilingual Support

* Tamil 🇮🇳
* English 🇬🇧
* Hindi 🇮🇳

### 📊 UI Highlights

* Clean modern UI
* Card-based results
* Expandable sections

---

## 🧠 Tech Stack

### Frontend

* HTML, CSS, JavaScript
* Web Speech API

### Backend

* FastAPI
* Uvicorn

### AI / ML

* Sentence Transformers
* FAISS

---

## ⚙️ Requirements

Make sure you have:

* Python **3.9+**
* pip (Python package manager)

### 📦 Install Dependencies

Run this command:

```bash
pip install fastapi uvicorn pandas numpy faiss-cpu sentence-transformers
```

---
## ⚙️ Setup & Run

### 1️⃣ Install dependencies

```bash
pip install fastapi uvicorn pandas numpy faiss-cpu sentence-transformers
```

---

### 2️⃣ Run backend

```bash
uvicorn app:app --reload
```

👉 Runs on: http://127.0.0.1:8000

---

### 3️⃣ Open frontend

* Open `index.html` in browser
  OR
* Use VS Code Live Server

---

## 🔗 API

### POST `/ask`

Request:

```json
{
  "query": "pension schemes"
}
```

Response:

```json
{
  "results": [
    {
      "name": "Scheme Name",
      "eligibility": "...",
      "benefits": "...",
      "apply_link": "..."
    }
  ]
}
```

---

## 🧪 How It Works

1. User enters query (text or voice)
2. Query → embeddings
3. FAISS finds similar schemes
4. Results displayed
5. Voice + translation available

---

## 🎯 Use Cases

* Citizens finding schemes
* Rural accessibility (voice)
* Multilingual support

---

## ⚠️ Notes

* Not an official government portal
* Verify from official sites
* Translation may not be perfect

---

## 🔥 Future Improvements

* Personalization
* Mobile app
* Better translation models
* Recommendation system

---

## ❤️ Final Note

GovScheme AI simplifies access to government schemes using AI, voice, and multilingual support.

✨ “Making schemes accessible to everyone”
