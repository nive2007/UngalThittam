// ══════════════════════════════════════════════════════════
//  GovScheme AI — app.js
//  Changes from original:
//    • Profile stored in backend DB — only user_id in localStorage
//    • One-time login — if user_id exists, profile is fetched from DB
//    • Sidebar shows User ID + Applied Schemes panel
//    • Each scheme card has "Track Application" button
//    • Profile modal replaced with "Edit Profile" PUT request
// ══════════════════════════════════════════════════════════

const API_BASE = "";

// -- THEME ----------------------------------------------------------
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('govSchemeTheme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('themeBtn');
  btn.textContent = isLight ? '🌙' : '☀️';
  btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

// -- ARIA LIVE ANNOUNCER --------------------------------------------
function announce(message) {
  const region = document.getElementById('aria-live-region');
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(function() { region.textContent = message; });
}


// ── LANGUAGE CONFIG ─────────────────────────────────────────
const LANGS = {
  ta: {
    placeholder:  'உங்கள் கேள்வியை இங்கே கேளுங்கள்...',
    listening:    '🎙️ கேட்கிறேன்... பேசுங்கள்',
    noResult:     'எந்த திட்டமும் கிடைக்கவில்லை',
    noResultSub:  'வேறு வார்த்தைகளில் தேடுங்கள்',
    error:        'பின்தளத்தில் பிழை ஏற்பட்டது',
    searching:    'தேடுகிறோம்...',
    elig:         'தகுதி நிபந்தனைகள்',
    bene:         'பலன்கள்',
    desc:         'விவரங்கள்',
    apply_btn:    '🌐 விண்ணப்பிக்க',
    apply_how:    '📝 விண்ணப்பிக்கும் முறை',
    apply_steps:  'படிப்படியான வழிமுறைகள்',
    doc_req:      'தேவையான ஆவணங்கள்',
    more:         'மேலும் படிக்க',
    less:         'குறைக்க',
    divider:      'முடிவுகள்',
    lang:         'ta-IN',
    logo_sub:     'குரல் மூலம் அரசு திட்டங்களை எளிதாக அறியுங்கள்',
    chips:        ['🌾 விவசாயிகள்', '🎓 மாணவர்கள்', '👩 பெண்கள்', '💰 கடன் திட்டங்கள்', '🏥 முதியோர்', '🏠 வீட்டு உதவி'],
    queries:      ['விவசாயிகள் திட்டங்கள்', 'மாணவர் உதவித்தொகை', 'பெண்களுக்கான திட்டங்கள்', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['திட்டங்கள்', 'திறன் வாய்ந்த தேடல்', 'மொழிகள்'],
    footer:       'இது ஒரு AI உதவியாளர். அரசு திட்டங்களுக்கு அதிகாரப்பூர்வ இணையதளத்தை சரிபார்க்கவும்.',
    profile_setup: 'Login / Setup',
    edit_profile: 'சுயவிவரம் திருத்து',
    completion: 'நிறைவு',
    privacy_txt: 'தனிப்பட்ட தரவு உங்கள் சாதனத்தில் மட்டுமே பாதுகாப்பாக சேமிக்கப்படுகிறது.',
    why_qualify: 'நீங்கள் ஏன் தகுதியானவர்',
    modal_title: 'உங்கள் சுயவிவரத்தை நிரப்பவும்',
    modal_desc: 'தனிப்பயனாக்கப்பட்ட திட்டங்களுக்கு உங்கள் விவரங்களை வழங்கவும்.',
    rec_title: '⭐ உங்களுக்காக பரிந்துரைக்கப்பட்டவை',
    rec_txt: 'உங்கள் வயது, வருமானம் மற்றும் வேலை அடிப்படையில்.',
    check_all: 'அனைத்து தகுதியான திட்டங்களையும் தேடு',
    matching_header: 'உங்கள் சுயவிவரத்துடன் தொடர்புடைய திட்டங்கள்: {NAME} | ₹{INCOME} | {OCC}',
    track_apply: '📌 விண்ணப்பத்தை கண்காணி',
    tracked: '✅ கண்காணிக்கப்படுகிறது',
    applied_schemes_title: 'விண்ணப்பிக்கப்பட்ட திட்டங்கள்',
    no_applications: 'இன்னும் எந்த திட்டத்திலும் விண்ணப்பிக்கவில்லை',
    your_id: 'உங்கள் ID'
  },
  en: {
    placeholder:  'Ask about any government scheme...',
    listening:    '🎙️ Listening... speak now',
    noResult:     'No schemes found',
    noResultSub:  'Try different keywords',
    error:        'Backend error.',
    searching:    'Searching...',
    elig:         'Eligibility',
    bene:         'Benefits',
    desc:         'Description',
    apply_btn:    '🌐 Search',
    apply_how:    '📝 How to Apply',
    apply_steps:  'Application Process',
    doc_req:      'Required Documents',
    more:         'Read more',
    less:         'Show less',
    divider:      'Results',
    lang:         'en-IN',
    logo_sub:     'Easily discover government schemes using your voice',
    chips:        ['🌾 Farmers', '🎓 Students', '👩 Women', '💰 Loan Schemes', '🏥 Elderly', '🏠 Housing Help'],
    queries:      ['farmer schemes', 'student scholarship', 'women schemes', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['Schemes', 'AI Search', 'Languages'],
    footer:       'This is an AI assistant. Please verify with official government websites.',
    profile_setup: 'Login / Setup',
    edit_profile: 'Edit Profile',
    completion: 'Completion',
    privacy_txt: 'Data is stored securely in the server database.',
    why_qualify: 'Why you qualify',
    modal_title: 'Complete Your Profile',
    modal_desc: 'Provide details for personalized schemes.',
    rec_title: '⭐ Top Recommended for You',
    rec_txt: 'Based on your age, income, and occupation.',
    check_all: 'Check All Eligible Schemes',
    matching_header: 'Showing all schemes matching your profile: {NAME} | ₹{INCOME} | {OCC}',
    track_apply: '📌 Track Application',
    tracked: '✅ Tracked',
    applied_schemes_title: 'Applied Schemes',
    no_applications: 'No schemes tracked yet',
    your_id: 'Your ID'
  },
  hi: {
    placeholder:  'कोई भी सरकारी योजना पूछें...',
    listening:    '🎙️ सुन रहा हूँ... बोलिए',
    noResult:     'कोई योजना नहीं मिली',
    noResultSub:  'अलग शब्दों में खोजें',
    error:        'बैकएंड त्रुटि',
    searching:    'खोज रहे हैं...',
    elig:         'पात्रता',
    bene:         'लाभ',
    desc:         'विवरण',
    apply_btn:    '🌐 अभी आवेदन करें',
    apply_how:    '📝 आवेदन कैसे करें',
    apply_steps:  'आवेदन प्रक्रिया',
    doc_req:      'आवश्यक दस्तावेज़',
    more:         'और पढ़ें',
    less:         'कम करें',
    divider:      'परिणाम',
    lang:         'hi-IN',
    logo_sub:     'वॉयस के माध्यम से आसानी से सरकारी योजनाओं की खोज करें',
    chips:        ['🌾 किसान', '🎓 छात्र', '👩 महिलाएं', '💰 ऋण योजनाएं', '🏥 बुजुर्ग', '🏠 आवास सहायता'],
    queries:      ['farmer schemes', 'student scholarship', 'women schemes', 'loan subsidy scheme', 'health scheme elderly', 'housing scheme poor'],
    stats_labels: ['योजनाएं', 'AI खोज', 'भाषाएं'],
    footer:       'यह एक एआई सहायक है। सरकारी वेबसाइटों से सत्यापित करें।',
    profile_setup: 'लॉगिन / सेटअप',
    edit_profile: 'प्रोफ़ाइल संपादित करें',
    completion: 'पूर्णता',
    privacy_txt: 'डेटा सुरक्षित रूप से सर्वर डेटाबेस में संग्रहीत है।',
    why_qualify: 'आप योग्य क्यों हैं',
    modal_title: 'अपनी प्रोफ़ाइल पूरी करें',
    modal_desc: 'व्यक्तिगत योजनाओं के लिए विवरण प्रदान करें।',
    rec_title: '⭐ आपके लिए अनुशंसित',
    rec_txt: 'आपकी आयु, आय और व्यवसाय के आधार पर।',
    check_all: 'सभी पात्र योजनाओं की जांच करें',
    matching_header: 'वे सभी योजनाएं जो आपकी प्रोफ़ाइल से मेल खाती हैं: {NAME} | ₹{INCOME} | {OCC}',
    track_apply: '📌 आवेदन ट्रैक करें',
    tracked: '✅ ट्रैक किया गया',
    applied_schemes_title: 'आवेदित योजनाएं',
    no_applications: 'अभी तक कोई योजना नहीं',
    your_id: 'आपकी ID'
  }
};

let currentLang = 'ta';

function setLang(lang) {
  if (!LANGS[lang]) lang = 'ta';
  currentLang = lang;
  localStorage.setItem('govSchemeLang', lang);

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  const btn = document.getElementById('btn-' + lang);
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }

  // Update html lang attribute
  const htmlEl = document.documentElement;
  htmlEl.lang = lang === 'hi' ? 'hi' : lang === 'en' ? 'en' : 'ta';

  const L = LANGS[lang];
  document.getElementById('query').placeholder            = L.placeholder;
  document.getElementById('resultDivider').textContent    = L.divider;
  document.getElementById('ui-subtitle').textContent      = L.logo_sub;
  document.getElementById('ui-stat1').textContent         = L.stats_labels[0];
  document.getElementById('ui-stat2').textContent         = L.stats_labels[1];
  document.getElementById('ui-stat3').textContent         = L.stats_labels[2];
  document.getElementById('ui-footer').textContent        = L.footer;
  document.getElementById('ui-modal-title').textContent   = L.modal_title;
  document.getElementById('ui-modal-desc').textContent    = L.modal_desc;
  document.getElementById('ui-rec-title').textContent     = L.rec_title;
  document.getElementById('ui-rec-txt').textContent       = L.rec_txt;

  const privacyEl = document.getElementById('ui-privacy-txt');
  if (privacyEl) privacyEl.innerHTML = `<strong>Data Privacy:</strong> ${L.privacy_txt}`;

  if (userProfile) {
    document.getElementById('btn-login').textContent = L.edit_profile;
  } else {
    document.getElementById('btn-login').textContent = L.profile_setup;
  }
  document.getElementById('progLabel').textContent = L.completion;

  const chipsHtml = L.chips
    .map((c, i) => `<div class="chip" onclick="quickSearch('${L.queries[i]}')">${c}</div>`)
    .join('');
  document.getElementById('ui-chips').innerHTML = chipsHtml;

  if (typeof translateDynamicResults === 'function') {
    translateDynamicResults(lang);
  }
}

// ── USER STATE ─────────────────────────────────────────────
let userProfile   = null;
let currentUserId = null;
let appliedSchemes = new Set(); // scheme names tracked by user

// ── FETCH PROFILE FROM DB ──────────────────────────────────
async function loadProfileFromDB(userId) {
  try {
    const res = await fetch(`${API_BASE}/user/${userId}`);
    if (!res.ok) {
      // User not found in DB — clear stale localStorage and redirect to login
      localStorage.removeItem('govUserId');
      window.location.href = 'login.html';
      return;
    }
    const data = await res.json();
    userProfile   = data.profile;
    currentUserId = data.user_id;

    // Update sidebar
    const name = data.full_name || userProfile?.full_name || 'User';
    document.getElementById('aside-name').textContent = name;

    let roleStr = 'Profile Active';
    if (userProfile?.occupation?.role && userProfile.occupation.role !== '') {
      roleStr = userProfile.occupation.role.toUpperCase();
    } else if (userProfile?.occupation?.sector) {
      roleStr = userProfile.occupation.sector.toUpperCase();
    }
    document.getElementById('aside-sub').textContent = roleStr;
    document.getElementById('btn-login').textContent = LANGS[currentLang].edit_profile;

    // Progress bar — update ARIA
    let filled = 0, total = 8;
    if (userProfile?.age_bracket)          filled++;
    if (userProfile?.gender)               filled++;
    if (userProfile?.income_range)         filled++;
    if (userProfile?.state)                filled++;
    if (userProfile?.category)             filled++;
    if (userProfile?.education?.level)     filled++;
    if (userProfile?.occupation?.sector)   filled++;
    if (userProfile?.disability?.status)   filled++;
    const pct = Math.round((filled / total) * 100);
    document.getElementById('progWrap').style.display = 'block';
    document.getElementById('progValue').textContent = pct + '%';
    document.getElementById('progFill').style.width = pct + '%';
    // Update progressbar ARIA attributes
    const progBar = document.querySelector('.prog-bar-bg[role="progressbar"]');
    if (progBar) progBar.setAttribute('aria-valuenow', pct);

    // Show User ID badge in sidebar
    renderUserIdBadge(data.user_id);

    // Show profile dashboard and load applications
    document.getElementById('stats-bar').style.display = 'none';
    document.getElementById('profile-dashboard').style.display = 'block';

    await loadApplications();

  } catch (err) {
    console.error('Profile load error:', err);
  }
}

function renderUserIdBadge(userId) {
  const sidebar = document.querySelector('.sidebar-box');
  if (!sidebar || document.getElementById('user-id-badge')) return;
  const L = LANGS[currentLang];
  const badge = document.createElement('div');
  badge.id = 'user-id-badge';
  badge.style.cssText = `
    margin-top: 14px;
    background: rgba(255,103,19,0.08);
    border: 1px solid rgba(255,103,19,0.25);
    border-radius: 8px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  `;
  badge.title = 'Click to copy your User ID';
  badge.onclick = () => {
    navigator.clipboard.writeText(userId).then(() => {
      badge.querySelector('.uid-val').textContent = 'Copied!';
      setTimeout(() => { badge.querySelector('.uid-val').textContent = userId; }, 1500);
    });
  };
  badge.innerHTML = `
    <span style="font-size:1.2rem;">🪪</span>
    <div>
      <div style="font-size:0.7rem; color:var(--muted); font-weight:600; text-transform:uppercase;">${L.your_id}</div>
      <div class="uid-val" style="font-size:0.95rem; font-weight:700; color:var(--accent); letter-spacing:2px; font-family:monospace;">${userId}</div>
    </div>
    <span style="margin-left:auto; font-size:0.8rem; color:var(--muted);">📋</span>
  `;
  sidebar.insertBefore(badge, sidebar.querySelector('.privacy-note'));
}

async function loadApplications() {
  if (!currentUserId) return;
  try {
    const res = await fetch(`${API_BASE}/user/${currentUserId}/applications`);
    const data = await res.json();
    appliedSchemes = new Set(data.applications.map(a => a.scheme_name));
    renderApplicationsPanel(data.applications);
  } catch (err) {
    console.error('Applications load error:', err);
  }
}

function renderApplicationsPanel(applications) {
  const sidebar = document.querySelector('.sidebar-box');
  if (!sidebar) return;

  // Remove old panel
  const old = document.getElementById('applied-schemes-panel');
  if (old) old.remove();

  const L = LANGS[currentLang];
  const panel = document.createElement('div');
  panel.id = 'applied-schemes-panel';
  panel.style.cssText = `
    margin-top: 16px;
    border-top: 1px solid var(--card-border);
    padding-top: 14px;
  `;

  const count = applications.length;
  let innerHtml = `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
      <div style="font-size:0.85rem; font-weight:700; color:var(--accent);">
        📋 ${L.applied_schemes_title}
      </div>
      <span style="background:var(--accent); color:white; border-radius:50%; width:20px; height:20px; font-size:0.7rem; display:flex; align-items:center; justify-content:center; font-weight:700;">${count}</span>
    </div>
  `;

  if (count === 0) {
    innerHtml += `<p style="font-size:0.78rem; color:var(--muted); text-align:center; padding:8px 0;">${L.no_applications}</p>`;
  } else {
    applications.slice(0, 5).forEach(app => {
      const date = new Date(app.applied_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
      const safeName = app.scheme_name.length > 28 ? app.scheme_name.slice(0, 28) + '…' : app.scheme_name;
      innerHtml += `
        <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:10px; padding:8px; background:rgba(0,0,0,0.03); border-radius:8px; border:1px solid var(--card-border);">
          <div style="flex:1; min-width:0;">
            <div style="font-size:0.78rem; font-weight:600; color:var(--text); line-height:1.3;" title="${app.scheme_name}">${safeName}</div>
            <div style="font-size:0.68rem; color:var(--muted); margin-top:2px;">📅 ${date}</div>
          </div>
          <button onclick="removeApplication('${app.scheme_name.replace(/'/g, "\\'")}')"
            style="background:none; border:none; color:var(--muted); cursor:pointer; font-size:0.85rem; padding:0; flex-shrink:0;" title="Remove">✕</button>
        </div>
      `;
    });
    if (count > 5) {
      innerHtml += `<div style="font-size:0.75rem; color:var(--muted); text-align:center;">+ ${count - 5} more</div>`;
    }
  }

  panel.innerHTML = innerHtml;
  sidebar.insertBefore(panel, sidebar.querySelector('.privacy-note'));
}

async function trackApplication(schemeName, schemeData) {
  if (!currentUserId) {
    window.location.href = 'login.html';
    return;
  }
  try {
    await fetch(`${API_BASE}/user/${currentUserId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheme_name: schemeName, scheme: schemeData })
    });
    appliedSchemes.add(schemeName);
    await loadApplications();
    // Update button state
    document.querySelectorAll(`.track-btn[data-scheme="${CSS.escape(schemeName)}"]`).forEach(btn => {
      btn.textContent = LANGS[currentLang].tracked;
      btn.disabled = true;
      btn.style.opacity = '0.7';
    });
  } catch (err) {
    console.error('Track error:', err);
  }
}

async function removeApplication(schemeName) {
  if (!currentUserId) return;
  try {
    await fetch(`${API_BASE}/user/${currentUserId}/apply/${encodeURIComponent(schemeName)}`, {
      method: 'DELETE'
    });
    appliedSchemes.delete(schemeName);
    await loadApplications();
    // Re-enable track button if visible in results
    document.querySelectorAll('.track-btn').forEach(btn => {
      if (btn.dataset.scheme === schemeName) {
        btn.textContent = LANGS[currentLang].track_apply;
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    });
  } catch (err) {
    console.error('Remove error:', err);
  }
}

// ── SIDEBAR ACTIONS ────────────────────────────────────────
function loadProfile() {
  const userId = localStorage.getItem('govUserId');
  if (userId) {
    loadProfileFromDB(userId);
  } else {
    // Guest state
    document.getElementById('stats-bar').style.display = 'flex';
    document.getElementById('profile-dashboard').style.display = 'none';
    document.getElementById('aside-name').textContent = 'Guest User';
    document.getElementById('aside-sub').textContent = 'Profile Incomplete';
    document.getElementById('progWrap').style.display = 'none';
    document.getElementById('btn-login').textContent = LANGS[currentLang].profile_setup;
  }
}

// btn-login click — go to login page if no profile, open edit modal if profile exists
function openProfileModal() {
  if (!currentUserId) {
    window.location.href = 'login.html';
    return;
  }
  // Open edit modal with pre-filled data
  initForm();
  const modal = document.getElementById('profileModal');
  modal.style.display = 'flex';
  // Move focus to first focusable element in modal
  setTimeout(() => {
    const firstFocusable = modal.querySelector('button, input, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }, 50);
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
  if (userProfile) {
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setVal('pf-name', userProfile.full_name);
    setVal('pf-age', userProfile.age_bracket);
    setVal('pf-gender', userProfile.gender);
    setVal('pf-income', userProfile.income_range);
    setVal('pf-cat', userProfile.category);
    setVal('pf-state', userProfile.state);
    setVal('pf-disabled', userProfile.disability?.status || 'None');
    if (userProfile.education?.level) {
      setVal('pf-edu-l1', userProfile.education.level);
      document.getElementById('pf-edu-l1').dispatchEvent(new Event('change'));
      setVal('pf-edu-l2', userProfile.education.field);
    }
    if (userProfile.occupation?.sector) {
      setVal('pf-occ-l1', userProfile.occupation.sector);
      document.getElementById('pf-occ-l1').dispatchEvent(new Event('change'));
      setVal('pf-occ-l2', userProfile.occupation.role);
    }
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
  // Return focus to the trigger button
  const trigger = document.getElementById('btn-login');
  if (trigger) trigger.focus();
}

async function saveProfile(e) {
  e.preventDefault();
  const updated = {
    full_name: document.getElementById('pf-name')?.value || userProfile?.full_name || 'User',
    age_bracket: document.getElementById('pf-age').value,
    gender: document.getElementById('pf-gender').value,
    income_range: document.getElementById('pf-income').value,
    state: document.getElementById('pf-state').value,
    category: document.getElementById('pf-cat').value,
    education: {
      level: document.getElementById('pf-edu-l1').value,
      field: document.getElementById('pf-edu-l2').value
    },
    occupation: {
      sector: document.getElementById('pf-occ-l1').value,
      role: document.getElementById('pf-occ-l2').value
    },
    disability: {
      status: document.getElementById('pf-disabled').value
    }
  };

  try {
    await fetch(`${API_BASE}/user/${currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: updated })
    });
    userProfile = updated;
    closeProfileModal();
    await loadProfileFromDB(currentUserId);
    if (document.getElementById('query').value) search();
  } catch (err) {
    console.error('Save profile error:', err);
  }
}

// ── FORM INIT (for edit modal in index.html) ───────────────
const DATA_TREE = {
  education: {
    "School": ["N/A"],
    "Undergraduate": ["Engineering", "Medicine", "Arts", "Commerce", "Science"],
    "Postgraduate": ["Engineering", "Medicine", "Arts", "Commerce", "Science"],
    "Doctorate": ["Research"],
    "Vocational": ["ITI", "Diploma"]
  },
  occupation: {
    "Agriculture": ["Farmer", "Agri-Business", "Animal Husbandry"],
    "Healthcare": ["Doctor", "Nurse", "Technician"],
    "Technology": ["Developer", "Analyst", "Manager", "Designer"],
    "Education": ["Teacher", "Professor", "Administration"],
    "Government": ["Civil Services", "Defense", "State Govt"],
    "Unemployed": ["Seeking Job", "Student", "Homemaker"]
  }
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

function initForm() {
  const stateSel = document.getElementById('pf-state');
  if (stateSel && stateSel.options.length <= 1) {
    STATES.forEach(st => stateSel.add(new Option(st, st)));
  }
  const edu1 = document.getElementById('pf-edu-l1');
  if (edu1 && edu1.options.length <= 1) {
    Object.keys(DATA_TREE.education).forEach(k => edu1.add(new Option(k, k)));
  }
  const occ1 = document.getElementById('pf-occ-l1');
  if (occ1 && occ1.options.length <= 1) {
    Object.keys(DATA_TREE.occupation).forEach(k => occ1.add(new Option(k, k)));
  }
  if (edu1 && !edu1._initDone) {
    edu1._initDone = true;
    edu1.addEventListener('change', (e) => {
      const l2 = document.getElementById('pf-edu-l2');
      l2.innerHTML = '<option value="">Select...</option>';
      if (e.target.value) {
        l2.disabled = false;
        DATA_TREE.education[e.target.value].forEach(v => l2.add(new Option(v, v)));
      } else { l2.disabled = true; }
    });
  }
  if (occ1 && !occ1._initDone) {
    occ1._initDone = true;
    occ1.addEventListener('change', (e) => {
      const l2 = document.getElementById('pf-occ-l2');
      l2.innerHTML = '<option value="">Select...</option>';
      if (e.target.value) {
        l2.disabled = false;
        DATA_TREE.occupation[e.target.value].forEach(v => l2.add(new Option(v, v)));
      } else { l2.disabled = true; }
    });
  }
}

// ── VOICE RECOGNITION ──────────────────────────────────────
let recognition    = null;
let isListening    = false;
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
  recognition.lang            = LANGS[currentLang].lang;
  recognition.interimResults  = true;
  recognition.maxAlternatives = 3;
  recognition.continuous      = false;

  const micBtn  = document.getElementById('micBtn');
  const status  = document.getElementById('voiceStatus');
  const queryEl = document.getElementById('query');

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micBtn.setAttribute('aria-pressed', 'true');
    micBtn.textContent  = '⏹';
    micBtn.setAttribute('aria-label', 'Stop voice input');
    status.textContent  = LANGS[currentLang].listening;
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
  micBtn.setAttribute('aria-pressed', 'false');
  micBtn.setAttribute('aria-label', 'Start voice input');
  setTimeout(() => document.getElementById('voiceStatus').classList.remove('show'), 1800);
}

// ── TTS ─────────────────────────────────────────────────────
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
    if (pauseBtn) { pauseBtn.textContent = '⏸️'; pauseBtn.setAttribute('aria-pressed', 'false'); pauseBtn.setAttribute('aria-label', 'Pause audio'); }
    if (wave) wave.classList.remove('paused');
  } else {
    window.speechSynthesis && window.speechSynthesis.pause();
    if (currentAudio) currentAudio.pause();
    isSpeechPaused = true;
    if (pauseBtn) { pauseBtn.textContent = '▶️'; pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Resume audio'); }
    if (wave) wave.classList.add('paused');
  }
}

let ttsSession = 0;

function stopAll() {
  ttsSession++;
  window.speechSynthesis && window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (ttsBtnEl) setBtnState(ttsBtnEl, false);
  document.querySelectorAll('.tts-btn').forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
    if (btn.dataset.label) btn.textContent = '🔊 ' + btn.dataset.label;
  });
  document.querySelectorAll('.apply-btn.secondary').forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = '1';
    if (btn.dataset.label) btn.textContent = btn.dataset.label;
  });
  ttsChunks = [];
  ttsIndex = 0;
  ttsPlayNext = null;
  ttsLangCode = null;
  ttsRate = 0.88;
  ttsBtnEl = null;
  hideAudioControls();
}

let ttsChunks = [];
let ttsIndex = 0;
let ttsPlayNext = null;
let ttsLangCode = null;
let ttsRate = 0.88;
let ttsBtnEl = null;

function getBestVoice(langCode) {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = langCode.split('-')[0];
  return voices.find(v => v.lang.includes(langPrefix) &&
    (v.name.includes('Online') || v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Premium')))
    || voices.find(v => v.lang.includes(langPrefix));
}

function _startSpeakingFromIndex() {
  window.speechSynthesis.cancel();
  ttsSession++;
  let currentSession = ttsSession;
  showAudioControls();

  ttsPlayNext = function speakNext() {
    if (currentSession !== ttsSession) return;
    if (ttsIndex >= ttsChunks.length) {
      if (ttsBtnEl) setBtnState(ttsBtnEl, false);
      hideAudioControls();
      ttsChunks = [];
      return;
    }
    const utter = new SpeechSynthesisUtterance(ttsChunks[ttsIndex].trim());
    utter.lang = ttsLangCode;
    utter.rate = ttsRate;
    const targetVoice = getBestVoice(ttsLangCode);
    if (targetVoice) utter.voice = targetVoice;
    utter.onend = () => { if (currentSession === ttsSession) { ttsIndex++; speakNext(); } };
    utter.onerror = (e) => { if (currentSession === ttsSession) { ttsIndex++; speakNext(); } };
    window.speechSynthesis.speak(utter);
  };
  setTimeout(ttsPlayNext, 100);
}

function rewindSpeech() {
  if (ttsChunks.length === 0) return;
  ttsIndex = Math.max(0, ttsIndex - 2);
  _tryGoogleTTSFromIndex();
}

function forwardSpeech() {
  if (ttsChunks.length === 0) return;
  ttsIndex = Math.min(ttsChunks.length - 1, ttsIndex + 1);
  _tryGoogleTTSFromIndex();
}

function speakChunksBrowserSync(text, langCode, rate, btnEl) {
  ttsLangCode = langCode;
  ttsRate = rate;
  ttsBtnEl = btnEl;
  ttsChunks = chunkText(text, 160);
  ttsIndex = 0;
  _tryGoogleTTSFromIndex();
}

function _tryGoogleTTSFromIndex() {
  window.speechSynthesis && window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  ttsSession++;
  let currentSession = ttsSession;
  showAudioControls();

  const googleLangMap = { 'en-IN': 'en', 'ta-IN': 'ta', 'hi-IN': 'hi' };
  const gLang = googleLangMap[ttsLangCode] || ttsLangCode.split('-')[0];

  ttsPlayNext = function playNextGoogleChunk() {
    if (currentSession !== ttsSession) return;
    if (ttsIndex >= ttsChunks.length) {
      if (ttsBtnEl) setBtnState(ttsBtnEl, false);
      hideAudioControls();
      ttsChunks = [];
      return;
    }
    const chunkTxt = ttsChunks[ttsIndex].trim();
    if (!chunkTxt) { ttsIndex++; playNextGoogleChunk(); return; }
    const encoded = encodeURIComponent(chunkTxt);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${gLang}&client=tw-ob&q=${encoded}`;
    currentAudio = new Audio(url);
    currentAudio.onended = () => { if (currentSession === ttsSession) { ttsIndex++; playNextGoogleChunk(); } };
    currentAudio.onerror = () => { currentAudio = null; _startSpeakingFromIndex(); };
    currentAudio.play().catch(() => { currentAudio = null; _startSpeakingFromIndex(); });
  };
  setTimeout(ttsPlayNext, 80);
}

function speakEnglish(englishText, btnEl) {
  stopAll();
  setBtnState(btnEl, true, '🔊');
  speakChunksBrowserSync(englishText, 'en-IN', 0.92, btnEl);
}

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
      if (data && data[0]) { for (let j = 0; j < data[0].length; j++) { if (data[0][j][0]) translated += data[0][j][0]; } }
      tamilText = translated || englishText;
      translateCache[englishText] = tamilText;
    }
    setBtnState(btnEl, true, '🔊');
    speakChunksBrowserSync(tamilText, 'ta-IN', 0.88, btnEl);
  } catch (e) {
    speakChunksBrowserSync(englishText, 'en-IN', 0.88, btnEl);
  }
}

async function speakHindiTranslated(englishText, btnEl) {
  stopAll();
  setBtnState(btnEl, true, '⏳');
  try {
    let hindiText = await translateToLang(englishText, 'hi');
    setBtnState(btnEl, true, '🔊');
    speakChunksBrowserSync(hindiText, 'hi-IN', 0.88, btnEl);
  } catch (e) {
    speakChunksBrowserSync(englishText, 'en-IN', 0.88, btnEl);
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
  const sentences = text.replace(/([.!?।])\s+/g, '$1||SPLIT||').split('||SPLIT||');
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > maxLen && cur) { chunks.push(cur.trim()); cur = s; }
    else { cur += (cur ? ' ' : '') + s; }
  }
  if (cur.trim()) chunks.push(cur.trim());
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxLen) { finalChunks.push(chunk); }
    else {
      const words = chunk.split(' ');
      let part = '';
      for (const w of words) {
        if ((part + ' ' + w).length > maxLen && part) { finalChunks.push(part.trim()); part = w; }
        else part += (part ? ' ' : '') + w;
      }
      if (part.trim()) finalChunks.push(part.trim());
    }
  }
  return finalChunks;
}

// ── QUICK CHIP ──────────────────────────────────────────────
function quickSearch(q) {
  document.getElementById('query').value = q;
  search();
}

function checkAllEligible() {
  if (!userProfile || !userProfile.income_range || !userProfile.occupation?.sector) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('query').value = "government schemes for me";
  search(true);
}

// ── SEARCH ──────────────────────────────────────────────────
async function search(isCheckAll = false) {
  const query = document.getElementById('query').value.trim();
  if (!query) return;

  const L = LANGS[currentLang];
  const resultDiv = document.getElementById('result');
  const divider = document.getElementById('resultDivider');

  divider.style.display = 'flex';
  if (isCheckAll && userProfile) {
    let headTxt = L.matching_header || 'Showing all schemes matching your profile: {NAME} | ₹{INCOME} | {OCC}';
    let occStr = userProfile.occupation?.role ? userProfile.occupation.role : (userProfile.occupation?.sector || 'Unknown');
    headTxt = headTxt.replace('{NAME}', userProfile.full_name || 'User')
                     .replace('{INCOME}', userProfile.income_range || 'Unknown')
                     .replace('{OCC}', occStr);
    divider.textContent = headTxt;
  } else {
    divider.textContent = L.divider;
  }

  resultDiv.innerHTML = `<div class="state-box"><div class="spinner" role="status" aria-label="${L.searching}"></div><p>${L.searching}</p></div>`;
  announce(L.searching);

  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, profile: userProfile })
    });
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultDiv.innerHTML = `<div class="state-box"><div class="icon">🔍</div><p><strong>${L.noResult}</strong></p><p style="margin-top:6px;font-size:0.82rem">${L.noResultSub}</p></div>`;
      announce(L.noResult);
      return;
    }

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
        const parts = t.split(/['"]\s*,\s*['"]/).map(s => s.replace(/^['"\\s]+|['"\\s]+$/g, '').trim()).filter(Boolean);
        t = parts.map(s => '• ' + s).join('\n');
      } else {
        t = t.replace(/^['"\\s]+|['"\\s]+$/g, '').trim();
      }
      t = t.replace(/\\n/g, '\n');
      return t;
    }

    function textToHtml(text) {
      return cleanText(text).replace(/\n/g, '<br>');
    }

    let html = '';
    data.results.forEach((item, i) => {
      const eligId = 'elig-' + i;
      const beneId = 'bene-' + i;
      const descId = 'desc-' + i;
      const descClean = cleanText(item.details || '');
      const enText = fixRupee(`${item.name}. ${descClean}`);
      const safeEnText = encodeURIComponent(enText);
      const isTracked = appliedSchemes.has(item.name);
      const safeItemName = item.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

      let matchHtml = '';
      if (item.match_percentage > 0) {
        matchHtml = `
          <div class="match-ring">${item.match_percentage}%</div>
          <div style="margin-top:12px; margin-bottom:8px;">
            <div style="font-size:0.7rem; color:var(--muted); text-transform:uppercase; font-weight:700; margin-bottom:4px;" class="qualify-label">${L.why_qualify || 'Why you qualify'}</div>
            ${item.qualifying_reasons.map(r => `<span class="qualify-match">✓ ${r}</span>`).join('')}
          </div>
        `;
      }

      html += `
        <div class="scheme-card" style="animation-delay:${i * 0.06}s">
          <div class="card-header">
            <div class="card-index">${i + 1}</div>
            <div class="card-title">${item.name || 'N/A'}</div>
          </div>
          ${matchHtml}
          <div class="tts-group card-tts">
            <button class="tts-btn tts-en" data-label="EN" data-text="${safeEnText}"
              onclick="speakEnglish(decodeURIComponent(this.dataset.text), this)" title="Read in English">🔊 EN</button>
            <button class="tts-btn tts-ta" data-label="தமிழ்" data-text="${safeEnText}"
              onclick="speakTamilTranslated(decodeURIComponent(this.dataset.text), this)" title="தமிழில் கேளுங்கள்">🔊 தமிழ்</button>
            <button class="tts-btn tts-hi" data-label="हिंदी" data-text="${safeEnText}"
              onclick="speakHindiTranslated(decodeURIComponent(this.dataset.text), this)" title="हिंदी में सुनें">🔊 हिंदी</button>
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
            ${item.apply_link ? `<a class="apply-btn" href="${item.apply_link}" target="_blank" rel="noopener noreferrer">${L.apply_btn || '🌐 Apply Now'}</a>` : ''}
            ${(item.application_process && item.application_process !== '-') ||
              (item.documents_required && item.documents_required !== '-') ? `
            <button class="apply-btn secondary" data-label="${L.apply_how || '📝 How to Apply'}"
              onclick="toggleApplyBox('apply-box-${i}', this)">
              ${L.apply_how || '📝 How to Apply'}
            </button>` : ''}
            ${currentUserId ? `
            <button class="track-btn apply-btn secondary"
              data-scheme="${item.name}"
              style="${isTracked ? 'opacity:0.65;' : ''}"
              ${isTracked ? 'disabled' : ''}
              onclick="trackApplication('${safeItemName}', ${JSON.stringify(JSON.stringify({name: item.name, ministry: item.ministry, apply_link: item.apply_link}))})">
              ${isTracked ? L.tracked : L.track_apply}
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
    // Clear input after render — enforces one-shot Q&A; each search is independent
    document.getElementById('query').value = '';
    // Announce result count to screen readers
    announce(data.results.length + ' results found');

    if (typeof translateDynamicResults === 'function') {
      translateDynamicResults(currentLang);
    }

  } catch (err) {
    resultDiv.innerHTML = `<div class="state-box"><div class="icon">⚠️</div><p>${LANGS[currentLang].error}</p></div>`;
    announce(LANGS[currentLang].error);
  }
}

// ── APPLY BOX TOGGLE ────────────────────────────────────────
function toggleApplyBox(id, btn) {
  stopAll();
  const box = document.getElementById(id);
  const isOpen = box.classList.contains('open');
  if (isOpen) {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    setBtnState(btn, false);
  } else {
    document.querySelectorAll('.apply-box.open').forEach(b => { b.classList.remove('open'); b.setAttribute('aria-hidden', 'true'); });
    box.classList.add('open');
    box.removeAttribute('aria-hidden');
    btn.setAttribute('aria-expanded', 'true');
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
    if (data && data[0]) { for (let j = 0; j < data[0].length; j++) { if (data[0][j][0]) translated += data[0][j][0]; } }
    translated = translated || text;
    translateCache[cacheKey] = translated;
    return translated;
  } catch (err) {
    return text;
  }
}

async function translateDynamicResults(targetLang) {
  const L = LANGS[targetLang];
  const resultDiv = document.getElementById('result');
  if (!resultDiv) return;

  document.querySelectorAll('.section-label.elig').forEach(el => el.innerHTML = `✅ ${L.elig}`);
  document.querySelectorAll('.section-label.bene').forEach(el => el.innerHTML = `🎁 ${L.bene}`);
  document.querySelectorAll('.section-label.desc').forEach(el => el.innerHTML = `📋 ${L.desc}`);
  document.querySelectorAll('.section-label.apply-steps').forEach(el => el.innerHTML = `📋 ${L.apply_steps}`);
  document.querySelectorAll('.section-label.doc-req').forEach(el => el.innerHTML = `📄 ${L.doc_req}`);
  document.querySelectorAll('.read-more').forEach(el => {
    el.textContent = el.textContent.includes('↓') ? `${L.more} ↓` : `${L.less} ↑`;
  });
  document.querySelectorAll('.apply-btn:not(.secondary):not(.track-btn)').forEach(el => el.innerHTML = L.apply_btn);
  document.querySelectorAll('.apply-btn.secondary:not(.track-btn)').forEach(el => {
    el.dataset.label = L.apply_how;
    el.innerHTML = el.disabled ? '🔊 ' + L.apply_how : L.apply_how;
  });
  document.querySelectorAll('.qualify-label').forEach(el => el.innerHTML = L.why_qualify);
  document.querySelectorAll('.track-btn').forEach(el => {
    if (!el.disabled) el.textContent = L.track_apply;
    else el.textContent = L.tracked;
  });

  if (targetLang === 'en') {
    document.querySelectorAll('.card-title, .section-text').forEach(el => {
      if (el.dataset.origText) el.innerHTML = el.dataset.origText.replace(/\n/g, '<br>');
    });
    return;
  }

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

  // Load profile (from DB if user_id exists)
  loadProfile();

  // Enter key search
  document.getElementById('query').addEventListener('keydown', e => {
    if (e.key === 'Enter') search();
  });

  // Modal keyboard trap
  var modal = document.getElementById('profileModal');
  if (modal) {
    modal.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { closeProfileModal(); return; }
      if (e.key === 'Tab') {
        var foc = Array.from(modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')).filter(function(el){return el.offsetParent!==null;});
        if (!foc.length) return;
        if (e.shiftKey && document.activeElement===foc[0]) { e.preventDefault(); foc[foc.length-1].focus(); }
        else if (!e.shiftKey && document.activeElement===foc[foc.length-1]) { e.preventDefault(); foc[0].focus(); }
      }
    });
    modal.addEventListener('click', function(e) { if (e.target===modal) closeProfileModal(); });
  }
});
