// ════════════════════════════════════════════════════════
//  GovScheme AI — login.js
//  Handles: Smart Registration with hierarchical dropdowns
//           Registers user in backend DB → gets unique User ID
//           Stores ONLY user_id in localStorage (not full profile)
// ════════════════════════════════════════════════════════

const API_BASE = "";

const DATA_TREE = {
  education: {
    "School": {
      "N/A": ["N/A"]
    },
    "Undergraduate": {
      "Engineering": ["Computer Science", "Mechanical", "Civil", "Electrical", "AI/Data Science", "Electronics"],
      "Medicine": ["MBBS", "BDS", "Nursing", "Pharmacy", "Ayurveda"],
      "Arts": ["History", "Political Science", "English", "Economics", "Sociology"],
      "Commerce": ["B.Com General", "B.Com Honors", "Finance", "Accounting"],
      "Science": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"]
    },
    "Postgraduate": {
      "Engineering": ["M.Tech CS", "M.Tech Mechanical", "M.Tech Civil", "M.Tech AI", "VLSI"],
      "Medicine": ["MD Cardiology", "MD Pediatrics", "MS Surgery", "MDS", "M.Pharm"],
      "Arts": ["MA History", "MA English", "MA Economics", "MA Political Science"],
      "Commerce": ["M.Com", "MBA Finance", "MBA Marketing", "MBA HR"],
      "Science": ["M.Sc Physics", "M.Sc Chemistry", "M.Sc Mathematics", "M.Sc Computer Science"]
    },
    "Doctorate": {
      "Research": ["Ph.D Science", "Ph.D Engineering", "Ph.D Arts", "Ph.D Management"]
    },
    "Vocational": {
      "ITI": ["Fitter", "Electrician", "Welder", "Mechanic"],
      "Diploma": ["Polytechnic", "Fashion Design", "Hotel Management"]
    }
  },
  occupation: {
    "Agriculture": {
      "Farmer": ["Land Owner", "Tenant Farmer", "Agricultural Laborer"],
      "Agri-Business": ["Distributor", "Retailer", "Consultant"],
      "Animal Husbandry": ["Dairy Farmer", "Poultry Farmer", "Fisheries"]
    },
    "Healthcare": {
      "Doctor": ["Cardiologist", "Pediatrician", "General Physician", "Surgeon"],
      "Nurse": ["Registered Nurse", "Midwife", "Nurse Practitioner"],
      "Technician": ["Lab Technician", "Radiology Tech", "Pharmacy Assistant"]
    },
    "Technology": {
      "Developer": ["Frontend", "Backend", "Full-Stack", "DevOps", "Mobile Developer"],
      "Analyst": ["Data Analyst", "Business Analyst", "System Analyst"],
      "Manager": ["Product Manager", "Project Manager", "Engineering Manager"],
      "Designer": ["UI/UX Designer", "Graphic Designer", "Product Designer"]
    },
    "Education": {
      "Teacher": ["Primary School", "High School", "Special Education"],
      "Professor": ["Assistant Professor", "Associate Professor", "HOD"],
      "Administration": ["Principal", "Coordinator", "Counselor"]
    },
    "Government": {
      "Civil Services": ["IAS", "IPS", "IFS", "IRS"],
      "Defense": ["Army", "Navy", "Air Force"],
      "State Govt": ["Clerk", "Police", "Revenue Officer"]
    },
    "Unemployed": {
      "Seeking Job": ["Entry Level", "Experienced"],
      "Student": ["Full Time", "Part Time"],
      "Homemaker": ["Full Time"]
    }
  }
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

document.addEventListener("DOMContentLoaded", () => {
  // If user already has a user_id in localStorage, skip login and go to main app
  const existingId = localStorage.getItem("govUserId");
  if (existingId) {
    window.location.href = "/";
    return;
  }

  // Populate States
  const stateSelect = document.getElementById("state");
  if (stateSelect) {
    STATES.forEach(st => {
      const opt = document.createElement("option");
      opt.value = st;
      opt.textContent = st;
      stateSelect.appendChild(opt);
    });
  }

  // Populate Education L1 and Occupation L1
  populateLevel1("edu-l1", DATA_TREE.education);
  populateLevel1("occ-l1", DATA_TREE.occupation);

  // Chain listeners
  document.getElementById("edu-l1").addEventListener("change", (e) => handleL1Change(e, "edu", DATA_TREE.education));
  document.getElementById("edu-l2").addEventListener("change", (e) => handleL2Change(e, "edu", DATA_TREE.education));
  document.getElementById("occ-l1").addEventListener("change", (e) => handleL1Change(e, "occ", DATA_TREE.occupation));
  document.getElementById("occ-l2").addEventListener("change", (e) => handleL2Change(e, "occ", DATA_TREE.occupation));
  document.getElementById("disability").addEventListener("change", handleDisabilityChange);
});

function populateLevel1(selectId, dataObj) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  Object.keys(dataObj).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    sel.appendChild(opt);
  });
}

function handleL1Change(event, prefix, dataObj) {
  const val = event.target.value;
  const l2 = document.getElementById(`${prefix}-l2`);
  const l3 = document.getElementById(`${prefix}-l3`);

  l2.innerHTML = '<option value="">Select...</option>';
  l3.innerHTML = '<option value="">Select...</option>';
  l3.disabled = true;

  if (val === "") {
    l2.disabled = true;
    showWarning(event.target, `Please select a valid ${prefix === 'edu' ? 'Education Level' : 'Occupation Sector'}.`);
    return;
  }

  if (event.target.dataset.prevValue && event.target.dataset.prevValue !== val) {
    showWarning(event.target, `You changed the ${prefix === 'edu' ? 'Education' : 'Occupation'} Sector to ${val}. Please re-select your downstream options.`);
  }
  event.target.dataset.prevValue = val;

  l2.disabled = false;
  l2.classList.add("pulse");
  setTimeout(() => l2.classList.remove("pulse"), 1000);

  const children = dataObj[val];
  if (children) {
    Object.keys(children).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = k;
      l2.appendChild(opt);
    });
  }
  clearWarning();
}

function handleL2Change(event, prefix, dataObj) {
  const l1Val = document.getElementById(`${prefix}-l1`).value;
  const val = event.target.value;
  const l3 = document.getElementById(`${prefix}-l3`);

  l3.innerHTML = '<option value="">Select...</option>';

  if (val === "") {
    l3.disabled = true;
    return;
  }

  const specDict = dataObj[l1Val];
  if (!specDict || !specDict[val]) {
    showWarning(event.target, `${val} is not a valid subset of ${l1Val}. Resetting.`);
    event.target.value = "";
    return;
  }

  l3.disabled = false;
  l3.classList.add("pulse");
  setTimeout(() => l3.classList.remove("pulse"), 1000);

  specDict[val].forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    l3.appendChild(opt);
  });
  clearWarning();
}

function handleDisabilityChange(e) {
  const val = e.target.value;
  const disPct = document.getElementById("disability-pct");
  if (val === "None" || val === "") {
    disPct.value = "";
    disPct.disabled = true;
  } else {
    disPct.disabled = false;
  }
}

// ── Warning Toast ──
let warningTimer;
function showWarning(element, msg) {
  const box = document.getElementById("smart-warning");
  if (!box) return;
  box.innerHTML = `<strong>Notice:</strong> ${msg}`;
  box.classList.add("show");
  if (element && element.focus) element.focus();
  clearTimeout(warningTimer);
  warningTimer = setTimeout(clearWarning, 6000);
}

function clearWarning() {
  const box = document.getElementById("smart-warning");
  if (box) box.classList.remove("show");
}

// ── Form Submit ──
function submitProfile(e) {
  e.preventDefault();

  const income = document.getElementById("income").value;
  const age = document.getElementById("age").value;
  const occ = document.getElementById("occ-l1").value;

  // Heuristic edge case
  if (age === "18-25" && income === "Above ₹8,00,000" && occ === "Unemployed") {
    document.getElementById("confirmation-modal").style.display = "flex";
    return;
  }

  saveAndRedirect();
}

function forceApply() {
  document.getElementById("confirmation-modal").style.display = "none";
  saveAndRedirect();
}

function cancelApply() {
  document.getElementById("confirmation-modal").style.display = "none";
}

async function saveAndRedirect() {
  const profile = {
    full_name: document.getElementById("full-name") ? document.getElementById("full-name").value : "User",
    age_bracket: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    income_range: document.getElementById("income").value,
    state: document.getElementById("state").value,
    education: {
      level: document.getElementById("edu-l1").value,
      field: document.getElementById("edu-l2").value,
      specialization: document.getElementById("edu-l3").value,
      percentage: document.getElementById("edu-pct").value
    },
    occupation: {
      sector: document.getElementById("occ-l1").value,
      role: document.getElementById("occ-l2").value,
      specialization: document.getElementById("occ-l3").value
    },
    category: document.getElementById("category").value,
    disability: {
      status: document.getElementById("disability").value || "None",
      percentage: document.getElementById("disability-pct").value
    }
  };

  // Show loading state on button
  const btn = document.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile })
    });
    const data = await res.json();

    if (data.user_id) {
      // Store ONLY the user_id — profile lives in DB
      localStorage.setItem("govUserId", data.user_id);
      window.location.href = "/";
    } else {
      showWarning(document.body, "Registration failed. Please try again.");
      if (btn) { btn.disabled = false; btn.textContent = "Save & Apply Filters"; }
    }
  } catch (err) {
    console.error("Registration error:", err);
    showWarning(document.body, "Could not connect to server. Make sure the app is running.");
    if (btn) { btn.disabled = false; btn.textContent = "Save & Apply Filters"; }
  }
}
