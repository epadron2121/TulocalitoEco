// ===== CHAT + FAQ =====
const CHAT_KEY = 'demo_chat_msgs_v1';
const QKEY = 'demo_questions_v1';

document.addEventListener('DOMContentLoaded', () => {
  // --- Chat refs
  const chatOpen = document.getElementById('chat-open');
  const chatClose = document.getElementById('chat-close');
  const chatBox = document.getElementById('chat-box');
  const chatList = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  // Validar que existan
  if (!chatOpen || !chatClose || !chatBox || !chatList || !chatForm || !chatInput) {
    console.warn('Chat: faltan elementos en el DOM');
    return;
  }

  const chatLoad = () => JSON.parse(localStorage.getItem(CHAT_KEY) || '[]');
  const chatSave = (msgs) => localStorage.setItem(CHAT_KEY, JSON.stringify(msgs));

  function chatRender() {
    chatList.innerHTML = '';
    chatLoad().forEach(m => {
      const div = document.createElement('div');
      div.className = `chat-msg ${m.sender === 'me' ? 'me' : 'bot'}`;
      div.textContent = m.text;
      chatList.appendChild(div);
    });
    chatList.scrollTop = chatList.scrollHeight;
  }

  function openChat() {
    chatBox.classList.remove('is-hidden');
    chatOpen.setAttribute('aria-expanded', 'true');
    chatRender();
    chatInput.focus();
  }

  function closeChat() {
    chatBox.classList.add('is-hidden');
    chatOpen.setAttribute('aria-expanded', 'false');
  }

  chatOpen.addEventListener('click', () => {
    const isHidden = chatBox.classList.contains('is-hidden');
    if (isHidden) openChat(); else closeChat();
  });

  chatClose.addEventListener('click', () => closeChat());

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;
    const msgs = chatLoad();
    msgs.push({ sender: 'me', text: txt, ts: Date.now() });
    chatSave(msgs);
    chatInput.value = '';
    chatRender();

    setTimeout(() => {
      const auto = chatLoad();
      auto.push({ sender: 'bot', text: '¡Gracias! En breve te respondemos 👋', ts: Date.now() });
      chatSave(auto);
      chatRender();
    }, 400);
  });

  // Saludo inicial si no hay historial
  if (chatLoad().length === 0) {
    chatSave([{ sender: 'bot', text: 'Hola 👋 ¿En qué podemos ayudarte?', ts: Date.now() }]);
  }

  // --- FAQ refs
  const qList = document.getElementById('q-list');
  const qForm = document.getElementById('q-form');
  const qName = document.getElementById('q-name');
  const qText = document.getElementById('q-text');
  const faqSearch = document.getElementById('faq-search');
  const faqList = document.getElementById('faq-list');

  const qLoad = () => JSON.parse(localStorage.getItem(QKEY) || '[]');
  const qSave = (data) => localStorage.setItem(QKEY, JSON.stringify(data));

  function paintQuestions(filter = '') {
    if (!qList) return;
    qList.innerHTML = '';
    qLoad()
      .filter(q => q.text.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.ts - a.ts)
      .forEach(q => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${q.name || 'Anónimo'}:</strong> ${q.text}`;
        qList.appendChild(li);
      });
  }

  if (qForm) {
    qForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (qName?.value || '').trim();
      const text = (qText?.value || '').trim();
      if (!text) return;
      const data = qLoad();
      data.push({ name, text, ts: Date.now() });
      qSave(data);
      if (qText) qText.value = '';
      paintQuestions(faqSearch?.value || '');
    });
  }

  if (faqSearch && faqList) {
    faqSearch.addEventListener('input', () => {
      const q = faqSearch.value.toLowerCase();
      Array.from(faqList.querySelectorAll('details')).forEach(d => {
        d.style.display = d.textContent.toLowerCase().includes(q) ? 'block' : 'none';
      });
      paintQuestions(q);
    });
  }

  paintQuestions();
});



// === SLIDER SIMPLE ===
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slider-track img");
  const prevBtn = document.querySelector(".slider-btn.prev");
  const nextBtn = document.querySelector(".slider-btn.next");
  const dotsContainer = document.querySelector(".slider-dots");

  if (!track || slides.length === 0) return;

  let index = 0;

  // Crear puntos
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      index = i;
      updateSlider();
    });
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll("button");

  function updateSlider() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");
  }

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateSlider();
  });

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateSlider();
  });

  // Auto-play cada 4 seg
  setInterval(() => {
    index = (index + 1) % slides.length;
    updateSlider();
  }, 4000);
});


/* ===== RATING (Stars) ===== */
(function () {
  const STORE_KEY = 'ratings_v1';

  const load = () => JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  const save = (obj) => localStorage.setItem(STORE_KEY, JSON.stringify(obj));

  function setUI($rating, value) {
    const stars = [...$rating.querySelectorAll('.star')];
    stars.forEach(btn => {
      const checked = Number(btn.dataset.value) <= value;
      btn.setAttribute('aria-checked', checked ? 'true' : 'false');
      btn.classList.toggle('active', checked);
    });
  }

  function updateSummary($rating, my, data) {
    const myEl = $rating.parentElement.querySelector('.rating-my');
    const avgEl = $rating.parentElement.querySelector('.rating-avg');
    const cntEl = $rating.parentElement.querySelector('.rating-count');

    // En este demo “promedio local” = promedio de TODAS las calificaciones guardadas para esa clave
    const key = $rating.dataset.key;
    const arr = (data[key]?.all || []);
    const sum = arr.reduce((a,b) => a+b, 0);
    const avg = arr.length ? (sum / arr.length) : 0;

    if (myEl)  myEl.textContent  = my ? `${my}★` : '—';
    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (cntEl) cntEl.textContent = arr.length;
  }

  function initRating($rating) {
    const key = $rating.dataset.key;
    if (!key) return;

    const data = load();
    const my = data[key]?.mine || 0;
    setUI($rating, my);
    updateSummary($rating, my, data);

    $rating.addEventListener('click', (e) => {
      const btn = e.target.closest('.star');
      if (!btn) return;
      const val = Number(btn.dataset.value || 0);
      const store = load();

      if (!store[key]) store[key] = { mine: 0, all: [] };
      // si el usuario vuelve a hacer click en la misma, permitimos “cambiar” la suya
      store[key].mine = val;

      // guardamos histórico simple para el “promedio local”
      store[key].all = Array.isArray(store[key].all) ? store[key].all : [];
      store[key].all.push(val);

      save(store);
      setUI($rating, val);
      updateSummary($rating, val, store);
    });

    // Accesible con teclado (← →)
    $rating.addEventListener('keydown', (e) => {
      const stars = [...$rating.querySelectorAll('.star')];
      const current = Number((load()[key]?.mine) || 0);
      let next = current;
      if (e.key === 'ArrowRight') next = Math.min(5, current + 1);
      if (e.key === 'ArrowLeft')  next = Math.max(1, current - 1);
      if (next !== current) {
        stars[next - 1]?.click();
        e.preventDefault();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rating[data-key]').forEach(initRating);
  });
})();
