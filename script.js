const colors = [
  { id: 'black', name: 'Solid Black', description: 'A dense, glossy black coat with no tabby pattern.', swatch: '#111827' },
  { id: 'white', name: 'Solid White', description: 'A clean white coat; eye color may vary.', swatch: '#f7f4ed' },
  { id: 'red', name: 'Solid Red', description: 'Warm orange-red, often with subtle ghost tabby markings.', swatch: '#b85a36' },
  { id: 'silver', name: 'Silver Tabby', description: 'Silver ground color with dark tabby markings.', swatch: '#aeb6c2' },
  { id: 'brown', name: 'Brown Tabby', description: 'Classic Maine Coon coloring with warm brown ground and dark stripes.', swatch: '#765c42' },
  { id: 'blue', name: 'Blue', description: 'Soft blue-gray dilution of black pigment.', swatch: '#7b879b' },
  { id: 'tortie', name: 'Tortoiseshell', description: 'Black and red patches; most often female due to sex-linked color genetics.', swatch: 'linear-gradient(135deg,#20232b 48%,#c87952 48%)' },
  { id: 'calico', name: 'Calico', description: 'White with distinct black and red patches.', swatch: 'linear-gradient(135deg,#f7f4ed 40%,#20232b 40% 70%,#c87952 70%)' },
  { id: 'smoke', name: 'Smoke', description: 'Dark tips with a pale undercoat visible when the fur parts.', swatch: 'linear-gradient(90deg,#1d2635,#aeb6c2,#1d2635)' },
  { id: 'cream', name: 'Cream', description: 'Soft warm dilution of red pigment.', swatch: '#d5b69d' }
];

const breeders = [
  { name: 'North Star Maine Coons', city: 'Haverhill, MA', state: 'MA', zip: '01830', distance: 18, email: 'hello@northstar.example', specialties: 'American type, silver tabby, health-forward placement', verified: 'Directory entry requires independent verification.' },
  { name: 'Cedar Ridge Cattery', city: 'Portland, ME', state: 'ME', zip: '04101', distance: 82, email: 'inquiries@cedarridge.example', specialties: 'European type, solids, early socialization', verified: 'Directory entry requires independent verification.' },
  { name: 'Great Lakes Maine Coons', city: 'Albany, NY', state: 'NY', zip: '12207', distance: 146, email: 'kittens@greatlakes.example', specialties: 'American type, tortie and red, contract-focused', verified: 'Directory entry requires independent verification.' },
  { name: 'Blue Spruce Maine Coons', city: 'Burlington, VT', state: 'VT', zip: '05401', distance: 158, email: 'hello@bluespruce.example', specialties: 'European type, blue and smoke, small program', verified: 'Directory entry requires independent verification.' },
  { name: 'Oak & Tuft Cattery', city: 'Providence, RI', state: 'RI', zip: '02903', distance: 214, email: 'contact@oakandtuft.example', specialties: 'American type, brown tabby, family homes', verified: 'Directory entry requires independent verification.' }
];

const state = {
  selectedColor: null,
  selectedType: null,
  selectedBreeder: null,
  selectedRadius: null,
  zip: ''
};

function renderColors() {
  const grid = document.getElementById('colorGrid');
  grid.innerHTML = colors.map((color) => `
    <button class="color-option" data-color="${color.id}" aria-pressed="false">
      <span class="swatch" style="background:${color.swatch}"></span>
      <strong>${color.name}</strong>
      <span>${color.description}</span>
    </button>
  `).join('');
  grid.querySelectorAll('.color-option').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedColor = colors.find((color) => color.id === button.dataset.color);
      grid.querySelectorAll('.color-option').forEach((item) => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      advanceTo(2);
    });
  });
}

function advanceTo(step) {
  document.querySelectorAll('.finder-step').forEach((section) => section.classList.remove('active'));
  const target = document.querySelector(`.step-${step}`);
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function updatePreview() {
  const preview = document.getElementById('inquiryPreview');
  if (!preview) return;
  const color = state.selectedColor ? state.selectedColor.name : 'your preferred color';
  const type = state.selectedType ? `${state.selectedType} type` : 'American or European type';
  preview.innerHTML = `<div class="selection-summary"><b>Your preferences:</b> ${color} Maine Coon, ${type}. <span>Use this as a starting point, not a guarantee of availability.</span></div>`;
}

function renderBreeders(results) {
  const container = document.getElementById('breederResults');
  if (!results.length) {
    container.innerHTML = '<div class="note">No directory entries fall within that radius. Try expanding your search or contact breed clubs for referrals.</div>';
    return;
  }
  container.innerHTML = `<h3>${results.length} directory ${results.length === 1 ? 'entry' : 'entries'} within ${state.selectedRadius} miles</h3>` + results.map((breeder) => `
    <article class="breeder-card ${state.selectedBreeder?.name === breeder.name ? 'selected' : ''}">
      <div>
        <span class="badge">Illustrative directory entry</span>
        <h3>${breeder.name}</h3>
        <p class="location">${breeder.city} · approximately ${breeder.distance} miles away</p>
        <p>${breeder.specialties}</p>
        <p class="small">${breeder.verified}</p>
      </div>
      <button class="secondary-btn select-breeder" data-breeder="${breeder.name}">${state.selectedBreeder?.name === breeder.name ? 'Selected' : 'Select breeder'}</button>
    </article>
  `).join('');
  container.querySelectorAll('.select-breeder').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedBreeder = breeders.find((breeder) => breeder.name === button.dataset.breeder);
      renderBreeders(results);
      renderSelectedBreeder();
      updateEmailButton();
      advanceTo(5);
    });
  });
}

function renderSelectedBreeder() {
  const container = document.getElementById('selectedBreederInfo');
  if (!state.selectedBreeder) {
    container.innerHTML = '<div class="note">Select a breeder to prepare a personalized inquiry.</div>';
    return;
  }
  container.innerHTML = `<div class="selected-card"><h3>${state.selectedBreeder.name}</h3><p>${state.selectedBreeder.city} · ${state.selectedBreeder.specialties}</p><p class="small">The generated email will open in your mail app. Review the recipient, message, and attachments before sending.</p></div>`;
}

function updateEmailButton() {
  document.getElementById('generateEmailBtn').disabled = !state.selectedBreeder;
}

function buildEmail() {
  const color = state.selectedColor?.name || 'an available Maine Coon kitten';
  const type = state.selectedType ? `${state.selectedType} type` : 'American or European type';
  const subject = `Maine Coon inquiry: ${color}, ${type}`;
  const body = `Hello ${state.selectedBreeder.name},\n\nI am interested in a Maine Coon kitten and would appreciate learning more about your program. My current preferences are:\n\n• Coat color: ${color}\n• Preferred type: ${type}\n• Travel radius: ${state.selectedRadius || 'not specified'} miles from ZIP ${state.zip || 'not specified'}\n\nBefore making any final decision, could you please share the following for the available kitten and both parents?\n\n1. Registered names, pedigrees, and dates of birth\n2. HCM screening history, including echocardiogram reports and cardiologist details\n3. Hip screening results (OFA or PennHIP)\n4. DNA test results for SMA, PKDef, and any relevant lineage-specific conditions\n5. Vaccination, parasite prevention, and veterinary records\n6. Contract, health guarantee, return policy, and spay/neuter terms\n7. Socialization routine, current diet, and expected go-home date\n8. Recent photos or a video call with the kitten and mother\n\nPlease complete or return the attached breeder questionnaire, or reply with the answers above. I will review the documentation with my veterinarian before making any commitment.\n\nThank you,\n[Your name]\n[Your phone number]`;
  return { subject, body };
}

function setupTheme() {
  const saved = localStorage.getItem('maine-coon-theme');
  const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = preferred;
  const button = document.getElementById('themeToggle');
  const update = () => { button.textContent = document.documentElement.dataset.theme === 'dark' ? '☀ Light' : '☾ Dark'; };
  update();
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('maine-coon-theme', next);
    update();
  });
}

function setupInteractions() {
  document.querySelectorAll('.type-select').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedType = button.dataset.type === 'american' ? 'American' : 'European';
      document.querySelectorAll('.type-card').forEach((card) => card.classList.remove('selected'));
      button.closest('.type-card').classList.add('selected');
      updatePreview();
      advanceTo(3);
    });
  });

  const zipInput = document.getElementById('zipInput');
  const radiusInput = document.getElementById('radiusInput');
  const searchBtn = document.getElementById('searchBtn');
  const updateSearchState = () => {
    const validZip = /^\d{5}$/.test(zipInput.value.trim());
    searchBtn.disabled = !(validZip && radiusInput.value);
  };
  zipInput.addEventListener('input', updateSearchState);
  radiusInput.addEventListener('change', updateSearchState);
  searchBtn.addEventListener('click', () => {
    state.zip = zipInput.value.trim();
    state.selectedRadius = Number(radiusInput.value);
    const results = breeders.filter((breeder) => breeder.distance <= state.selectedRadius);
    document.getElementById('searchStatus').textContent = `Search centered on ${state.zip}. Distances are approximate directory values.`;
    renderBreeders(results);
    updatePreview();
    advanceTo(4);
    document.querySelector('.breeder-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('generateEmailBtn').addEventListener('click', () => {
    const { subject, body } = buildEmail();
    const draft = document.getElementById('emailDraft');
    draft.innerHTML = `<div class="draft-header"><b>Draft ready</b><button class="secondary-btn" id="copyEmail">Copy text</button></div><pre>${body.replace(/</g, '&lt;')}</pre><a class="primary-btn email-link" href="mailto:${state.selectedBreeder.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Open in email app</a>`;
    document.getElementById('copyEmail').addEventListener('click', async () => {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      document.getElementById('copyEmail').textContent = 'Copied';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderColors();
  setupTheme();
  setupInteractions();
  renderSelectedBreeder();
  updatePreview();
});

window.advanceTo = advanceTo;
