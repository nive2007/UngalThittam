// ══════════════════════════════════════════════════════════
//  GovScheme AI — app.js
//  Handles: Theme toggle | Language switching | Voice input
//           TTS (EN + Tamil) | Search | Translation pipeline
// ══════════════════════════════════════════════════════════

// ── THEME ──────────────────────────────────────────────────
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('govSchemeTheme', isLight ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isLight ? '🌙' : '☀️';
}

// ── LANGUAGE CONFIG ─────────────────────────────────────────
const LANGS = {
  ta: {
    placeholder: 'உங்கள் கேள்வியை இங்கே கேளுங்கள்...',
    listening: '🎙️ கேட்கிறேன்... பேசுங்கள்',
    noResult: 'எந்த திட்டமும் கிடைக்கவில்லை',
    noResultSub: 'வேறு வார்த்தைகளில் தேடுங்கள்',
    error: 'பின்தளத்தில் பிழை ஏற்பட்டது',
    searching: 'தேடுகிறோம்...',
    elig: 'தகுதி நிபந்தனைகள்',
    bene: 'பலன்கள்',
    desc: 'விவரங்கள்',
    apply_btn: '🌐 விண்ணப்பிக்க',
    apply_how: '📝 விண்ணப்பிக்கும் முறை',
    apply_steps: 'படிப்படியான வழிமுறைகள்',
    doc_req: 'தேவையான ஆவணங்கள்',
    more: 'மேலும் படிக்க',
    less: 'குறைக்க',
    divider: 'முடிவுகள்',
    lang: 'ta-IN',
    logo_sub: 'குரல் மூலம் அரசு திட்டங்களை எளிதாக அறியுங்கள்',
    chips: ['🌾 விவசாயிகள்', '🎓 மாணவர்கள்', '👩 பெண்கள்', '💰 கடன் திட்டங்கள்', '🏥 முதியோர்', '🏠 வீட்டு உதவி'],
    queries: ['விவசாயிகள் திட்டங்கள்', 'மாணவர் உதவித்தொகை', 'பெண்களுக்கான திட்டங்கள்', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['திட்டங்கள்', 'திறன் வாய்ந்த தேடல்', 'மொழிகள்'],
    footer: 'இது ஒரு AI உதவியாளர். அரசு திட்டங்களுக்கு அதிகாரப்பூர்வ இணையதளத்தை சரிபார்க்கவும்.'
  },
  en: {
    placeholder: 'Ask about any government scheme...',
    listening: '🎙️ Listening... speak now',
    noResult: 'No schemes found',
    noResultSub: 'Try different keywords',
    error: 'Backend error.',
    searching: 'Searching...',
    elig: 'Eligibility',
    bene: 'Benefits',
    desc: 'Description',
    apply_btn: '🌐 Apply Now',
    apply_how: '📝 How to Apply',
    apply_steps: 'Application Process',
    doc_req: 'Required Documents',
    more: 'Read more',
    less: 'Show less',
    divider: 'Results',
    lang: 'en-IN',
    logo_sub: 'Easily discover government schemes using your voice',
    chips: ['🌾 Farmers', '🎓 Students', '👩 Women', '💰 Loan Schemes', '🏥 Elderly', '🏠 Housing Help'],
    queries: ['farmer schemes', 'student scholarship', 'women schemes', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['Schemes', 'AI Search', 'Languages'],
    footer: 'This is an AI assistant. Please verify with official government websites.'
  },
  hi: {
    placeholder: 'कोई भी सरकारी योजना पूछें...',
    listening: '🎙️ सुन रहा हूँ... बोलिए',
    noResult: 'कोई योजना नहीं मिली',
    noResultSub: 'अलग शब्दों में खोजें',
    error: 'बैकएंड त्रुटि',
    searching: 'खोज रहे हैं...',
    elig: 'पात्रता',
    bene: 'लाभ',
    desc: 'विवरण',
    apply_btn: '🌐 अभी आवेदन करें',
    apply_how: '📝 आवेदन कैसे करें',
    apply_steps: 'आवेदन प्रक्रिया',
    doc_req: 'आवश्यक दस्तावेज़',
    more: 'और पढ़ें',
    less: 'कम करें',
    divider: 'परिणाम',
    lang: 'hi-IN',
    logo_sub: 'वॉयस के माध्यम से आसानी से सरकारी योजनाओं की खोज करें',
    chips: ['🌾 किसान', '🎓 छात्र', '👩 महिलाएं', '💰 ऋण योजनाएं', '🏥 बुजुर्ग', '🏠 आवास सहायता'],
    queries: ['farmer schemes', 'student scholarship', 'women schemes', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['योजनाएं', 'AI खोज', 'भाषाएं'],
    footer: 'यह एक एआई सहायक है। सरकारी वेबसाइटों से सत्यापित करें।'
  }
};

let currentLang = 'ta';

function setLang(lang) {
  if (!LANGS[lang]) lang = 'ta';
  currentLang = lang;
  localStorage.setItem('govSchemeLang', lang);

  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btn-' + lang);
  if (btn) btn.classList.add('active');

  const L = LANGS[lang];
  document.getElementById('query').placeholder = L.placeholder;
  document.getElementById('resultDivider').textContent = L.divider;
  document.getElementById('ui-subtitle').textContent = L.logo_sub;
  document.getElementById('ui-stat1').textContent = L.stats_labels[0];
  document.getElementById('ui-stat2').textContent = L.stats_labels[1];
  document.getElementById('ui-stat3').textContent = L.stats_labels[2];
  document.getElementById('ui-footer').textContent = L.footer;

  const chipsHtml = L.chips
    .map((c, i) => `<div class="chip" onclick="quickSearch('${L.queries[i]}')">${c}</div>`)
    .join('');
  document.getElementById('ui-chips').innerHTML = chipsHtml;

  if (typeof translateDynamicResults === 'function') {
    translateDynamicResults(lang);
  }
}

// ── VOICE RECOGNITION ──────────────────────────────────────
let recognition = null;
let isListening = false;
let finalTranscript = '';

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('உங்கள் browser-ல் voice recognition இல்லை. Chrome பயன்படுத்தவும்.');
    return;
  }

  if (isListening) {
    recognition && recognition.abort();
    stopVoiceUI();
    return;
  }

  finalTranscript = '';
  recognition = new SpeechRecognition();
  recognition.lang = LANGS[currentLang].lang;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  const micBtn = document.getElementById('micBtn');
  const status = document.getElementById('voiceStatus');
  const queryEl = document.getElementById('query');

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micBtn.textContent = '⏹';
    status.textContent = LANGS[currentLang].listening;
    status.classList.add('show');
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        let best = event.results[i][0];
        for (let j = 1; j < event.results[i].length; j++) {
          if (event.results[i][j].confidence > best.confidence) best = event.results[i][j];
        }
        finalTranscript += best.transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    queryEl.value = finalTranscript || interim;
  };

  recognition.onerror = (e) => {
    if (e.error === 'no-speech') status.textContent = '🔇 குரல் கிடைக்கவில்லை — மீண்டும் முயற்சிக்கவும்';
    else if (e.error === 'not-allowed') status.textContent = '🚫 Microphone அனுமதி தேவை';
    else status.textContent = '❌ பிழை: ' + e.error;
    setTimeout(() => status.classList.remove('show'), 3000);
    stopVoiceUI();
  };

  recognition.onend = () => {
    stopVoiceUI();
    if (finalTranscript.trim()) {
      queryEl.value = finalTranscript.trim();
      search();
    }
  };

  try {
    recognition.start();
  } catch (e) {
    status.textContent = '❌ Microphone தொடங்கவில்லை';
    status.classList.add('show');
    setTimeout(() => status.classList.remove('show'), 3000);
  }
}

function stopVoiceUI() {
  isListening = false;
  const micBtn = document.getElementById('micBtn');
  micBtn.classList.remove('listening');
  micBtn.textContent = '🎤';
  setTimeout(() => document.getElementById('voiceStatus').classList.remove('show'), 1800);
}

// ── TTS — AUDIO CONTROLS ───────────────────────────────────
let currentAudio = null;
const translateCache = {};
let isSpeechPaused = false;

function showAudioControls() {
  const ctrl = document.getElementById('audio-controls');
  const pauseBtn = document.getElementById('pauseBtn');
  const wave = document.getElementById('audio-wave-anim');
  if (ctrl) ctrl.style.display = 'flex';
  isSpeechPaused = false;
  if (pauseBtn) pauseBtn.textContent = '⏸️';
  if (wave) wave.classList.remove('paused');
}

function hideAudioControls() {
  const ctrl = document.getElementById('audio-controls');
  if (ctrl) ctrl.style.display = 'none';
  isSpeechPaused = false;
}

function togglePauseSynthesis() {
  const pauseBtn = document.getElementById('pauseBtn');
  const wave = document.getElementById('audio-wave-anim');

  if (isSpeechPaused) {
    window.speechSynthesis && window.speechSynthesis.resume();
    if (currentAudio) currentAudio.play();
    isSpeechPaused = false;
    if (pauseBtn) pauseBtn.textContent = '⏸️';
    if (wave) wave.classList.remove('paused');
  } else {
    window.speechSynthesis && window.speechSynthesis.pause();
    if (currentAudio) currentAudio.pause();
    isSpeechPaused = true;
    if (pauseBtn) pauseBtn.textContent = '▶️';
    if (wave) wave.classList.add('paused');
  }
}

let ttsSession = 0;

function stopAll() {
  ttsSession++;
  window.speechSynthesis && window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  hideAudioControls();
}

// Speak text in chunks (Chrome TTS stability fix)
function speakChunksBrowserSync(text, langCode, rate, btnEl) {
  window.speechSynthesis.cancel();
  ttsSession++;
  let currentSession = ttsSession;
  showAudioControls();

  const chunks = chunkText(text, 160);
  let i = 0;

  function speakNext() {
    if (currentSession !== ttsSession) return;
    if (i >= chunks.length) {
      if (btnEl) setBtnState(btnEl, false);
      hideAudioControls();
      return;
    }

    const utter = new SpeechSynthesisUtterance(chunks[i].trim());
    utter.lang = langCode;
    utter.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.includes(langCode.split('-')[0]));
    if (targetVoice) utter.voice = targetVoice;

    utter.onend = () => { if (currentSession === ttsSession) { i++; speakNext(); } };
    utter.onerror = (e) => {
      console.error('Speech Error:', e);
      if (currentSession === ttsSession) { i++; speakNext(); }
    };

    window.speechSynthesis.speak(utter);
  }

  setTimeout(speakNext, 100);
}

// Speak English text
function speakEnglish(englishText, btnEl) {
  stopAll();
  setBtnState(btnEl, true, '🔊');
  speakChunksBrowserSync(englishText, 'en-IN', 0.88, btnEl);
}

// Translate English → Tamil, then speak
async function speakTamilTranslated(englishText, btnEl) {
  stopAll();
  setBtnState(btnEl, true, '⏳');

  try {
    let tamilText = translateCache[englishText];

    if (!tamilText) {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(englishText)}`;
      const res = await fetch(url);
      const data = await res.json();
      let translated = '';
      if (data && data[0]) {
        for (let j = 0; j < data[0].length; j++) {
          if (data[0][j][0]) translated += data[0][j][0];
        }
      }
      tamilText = translated || englishText;
      translateCache[englishText] = tamilText;
    }

    setBtnState(btnEl, true, '🔊');
    speakChunksBrowserSync(tamilText, 'ta-IN', 0.85, btnEl);
  } catch (e) {
    console.error('TTS Error:', e);
    speakChunksBrowserSync(englishText, 'en-IN', 0.85, btnEl);
  }
}

function setBtnState(btn, active, icon) {
  if (!btn) return;
  if (active) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    if (icon) btn.textContent = icon + ' ' + btn.dataset.label;
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.textContent = '🔊 ' + btn.dataset.label;
  }
}

function chunkText(text, maxLen) {
  const words = text.split(' ');
  const chunks = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).length > maxLen && cur) { chunks.push(cur.trim()); cur = w; }
    else cur += (cur ? ' ' : '') + w;
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}

function playChunksAsync(chunks) {
  ttsSession++;
  let currentSession = ttsSession;
  return new Promise((resolve) => {
    let idx = 0;
    function next() {
      if (currentSession !== ttsSession) { resolve('canceled'); return; }
      while (idx < chunks.length && !chunks[idx].trim()) idx++;
      if (idx >= chunks.length) { resolve(); return; }
      const encoded = encodeURIComponent(chunks[idx++].trim());
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;
      currentAudio = new Audio(url);
      showAudioControls();
      currentAudio.onended = next;
      currentAudio.onerror = () => { hideAudioControls(); resolve('fallback'); };
      currentAudio.play().catch(() => { hideAudioControls(); resolve('fallback'); });
    }
    next();
  }).then((res) => {
    if (res !== 'fallback' && res !== 'canceled') hideAudioControls();
    return res;
  });
}

// ── QUICK CHIP ──────────────────────────────────────────────
function quickSearch(q) {
  document.getElementById('query').value = q;
  search();
}

// ── SEARCH ──────────────────────────────────────────────────
async function search() {
  const query = document.getElementById('query').value.trim();
  if (!query) return;

  const L = LANGS[currentLang];
  const resultDiv = document.getElementById('result');
  const divider = document.getElementById('resultDivider');

  divider.style.display = 'flex';
  resultDiv.innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <p>${L.searching}</p>
    </div>`;

  try {
    const res = await fetch('http://127.0.0.1:8000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultDiv.innerHTML = `
        <div class="state-box">
          <div class="icon">🔍</div>
          <p><strong>${L.noResult}</strong></p>
          <p style="margin-top:6px;font-size:0.82rem">${L.noResultSub}</p>
        </div>`;
      return;
    }

    // ── Helpers ──
    function fixRupee(t) {
      if (!t) return t;
      return String(t).replace(/\?(?=[\d,])/g, '₹');
    }

    function cleanText(raw) {
      if (!raw) return '-';
      let t = String(raw);
      t = fixRupee(t);
      t = t.replace(/^\s*\[/, '').replace(/\]\s*$/, '');
      if (t.includes("', '") || t.includes('", "') || t.includes("','") || t.includes('","')) {
        const parts = t.split(/['"]\s*,\s*['"]/).map(s => s.replace(/^['"\s]+|['"\s]+$/g, '').trim()).filter(Boolean);
        t = parts.map(s => '• ' + s).join('\n');
      } else {
        t = t.replace(/^['"\s]+|['"\s]+$/g, '').trim();
      }
      t = t.replace(/\\n/g, '\n');
      return t;
    }

    function textToHtml(text) {
      return cleanText(text).replace(/\n/g, '<br>');
    }

    // ── Build result cards ──
    let html = '';
    data.results.forEach((item, i) => {
      const eligId = 'elig-' + i;
      const beneId = 'bene-' + i;
      const descId = 'desc-' + i;
      const descClean = cleanText(item.details || '');
      const enText = fixRupee(`${item.name}. ${descClean}`);
      const safeEnText = encodeURIComponent(enText);

      html += `
        <div class="scheme-card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <div class="card-index">${i + 1}</div>
            <div class="card-title">${item.name || 'N/A'}</div>
          </div>
          <div class="tts-group card-tts">
            <button class="tts-btn tts-en" data-label="EN" data-text="${safeEnText}"
              onclick="speakEnglish(decodeURIComponent(this.dataset.text), this)"
              title="Read in English">🔊 EN</button>
            <button class="tts-btn tts-ta" data-label="தமிழ்" data-text="${safeEnText}"
              onclick="speakTamilTranslated(decodeURIComponent(this.dataset.text), this)"
              title="தமிழில் மொழிபெயர்த்து கேளுங்கள்">🔊 தமிழ்</button>
          </div>

          ${descClean && descClean !== '-' ? `
          <div class="card-section">
            <div class="section-label desc" style="color:var(--accent)">📋 ${L.desc || 'விவரங்கள் / Details'}</div>
            <div class="section-text collapsed" id="${descId}">${textToHtml(item.details)}</div>
            <button class="read-more" onclick="toggleText('${descId}', this)">${L.more} ↓</button>
          </div>` : ''}

          <div class="card-section">
            <div class="section-label elig">✅ ${L.elig}</div>
            <div class="section-text collapsed" id="${eligId}">${textToHtml(item.eligibility)}</div>
            <button class="read-more" onclick="toggleText('${eligId}', this)">${L.more} ↓</button>
          </div>

          <div class="card-section">
            <div class="section-label bene">🎁 ${L.bene}</div>
            <div class="section-text collapsed" id="${beneId}">${textToHtml(item.benefits)}</div>
            <button class="read-more" onclick="toggleText('${beneId}', this)">${L.more} ↓</button>
          </div>

          <div class="action-btn-row">
            ${item.apply_link ? `
            <a class="apply-btn" href="${item.apply_link}" target="_blank" rel="noopener noreferrer">
              ${L.apply_btn || '🌐 Apply Now'}
            </a>` : ''}
            ${(item.application_process && item.application_process !== '-') ||
          (item.documents_required && item.documents_required !== '-') ? `
            <button class="apply-btn secondary" data-label="${L.apply_how || '📝 How to Apply'}"
              onclick="toggleApplyBox('apply-box-${i}', this)">
              ${L.apply_how || '📝 How to Apply'}
            </button>` : ''}
          </div>

          ${(item.application_process && item.application_process !== '-') ||
          (item.documents_required && item.documents_required !== '-') ? `
          <div class="apply-box" id="apply-box-${i}">
            ${item.application_process && item.application_process !== '-' ? `
              <div class="section-label apply-steps" style="color:var(--accent2)">📋 ${L.apply_steps || 'Application Process'}</div>
              <div class="section-text" style="display:block; margin-bottom:12px;">${textToHtml(item.application_process)}</div>
            ` : ''}
            ${item.documents_required && item.documents_required !== '-' ? `
              <div class="section-label doc-req" style="color:var(--accent3)">📄 ${L.doc_req || 'Documents Required'}</div>
              <div class="section-text" style="display:block;">${textToHtml(item.documents_required)}</div>
            ` : ''}
          </div>` : ''}

        </div>`;
    });

    resultDiv.innerHTML = html;

    if (typeof translateDynamicResults === 'function') {
      translateDynamicResults(currentLang);
    }

  } catch (err) {
    resultDiv.innerHTML = `
      <div class="state-box">
        <div class="icon">⚠️</div>
        <p>${L.error}</p>
      </div>`;
  }
}

// ── APPLY BOX TOGGLE ────────────────────────────────────────
function toggleApplyBox(id, btn) {
  stopAll();
  const box = document.getElementById(id);
  const isOpen = box.classList.contains('open');

  if (isOpen) {
    box.classList.remove('open');
    setBtnState(btn, false);
  } else {
    document.querySelectorAll('.apply-box.open').forEach(b => b.classList.remove('open'));
    box.classList.add('open');
    setBtnState(btn, true, '🔊');

    let fullText = '';
    const stepsL = box.querySelector('.apply-steps');
    const docsL = box.querySelector('.doc-req');
    const textBlocks = box.querySelectorAll('.section-text');

    if (stepsL && textBlocks[0]) fullText += stepsL.innerText + '. ' + textBlocks[0].innerText + '. ';
    if (docsL && textBlocks.length > 1) fullText += docsL.innerText + '. ' + textBlocks[1].innerText + '. ';
    else if (docsL && textBlocks.length === 1 && !stepsL) fullText += docsL.innerText + '. ' + textBlocks[0].innerText + '. ';

    const langCode = currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    speakChunksBrowserSync(fullText, langCode, 0.85, btn);
  }
}

// ── READ MORE TOGGLE ────────────────────────────────────────
function toggleText(id, btn) {
  const L = LANGS[currentLang];
  const el = document.getElementById(id);

  if (el.classList.contains('collapsed')) {
    el.classList.remove('collapsed');
    btn.textContent = L.less + ' ↑';
    stopAll();
    const langCode = currentLang === 'ta' ? 'ta-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    speakChunksBrowserSync(el.innerText, langCode, 0.85, null);
  } else {
    el.classList.add('collapsed');
    btn.textContent = L.more + ' ↓';
    stopAll();
  }
}

// ── TRANSLATION PIPELINE ────────────────────────────────────
async function translateToLang(text, targetLang) {
  if (!text || text === '-') return text;
  if (targetLang === 'en') return text;

  const cacheKey = targetLang + ':' + text;
  if (translateCache[cacheKey]) return translateCache[cacheKey];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    let translated = '';
    if (data && data[0]) {
      for (let j = 0; j < data[0].length; j++) {
        if (data[0][j][0]) translated += data[0][j][0];
      }
    }
    translated = translated || text;
    translateCache[cacheKey] = translated;
    return translated;
  } catch (err) {
    console.error('Translation API error', err);
    return text;
  }
}

async function translateDynamicResults(targetLang) {
  const L = LANGS[targetLang];
  const resultDiv = document.getElementById('result');
  if (!resultDiv) return;

  // Instant label swaps
  document.querySelectorAll('.section-label.elig').forEach(el => el.innerHTML = `✅ ${L.elig}`);
  document.querySelectorAll('.section-label.bene').forEach(el => el.innerHTML = `🎁 ${L.bene}`);
  document.querySelectorAll('.section-label.desc').forEach(el => el.innerHTML = `📋 ${L.desc}`);
  document.querySelectorAll('.section-label.apply-steps').forEach(el => el.innerHTML = `📋 ${L.apply_steps}`);
  document.querySelectorAll('.section-label.doc-req').forEach(el => el.innerHTML = `📄 ${L.doc_req}`);

  document.querySelectorAll('.read-more').forEach(el => {
    el.textContent = el.textContent.includes('↓') ? `${L.more} ↓` : `${L.less} ↑`;
  });
  document.querySelectorAll('.apply-btn:not(.secondary)').forEach(el => el.innerHTML = L.apply_btn);
  document.querySelectorAll('.apply-btn.secondary').forEach(el => {
    el.dataset.label = L.apply_how;
    el.innerHTML = el.disabled ? '🔊 ' + L.apply_how : L.apply_how;
  });

  if (targetLang === 'en') {
    document.querySelectorAll('.card-title, .section-text').forEach(el => {
      if (el.dataset.origText) el.innerHTML = el.dataset.origText.replace(/\n/g, '<br>');
    });
    return;
  }

  // Async content translation
  const elements = document.querySelectorAll('.card-title, .section-text');
  for (const el of elements) {
    if (el.dataset.translated === targetLang) continue;
    let origText = el.dataset.origText;
    if (!origText) { origText = el.innerText; el.dataset.origText = origText; }
    const translatedText = await translateToLang(origText, targetLang);
    el.innerHTML = translatedText.replace(/\n/g, '<br>');
    el.dataset.translated = targetLang;
  }
}

// ── INITIALIZATION ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore theme
  if (localStorage.getItem('govSchemeTheme') === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeBtn').textContent = '🌙';
  }

  // Restore language
  const savedLang = localStorage.getItem('govSchemeLang') || 'ta';
  setLang(savedLang);

  // Enter key search
  document.getElementById('query').addEventListener('keydown', e => {
    if (e.key === 'Enter') search();
  });
});