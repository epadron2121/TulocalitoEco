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
