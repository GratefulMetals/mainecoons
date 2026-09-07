const colors = [
  { id: 'black', name: 'Solid Black', description: 'A dense, glossy black coat with no tabby pattern.', image: '/maine-coon-black.png' },
  { id: 'white', name: 'Solid White', description: 'A clean white coat; eye color may vary.', image: '/maine-coon-white.png' },
  { id: 'red', name: 'Solid Red', description: 'Warm orange-red, often with subtle ghost tabby markings.', image: '/maine-coon-red.png' },
  { id: 'silver', name: 'Silver Tabby', description: 'Silver ground color with dark tabby markings.', image: '/maine-coon-silver-tabby.png' },
  { id: 'brown', name: 'Brown Tabby', description: 'Classic Maine Coon coloring with warm brown ground and dark stripes.', image: '/maine-coon-brown-tabby.png' },
  { id: 'blue', name: 'Blue', description: 'Soft blue-gray dilution of black pigment.', image: '/maine-coon-blue.png' },
  { id: 'tortie', name: 'Tortoiseshell', description: 'Black and red patches; most often female due to sex-linked color genetics.', image: '/maine-coon-tortie.png' },
  { id: 'calico', name: 'Calico', description: 'White with distinct black and red patches.', image: '/maine-coon-calico.png' },
  { id: 'smoke', name: 'Smoke', description: 'Dark tips with a pale undercoat visible when the fur parts.', image: '/maine-coon-black-smoke.png' },
  { id: 'cream', name: 'Cream', description: 'Soft warm dilution of red pigment.', image: '/maine-coon-cream.png' }
];

const SUPABASE_URL = 'https://lnikcdcwiuisrcltoogi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_a5Aqf8xdQaIWQ3HUJIF3cw_NFLQKV2r';

async function searchSupabaseBreeders(zip, radiusMiles) {
  const geoResponse = await fetch(`${SUPABASE_URL}/functions/v1/zip-lookup?zip=${encodeURIComponent(zip)}`);
  const geoBody = await geoResponse.json().catch(() => ({}));
  if (!geoResponse.ok) throw new Error(geoBody.message || 'Could not look up that ZIP code.');
  const { latitude, longitude, city, state: region } = geoBody;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/breeders_search`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_lat: latitude, p_lon: longitude, p_radius_miles: radiusMiles })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Breeder search is temporarily unavailable.');
  return { breeders: body || [], searchedNear: `${city}, ${region}` };
}

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
      <img class="color-photo" src="${color.image}" alt="Maine Coon with a ${color.name.toLowerCase()} coat" loading="lazy">
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
  container.innerHTML = `<h3>${results.length} breeder ${results.length === 1 ? 'listing' : 'listings'} near ${state.searchedNear}</h3><p class="small">Green = closest 75% · yellow = outer 25% · red = overflow ring beyond your radius.</p>` + results.map((breeder) => `
    <article class="breeder-card ${state.selectedBreeder?.slug === breeder.slug ? 'selected' : ''}" style="border-left: 4px solid ${breeder.band_color || '#eab308'}">
      <div>
        <span class="badge">${breeder.verification === 'registry_confirmed' ? 'Registry verified' : breeder.verification?.replace('_', ' ') || 'Verification not stated'}</span>
        <h3>${breeder.cattery_name}</h3>
        <p class="location">${breeder.city || ''}, ${breeder.state || ''} · ${Number(breeder.distance_miles).toFixed(1)} miles away</p>
        <p>${(breeder.lineage_types || []).length ? breeder.lineage_types.join(' · ') : 'Type not stated'} · ${(breeder.registries || []).join(' · ') || 'Registries not stated'}</p>
        <p class="small">${breeder.contact_notes || 'Contact details are listed according to the published contact methods.'}</p>
        <p class="small"><b>Contact:</b> ${(breeder.contact_methods || ['unknown']).map((method) => ({phone:'Phone',email:'Email',website_form:'Website form',chat_widget:'Live chat',facebook_message:'Facebook message',instagram_dm:'Instagram DM',application_only:'Application',unknown:'Not published'}[method] || method)).join(' · ')}</p>
      </div>
      <button class="secondary-btn select-breeder" data-breeder="${breeder.slug}">${state.selectedBreeder?.slug === breeder.slug ? 'Selected' : 'Select breeder'}</button>
    </article>
  `).join('');
  container.querySelectorAll('.select-breeder').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedBreeder = window.currentBreeders.find((breeder) => breeder.slug === button.dataset.breeder);
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
  container.innerHTML = `<div class="selected-card"><h3>${state.selectedBreeder.cattery_name}</h3><p>${state.selectedBreeder.city || ''}, ${state.selectedBreeder.state || ''} · ${state.selectedBreeder.contact_notes || 'Review the published contact methods before reaching out.'}</p><p class="small">The generated email will open in your mail app when an email contact is published. Review the recipient, message, and attachments before sending.</p></div>`;
}

function updateEmailButton() {
  document.getElementById('generateEmailBtn').disabled = !state.selectedBreeder;
}

function buildEmail() {
  const color = state.selectedColor?.name || 'an available Maine Coon kitten';
  const type = state.selectedType ? `${state.selectedType} type` : 'American or European type';
  const subject = `Maine Coon inquiry: ${color}, ${type}`;
  const body = `Hello ${state.selectedBreeder.cattery_name},\n\nI am interested in a Maine Coon kitten and would appreciate learning more about your program. My current preferences are:\n\n• Coat color: ${color}\n• Preferred type: ${type}\n• Travel radius: ${state.selectedRadius || 'not specified'} miles from ZIP ${state.zip || 'not specified'}\n\nBefore making any final decision, could you please share the following for the available kitten and both parents?\n\n1. Registered names, pedigrees, and dates of birth\n2. HCM screening history, including echocardiogram reports and cardiologist details\n3. Hip screening results (OFA or PennHIP)\n4. DNA test results for SMA, PKDef, and any relevant lineage-specific conditions\n5. Vaccination, parasite prevention, and veterinary records\n6. Contract, health guarantee, return policy, and spay/neuter terms\n7. Socialization routine, current diet, and expected go-home date\n8. Recent photos or a video call with the kitten and mother\n\nPlease complete or return the attached breeder questionnaire, or reply with the answers above. I will review the documentation with my veterinarian before making any commitment.\n\nThank you,\n[Your name]\n[Your phone number]`;
  return { subject, body };
}

function setupTheme() {
  const saved = localStorage.getItem('maine-coon-theme');
  const preferred = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.dataset.theme = preferred;
  const button = document.getElementById('themeToggle');
  const update = () => { button.textContent = document.documentElement.dataset.theme === 'dark' ? 'Light theme' : 'Dark theme'; };
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
  searchBtn.addEventListener('click', async () => {
    state.zip = zipInput.value.trim();
    state.selectedRadius = Number(radiusInput.value);
    const status = document.getElementById('searchStatus');
    status.textContent = 'Looking up ZIP code and nearby active breeders…';
    searchBtn.disabled = true;
    try {
      const result = await searchSupabaseBreeders(state.zip, state.selectedRadius);
      state.searchedNear = result.searchedNear;
      window.currentBreeders = result.breeders;
      status.textContent = `Search centered on ${result.searchedNear}. Results include the database overflow ring.`;
      renderBreeders(result.breeders);
      updatePreview();
      advanceTo(4);
      document.querySelector('.breeder-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('[v0] Breeder search failed:', error);
      status.textContent = error.message.includes('ZIP') || error.message.includes('look up') ? "That doesn't look like a valid US ZIP code." : 'We could not complete that search. Please try again.';
      document.getElementById('breederResults').innerHTML = '';
    } finally {
      updateSearchState();
    }
  });

  document.getElementById('generateEmailBtn').addEventListener('click', () => {
    const { subject, body } = buildEmail();
    const draft = document.getElementById('emailDraft');
    const emailAction = state.selectedBreeder.email ? `<a class="primary-btn email-link" href="mailto:${state.selectedBreeder.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Open in email app</a>` : `<p class="note">This breeder does not publish an email address. Use the contact methods listed on their profile and paste the copied draft there.</p>`;
    draft.innerHTML = `<div class="draft-header"><b>Draft ready</b><button class="secondary-btn" id="copyEmail">Copy text</button></div><pre>${body.replace(/</g, '&lt;')}</pre>${emailAction}`;
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
