/**
 * SAGE Platform - Personal Cabinet Engine (v3.2)
 * Pure Swiss Stark Brutalism Architecture
 * Canonical Tabs: knowledge | education | solutions | club | members | favorites | profile
 */

// ── 1. GLOBAL STATE & UTILITIES ──────────────────────────────────────────────
let networkingMembersCache = [];
let activeMemberRoleFilter = 'all';

function safeJsonParse(val, fallback = null) {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

// ── 2. REAL CLUB MASTER-CLASSES DATA ─────────────────────────────────────────
const CLUB_LESSONS_DATA = [
  {
    id: 'lesson-969',
    title: 'SKILLS: Навыки в нейронных сетях. Настраиваем агентов',
    badge: 'МАСТЕР-КЛАСС // КЛУБ',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/ooYCG6pSQoMx28ikQiXbCp/pliG4cRv',
    embedUrl: 'https://kinescope.io/embed/ooYCG6pSQoMx28ikQiXbCp',
    cover: '/assets/club-lessons/lesson_media_969.jpg',
    date: '22 июня 2026',
    duration: '1ч 45мин',
    description: 'Архитектура кастомных навыков (skills) для LLM-агентов. Как проектировать системные промпты, связывать инструменты через MCP и исключать галлюцинации моделей в проде.',
    topics: ['AI-Агенты', 'Промпт-инжиниринг', 'MCP-серверы', 'Контекст']
  },
  {
    id: 'lesson-764',
    title: 'Как создавать сайты с помощью нейросетей. Обзор Stitch',
    badge: 'ВИДЕО-УРОК // STITCH',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/6caXdYNxSMZWduyUB6ChQM/pljpPBB6',
    embedUrl: 'https://kinescope.io/embed/6caXdYNxSMZWduyUB6ChQM',
    cover: '/assets/club-lessons/lesson_media_764.jpg',
    date: '29 апреля 2026',
    duration: '1ч 12мин',
    description: 'Пошаговый пайплайн генерации веб-интерфейсов и адаптивных дизайн-систем через Google Stitch MCP. Экспорт чистого Tailwind/HTML и быстрая посадка на хостинг.',
    topics: ['Google Stitch', 'Vibe Coding', 'UI/UX', 'Tailwind']
  },
  {
    id: 'lesson-619',
    title: 'Как создавать нейро-фотосессии: FLOW. Разбор инструмента',
    badge: 'МАСТЕР-КЛАСС // FLOW',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/qNU4ub4VBQCmSHLhpeGSt9/plOoNiik',
    embedUrl: 'https://kinescope.io/embed/qNU4ub4VBQCmSHLhpeGSt9',
    cover: '/assets/club-lessons/lesson_media_619.jpg',
    date: '6 апреля 2026',
    duration: '54 мин',
    description: 'Полноценный разбор генератора FLOW для создания реалистичных коммерческих фотосессий, лукбуков для брендов и сохранения внешности моделей.',
    topics: ['FLOW', 'Нейрофото', 'Face Lock', 'Промпты']
  },
  {
    id: 'lesson-615',
    title: 'NotebookLM: Полный разбор всех возможностей',
    badge: 'ВИДЕО-УРОК // NOTEBOOKLM',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/snmkLPhNSqQQqWhMhCsSFF/pld6Hc5o',
    embedUrl: 'https://kinescope.io/embed/snmkLPhNSqQQqWhMhCsSFF',
    cover: '/assets/club-lessons/lesson_media_615.jpg',
    date: '6 апреля 2026',
    duration: '1ч 20мин',
    description: 'Глубокое погружение в Google NotebookLM: работа с базой знаний из сотен документов, генерация глубоких аудио-подкастов и извлечение инсайтов из PDF.',
    topics: ['NotebookLM', 'База Знаний', 'RAG', 'Аудио-обзоры']
  },
  {
    id: 'lesson-546',
    title: 'Мастер-класс «Создание Нейро-Подкастов»',
    badge: 'МАСТЕР-КЛАСС // ПОДКАСТЫ',
    type: 'video',
    platform: 'VK Video',
    videoUrl: 'https://vk.com/video708436546_456239175?list=ln-OazFwvzG9xkf9G1n2A',
    embedUrl: 'https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2',
    cover: '/assets/club-lessons/lesson_media_546.jpg',
    date: '25 марта 2026',
    duration: '1ч 35мин',
    description: 'Полный цикл производства аудио и видео-подкастов с помощью генеративных нейросетей: от сценария и структуры выпуска до клонирования голоса и сведения.',
    topics: ['Подкасты', 'Голосовые модели', 'Сценарии', 'ElevenLabs']
  },
  {
    id: 'lesson-332',
    title: 'Мастер-класс «Промпт-дизайн и создание ассистентов»',
    badge: 'МАСТЕР-КЛАСС // АССИСТЕНТЫ',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/0uEaDKVHDdqLmAj7krZ4Jd/plO41fqw',
    embedUrl: 'https://kinescope.io/0uEaDKVHDdqLmAj7krZ4Jd/plO41fqw',
    cover: '/assets/club-lessons/lesson_media_332.jpg',
    date: '1 марта 2026',
    duration: '1ч 40мин',
    description: 'Системный фреймворк создания надёжных промптов, ролевых моделей (GRACEF) и проектирования контекстных окон для цифровых ассистентов бизнеса.',
    topics: ['Промпт-дизайн', 'GRACEF', 'Ассистенты', 'Системный промпт']
  }
];

// ── 3. TAB SWITCHING SYSTEM ──────────────────────────────────────────────────
function switchCabinetTab(tabId, btnElem = null) {
  if (!tabId) tabId = 'knowledge';

  // Normalize legacy aliases
  let targetTab = tabId.toLowerCase();
  if (targetTab === 'dashboard') targetTab = 'knowledge';
  if (targetTab === 'library') targetTab = 'education';
  if (targetTab === 'store') targetTab = 'solutions';
  if (targetTab === 'community') targetTab = 'club';

  const validTabs = ['knowledge', 'education', 'solutions', 'club', 'members', 'favorites', 'profile'];
  if (!validTabs.includes(targetTab)) {
    targetTab = 'knowledge';
  }

  // 1. Update tab buttons
  document.querySelectorAll('.cabinet-tab-btn').forEach(b => {
    const t = (b.dataset.tab || b.getAttribute('data-tab') || '').toLowerCase();
    const matches = (t === targetTab) || 
      (targetTab === 'education' && t === 'library') ||
      (targetTab === 'solutions' && t === 'store') ||
      (targetTab === 'club' && t === 'community');
    if (matches) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // 2. Update tab panes
  document.querySelectorAll('.cabinet-tab-pane, .cabinet-section-pane').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const activePane = document.getElementById('tab-' + targetTab) ||
    (targetTab === 'education' ? document.getElementById('tab-library') : null) ||
    (targetTab === 'solutions' ? document.getElementById('tab-store') : null) ||
    (targetTab === 'club' ? document.getElementById('tab-community') : null);

  if (activePane) {
    activePane.classList.add('active');
    activePane.style.display = 'block';
  }

  // 3. Persist active tab & sync URL
  try {
    localStorage.setItem('asage_cabinet_tab', targetTab);
    const url = new URL(window.location.href);
    if (url.searchParams.get('tab') !== targetTab) {
      url.searchParams.set('tab', targetTab);
      window.history.replaceState({ tab: targetTab }, '', url.pathname + '?' + url.searchParams.toString() + window.location.hash);
    }
  } catch (e) {}

  // 4. Trigger on-demand rendering
  if (targetTab === 'education') {
    renderClubLessons();
  } else if (targetTab === 'members') {
    loadMembersDirectory();
  } else if (targetTab === 'favorites') {
    renderFavorites();
  } else if (targetTab === 'profile') {
    populateProfileForm();
    livePreviewProfile();
  }

  if (typeof window.trackMetrikaEvent === 'function') {
    window.trackMetrikaEvent('cabinet_tab_switch', { tab: targetTab });
  }
}

// ── 4. RENDER CLUB LESSONS & VIDEO MODAL ──────────────────────────────────────
function renderClubLessons() {
  const grid = document.getElementById('club-lessons-grid');
  const banner = document.getElementById('club-lessons-access-banner');
  const pill = document.getElementById('club-lessons-status-pill');
  if (!grid) return;

  const hasAccess = typeof Auth !== 'undefined' && Auth.hasClubAccess ? Auth.hasClubAccess() : false;

  // Render Status Pill (Only for non-residents)
  if (pill) {
    if (hasAccess) {
      pill.innerHTML = '';
      pill.style.display = 'none';
    } else {
      pill.innerHTML = '<span class="badge-role" style="background:#fef2f2; color:#dc2626; border-color:#fecaca; font-weight:700;">🔒 ДОСТУП ЗАКРЫТ</span>';
      pill.style.display = 'block';
    }
  }

  // Render Access Banner (Only for non-residents)
  if (banner) {
    if (hasAccess) {
      banner.innerHTML = '';
      banner.style.display = 'none';
    } else {
      banner.style.display = 'block';
      banner.innerHTML = `
        <div class="club-access-status-banner locked" style="background:#09090b; color:#ffffff; border:1px solid #27272a; padding:20px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:1.8rem;">🔒</div>
            <div>
              <strong style="display:block; font-size:1.05rem; color:#ffffff;">Материалы доступны резидентам клуба SAGE Neuro Family</strong>
              <span style="font-size:0.88rem; color:#a1a1aa;">Эксклюзивные записи живых воркшопов и закрытые туториалы доступны участникам клуба по подписке (1 900 ₽ первый месяц, далее 1 500 ₽/мес).</span>
            </div>
          </div>
          <div>
            <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-primary" style="background:#ffffff; color:#09090b; border-color:#ffffff; padding:10px 20px; font-size:0.84rem; font-weight:700; font-family:var(--mono); text-decoration:none;">
              Вступить в Клуб (1 900 ₽) ↗
            </a>
          </div>
        </div>
      `;
    }
  }

  // Render Lessons Cards
  let html = '';
  CLUB_LESSONS_DATA.forEach(l => {
    const isFav = typeof Auth !== 'undefined' && Auth.isFavorite ? Auth.isFavorite('lesson', l.id) : false;
    const topicsHtml = l.topics.map(t => `<span class="tech-tag" style="font-size:0.7rem; padding:2px 8px;">${t}</span>`).join(' ');

    const isPurchased = typeof Auth !== 'undefined' && Auth.hasPurchasedItem ? Auth.hasPurchasedItem(l.id) : false;
    const isUnlocked = hasAccess || isPurchased;

    let actionBtnHtml = '';
    if (isUnlocked) {
      if (l.type === 'doc') {
        actionBtnHtml = `<a href="${l.docUrl}" target="_blank" class="btn-primary" style="padding:10px 16px; font-size:0.82rem; width:100%; justify-content:center; text-align:center; text-decoration:none; display:inline-flex; align-items:center; gap:8px;"><span>📄</span> Открыть туториал (${l.platform}) ↗</a>`;
      } else {
        actionBtnHtml = `<button onclick="openClubVideo('${l.id}')" class="btn-primary" style="padding:10px 16px; font-size:0.82rem; width:100%; justify-content:center; cursor:pointer; display:inline-flex; align-items:center; gap:8px;"><span>▶</span> Смотреть мастер-класс</button>`;
      }
    } else {
      actionBtnHtml = `
        <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
          <button onclick="Auth.initiatePayment({ itemId: '${l.id}', itemType: 'video', amount: 349, title: '${encodeURIComponent(l.title)}' })" class="btn-primary" style="padding:10px 14px; font-size:0.82rem; width:100%; justify-content:center; cursor:pointer; background:#09090b; color:#ffffff; font-weight:700; font-family:var(--mono); display:flex; align-items:center; gap:6px;">
            <span>💳 Купить за 349 ₽</span> ↗
          </button>
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-secondary" style="padding:9px 14px; font-size:0.82rem; width:100%; justify-content:center; text-align:center; text-decoration:none; background:#fafafa; color:#52525b; border:1px solid #d4d4d8; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
            <span>💎 Вступить в Клуб (все уроки)</span> ↗
          </a>
        </div>
      `;
    }

    const lockBadgeHtml = !isUnlocked ? `<div class="club-lesson-lock-overlay">🔒 349 ₽ // Клуб</div>` : '';

    html += `
      <div class="club-lesson-card cabinet-card" id="card-${l.id}" style="padding:0; overflow:hidden;">
        <div class="club-lesson-cover-wrap">
          <img src="${l.cover}" alt="${l.title}" loading="lazy" onerror="this.src='/img/og-preview.png'">
          <div class="club-lesson-badge-overlay">${l.badge}</div>
          ${lockBadgeHtml}
          <button class="club-lesson-fav-btn-float ${isFav ? 'active' : ''}" 
                  onclick="toggleClubLessonFavorite(event, '${l.id}')" 
                  title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}" 
                  aria-label="В избранное">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
        <div class="club-lesson-body" style="padding:24px;">
          <div class="club-lesson-meta" style="display:flex; justify-content:space-between; font-family:var(--mono); font-size:0.74rem; color:var(--gray); margin-bottom:10px;">
            <span>🗓 ${l.date}</span>
            <span>⏱ ${l.duration}</span>
          </div>
          <h3 class="club-lesson-title" style="font-size:1.15rem; font-weight:700; margin:0 0 10px 0; line-height:1.3;">${l.title}</h3>
          <p class="club-lesson-desc" style="font-size:0.88rem; color:var(--gray); line-height:1.5; margin-bottom:16px;">${l.description}</p>
          <div class="card-tech-stack" style="margin-bottom:20px;">
            ${topicsHtml}
          </div>
          <div class="club-lesson-footer" style="border-top:1px solid #f4f4f5; padding-top:16px;">
            <div style="display:flex; gap:8px; width:100%; align-items:center;">
              <div style="flex:1;">
                ${actionBtnHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function openClubVideo(lessonId) {
  const lesson = CLUB_LESSONS_DATA.find(l => l.id === lessonId);
  if (!lesson) return;

  const modal = document.getElementById('club-video-modal');
  const title = document.getElementById('club-modal-title');
  const badge = document.getElementById('club-modal-badge');
  const iframe = document.getElementById('club-modal-iframe');
  const extLink = document.getElementById('club-modal-ext-link');

  if (title) title.innerText = lesson.title;
  if (badge) badge.innerText = lesson.badge;
  if (extLink) {
    if (lesson.videoUrl) {
      extLink.href = lesson.videoUrl;
      extLink.style.display = 'inline-flex';
      extLink.innerText = `Открыть в ${lesson.platform || 'плеере'} ↗`;
    } else {
      extLink.style.display = 'none';
    }
  }

  if (iframe && lesson.embedUrl) {
    const sep = lesson.embedUrl.includes('?') ? '&' : '?';
    iframe.src = `${lesson.embedUrl}${sep}autoplay=1`;
  }
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeClubVideoModal() {
  const modal = document.getElementById('club-video-modal');
  const iframe = document.getElementById('club-modal-iframe');
  if (iframe) iframe.src = '';
  if (modal) modal.style.display = 'none';
}

function toggleClubLessonFavorite(e, lessonId) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }
  const lesson = CLUB_LESSONS_DATA.find(l => l.id === lessonId);
  if (!lesson || typeof Auth === 'undefined' || !Auth.toggleFavorite) return;

  Auth.toggleFavorite('lesson', lessonId, lesson.title, {
    desc: lesson.description,
    badge: lesson.badge,
    date: lesson.date,
    duration: lesson.duration,
    cover: lesson.cover
  });

  renderClubLessons();
  const badge = document.getElementById('fav-counter-badge');
  if (badge && Auth.getFavorites) badge.innerText = Auth.getFavorites().length;
}

// ── 5. LIGHTING & CAMERA ANGLES GUIDE MODALS ─────────────────────────────────
function openLightingGuideModal() {
  if (typeof Auth !== 'undefined' && !Auth.isChannelSubscriber()) {
    Auth.openChannelGateModal({
      title: 'Шпаргалка по свету (20 схем)',
      onVerified: () => openLightingGuideModal()
    });
    return;
  }

  const existing = document.getElementById('guide-lighting-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'guide-lighting-modal';
  modal.className = 'guide-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeGuideModal('guide-lighting-modal'); };

  const lightingSchemes = [
    { name: '🌅 Golden Hour', desc: 'Тёплые золотистые оттенки, мягкие длинные тени, закатный вайб', prompt: 'golden hour lighting, warm golden tones, soft long shadows, cinematic sunset atmosphere' },
    { name: '🌌 Blue Hour', desc: 'Холодный синий свет, рассветная или сумеречная атмосфера', prompt: 'blue hour lighting, cool deep blue tones, subtle shadows, dawn atmosphere' },
    { name: '☁️ Overcast Light', desc: 'Мягкий рассеянный свет без резких теней, естественные цвета', prompt: 'overcast diffused lighting, soft even illumination, natural neutral colors' },
    { name: '✨ Diffused Light', desc: 'Равномерный мягкий свет, идеален для студийных портретов', prompt: 'diffused studio lighting, soft flattering light, gentle falloff' },
    { name: '🌇 Backlighting & Rim Light', desc: 'Источник света позади объекта, создаёт сияющий контур', prompt: 'strong backlighting, rim light, glowing silhouette edge, cinematic halo' },
    { name: '🌿 Soft Ambient Light', desc: 'Нежное рассеянное освещение интерьера, уют и глубина', prompt: 'soft ambient light, cozy room illumination, natural gentle shadows' },
    { name: '🖤 Low-Key Lighting', desc: 'Тёмный контрастный свет, глубокие тени и драматизм', prompt: 'dramatic low-key lighting, deep dark shadows, high contrast, moody chiaroscuro' },
    { name: '🤍 High-Key Lighting', desc: 'Яркое, светлое с минимумом теней — чистота и свежесть', prompt: 'high-key lighting, bright airy scene, minimal soft shadows, pure clean look' },
    { name: '🏠 Window Light', desc: 'Естественный свет из окна, мягкие блики и текстура кожи', prompt: 'natural window light, soft directional sunlight, organic shadow gradient' },
    { name: '🌳 Dappled Light', desc: 'Солнечные блики и пятна сквозь листву — динамика и игра света', prompt: 'dappled sunlight filtering through foliage, organic light patterns, textured shadows' },
    { name: '💡 Spotlight', desc: 'Фокус жесткого света на одном объекте, максимальная драма', prompt: 'intense direct spotlight, sharp dramatic focal beam, heavy contrast falloff' },
    { name: '🌆 Twilight Light', desc: 'Мягкий свет вечерних сумерек, кинематографичность', prompt: 'twilight evening light, dusky cinematic ambient, rich deep sky tones' },
    { name: '🕯 Candlelight', desc: 'Тёплый мерцающий свет свечей, интимность и золотой оттенок', prompt: 'warm flickering candlelight, intimate golden glow, soft penumbra shadows' },
    { name: '🎇 Neon Light', desc: 'Яркие неоновые огни, футуристичный киберпанк / ночной город', prompt: 'vibrant neon lighting, dual color cyan and magenta reflections, cyberpunk city night' },
    { name: '🌕 Moonlight', desc: 'Холодный серебристый ночной свет, магия луны', prompt: 'ethereal cool moonlight, silvery highlights, deep midnight shadows' },
    { name: '🚦 Street Light', desc: 'Желтоватое свечение уличных фонарей, городской вайб', prompt: 'warm sodium street lamp lighting, nighttime urban atmosphere, wet asphalt reflections' },
    { name: '🔁 Bounced Light', desc: 'Отражённый свет от поверхностей, естественный fill-свет', prompt: 'bounced indirect illumination, soft ambient bounce, natural fill light' },
    { name: '🌞 Lens Flare', desc: 'Анаморфотные солнечные блики в объективе, реализм', prompt: 'cinematic anamorphic lens flare, bright sun streak, photographic optical realism' },
    { name: '🎥 Studio 3-Point Light', desc: 'Трехточечный студийный свет (Key, Fill, Backlight)', prompt: 'professional 3-point studio lighting, balanced key and fill light, crisp rim highlight' },
    { name: '🔲 Pattern Light (Gobo)', desc: 'Свет с узорами через жалюзи или решётку, графичность', prompt: 'gobo patterned light, window blind shadows projected onto subject, graphic depth' }
  ];

  let rowsHtml = lightingSchemes.map(s => `
    <div class="guide-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f4f4f5; gap:16px;">
      <div class="guide-item-info" style="flex:1;">
        <strong style="display:block; font-size:0.92rem; color:#09090b;">${s.name} — ${s.desc}</strong>
        <div class="guide-prompt-code" style="font-family:var(--mono); font-size:0.76rem; color:#52525b; background:#f4f4f5; padding:6px 10px; margin-top:4px;">${s.prompt}</div>
      </div>
      <button class="guide-copy-btn btn-secondary" style="padding:6px 14px; font-size:0.75rem; font-family:var(--mono);" onclick="copyGuidePrompt('${s.prompt.replace(/'/g, "\\'")}', this)">Копировать</button>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="guide-modal-content" style="background:#ffffff; max-width:840px; width:100%; max-height:85vh; overflow-y:auto; border:1px solid var(--border);">
      <div class="guide-modal-header" style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.2rem; font-weight:800;">💡 Шпаргалка по свету (20 схем освещения)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-lighting-modal')" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>
      <div class="guide-modal-body" style="padding:20px;">
        <div style="font-family:var(--mono); font-size:0.75rem; font-weight:700; color:var(--gray); margin-bottom:12px;">// 20 КИНЕМАТОГРАФИЧЕСКИХ СХЕМ СВЕТА ДЛЯ MIDJOURNEY, FLUX & DALL-E</div>
        ${rowsHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openAnglesGuideModal() {
  if (typeof Auth !== 'undefined' && !Auth.isChannelSubscriber()) {
    Auth.openChannelGateModal({
      title: 'Гид по ракурсам съемки (20 схем)',
      onVerified: () => openAnglesGuideModal()
    });
    return;
  }

  const existing = document.getElementById('guide-angles-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'guide-angles-modal';
  modal.className = 'guide-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeGuideModal('guide-angles-modal'); };

  const angles = [
    { name: '📸 Анфас (Full Face)', desc: 'Прямой контакт глаза в глаза, открытость и симметрия', prompt: 'front view, centered headshot, direct gaze at camera, symmetrical composition' },
    { name: '📐 3/4 ракурс (Three-quarter)', desc: 'Классический портретный поворот головы на 45 градусов', prompt: 'three-quarter view, 45 degree angle portrait, natural dimension and cheekbone definition' },
    { name: '👤 Профиль (Profile)', desc: 'Строго боком, акцент на силуэте и контурах лица', prompt: 'side view, profile shot, silhouette focus, clean jawline contour' },
    { name: '💫 Полуанфас (Semi-profile)', desc: 'Между 3/4 и профилем, акцент на скулах', prompt: 'semi-profile, subtle head turn, highlighting cheekbones and soft jawline' },
    { name: '🚶 Со спины (Back View)', desc: 'Загадочность и эффект созерцания сцены', prompt: 'view from behind, back to camera, looking at horizon, mysterious mood' },
    { name: '👁️ Уровень глаз (Eye Level)', desc: 'Нейтральная и реалистичная естественная перспектива', prompt: 'eye-level shot, natural perspective, direct human connection' },
    { name: '⬆️ Нижний ракурс (Low Angle)', desc: 'Властный, монументальный ракурс снизу вверх', prompt: 'low angle shot, looking up at person, heroic perspective, imposing authority' },
    { name: '⬇️ Верхний ракурс (High Angle)', desc: 'Взгляд сверху вниз, хрупкость или уязвимость', prompt: 'high angle shot, looking down at subject, emotional perspective' },
    { name: '🦅 Птичий полет (Bird\'s Eye)', desc: 'Вид строго сверху (Top-down) с высоты', prompt: 'bird\'s eye view, top-down perspective, high altitude cinematic shot' },
    { name: '🐜 Лягушачий ракурс (Worm\'s Eye)', desc: 'Экстремальный ракурс от самой поверхности земли', prompt: 'worm\'s eye view, ground level photography, extreme perspective looking straight up' },
    { name: '📐 Голландский угол (Dutch Angle)', desc: 'Заваленный горизонт, кинематографичное напряжение', prompt: 'dutch angle shot, tilted horizon, cinematic tension, dynamic framing' },
    { name: '👀 Субъективный ракурс (POV)', desc: 'Вид от первого лица глазами главного героя', prompt: 'first person point of view, POV shot, immersive perspective, subjective camera' },
    { name: '👥 Овершолдер (Over-the-shoulder)', desc: 'Взгляд через плечо собеседника в диалоге', prompt: 'over-the-shoulder shot, conversation framing, blurred foreground shoulder' },
    { name: '🔍 Макро (Macro Detail)', desc: 'Сверхкрупный план текстуры глаза, кожи или элемента', prompt: 'extreme close-up, macro shot of an eye, hyper-detailed texture, depth of field' }
  ];

  let rowsHtml = angles.map(a => `
    <div class="guide-item-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f4f4f5; gap:16px;">
      <div class="guide-item-info" style="flex:1;">
        <strong style="display:block; font-size:0.92rem; color:#09090b;">${a.name} — ${a.desc}</strong>
        <div class="guide-prompt-code" style="font-family:var(--mono); font-size:0.76rem; color:#52525b; background:#f4f4f5; padding:6px 10px; margin-top:4px;">${a.prompt}</div>
      </div>
      <button class="guide-copy-btn btn-secondary" style="padding:6px 14px; font-size:0.75rem; font-family:var(--mono);" onclick="copyGuidePrompt('${a.prompt.replace(/'/g, "\\'")}', this)">Копировать</button>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="guide-modal-content" style="background:#ffffff; max-width:840px; width:100%; max-height:85vh; overflow-y:auto; border:1px solid var(--border);">
      <div class="guide-modal-header" style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.2rem; font-weight:800;">📸 Шпаргалка по ракурсам съемки (20 схем)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-angles-modal')\" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>
      <div class="guide-modal-body" style="padding:20px;">
        <div style="font-family:var(--mono); font-size:0.75rem; font-weight:700; color:var(--gray); margin-bottom:12px;">// 20 РАКУРСОВ ДЛЯ ТОЧНОГО УПРАВЛЕНИЯ КАМЕРОЙ В НЕЙРОСЕТЯХ</div>
        ${rowsHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeGuideModal(id) {
  const m = document.getElementById(id);
  if (m) m.remove();
}

function copyGuidePrompt(text, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerText;
      btn.innerText = '✓ Скопировано';
      btn.style.background = '#10b981';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#fff';
      setTimeout(() => {
        btn.innerText = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1500);
    }).catch(() => {
      prompt('Скопируйте промпт:', text);
    });
  } else {
    prompt('Скопируйте промпт:', text);
  }
}

// ── 6. PROFILE DISPLAY & EDITING ─────────────────────────────────────────────
function updateCabinetProfile() {
  const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;
  const loggedInContainer = document.getElementById('profile-container-logged-in');
  const guestContainer = document.getElementById('profile-container-guest');

  if (user) {
    if (loggedInContainer) loggedInContainer.style.display = 'block';
    if (guestContainer) guestContainer.style.display = 'none';

    document.body.classList.add('user-logged-in');

    const displayName = (user.first_name + ' ' + (user.last_name || '')).trim() || user.username || 'Пользователь';
    const nameEl = document.getElementById('user-display-name') || document.getElementById('cabinet-display-name');
    if (nameEl) nameEl.innerText = displayName;

    const usernameEl = document.getElementById('user-username-badge') || document.getElementById('cabinet-tg-handle');
    if (usernameEl) {
      usernameEl.innerText = user.username ? '@' + user.username.replace(/^@/, '') : '';
      usernameEl.style.display = user.username ? 'inline-block' : 'none';
    }

    const idValEl = document.getElementById('user-id-val');
    if (idValEl) {
      idValEl.innerText = user.telegram_id || (user.id ? String(user.id).slice(0, 8) : '—');
    }

    const tgId = Number(user.telegram_id || 0);
    const uname = (user.username || '').toLowerCase();
    const isMikhail = uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911 || user.role === 'founder';
    const isClub = isMikhail || user.role === 'club_member' || (typeof Auth !== 'undefined' && Auth.hasClubAccess && Auth.hasClubAccess());

    // ── Update SAGE NEURO FAMILY Subscription Block (Profile Tab) ──
    const subActiveEl = document.getElementById('subscription-status-active');
    const subInactiveEl = document.getElementById('subscription-status-inactive');
    if (subActiveEl && subInactiveEl) {
      if (isClub) {
        subActiveEl.style.display = 'block';
        subInactiveEl.style.display = 'none';
      } else {
        subActiveEl.style.display = 'none';
        subInactiveEl.style.display = 'block';
      }
    }

    const roleEl = document.getElementById('user-role-badge') || document.getElementById('cabinet-sub-badge');
    if (roleEl) {
      if (isMikhail) {
        roleEl.innerText = '👑 Основатель';
        roleEl.className = 'badge-role club';
        roleEl.style.background = '#09090b';
        roleEl.style.color = '#ffffff';
        roleEl.style.borderColor = '#09090b';
      } else if (isClub) {
        roleEl.innerText = '💎 Резидент';
        roleEl.className = 'badge-role club';
        roleEl.style.background = '';
        roleEl.style.color = '';
        roleEl.style.borderColor = '';
      } else {
        roleEl.innerText = 'Пользователь';
        roleEl.className = 'badge-role';
        roleEl.style.background = '#f4f4f5';
        roleEl.style.color = '#52525b';
        roleEl.style.borderColor = '#e4e4e7';
      }
    }

    const avatarWrap = document.getElementById('user-avatar-wrap');
    if (avatarWrap) {
      avatarWrap.innerHTML = user.photo_url
        ? `<img src="${user.photo_url}" alt="${displayName}" class="cabinet-avatar" width="76" height="76">`
        : `<div class="cabinet-avatar-placeholder">${displayName.charAt(0).toUpperCase()}</div>`;
    }

    const bioWrap = document.getElementById('user-bio-wrap');
    if (bioWrap) {
      if (user.bio && user.bio.trim()) {
        bioWrap.innerText = user.bio;
        bioWrap.style.display = 'block';
        bioWrap.style.fontStyle = 'normal';
        bioWrap.style.color = '#52525b';
      } else {
        bioWrap.innerText = 'Нажмите «Настроить профиль», чтобы добавить информацию о деятельности и контакты.';
        bioWrap.style.display = 'block';
        bioWrap.style.fontStyle = 'italic';
        bioWrap.style.color = '#a1a1aa';
      }
    }

    const extraDetails = document.getElementById('user-extra-details');
    if (extraDetails) {
      let detailsHtml = '';
      if (user.email) {
        detailsHtml += `<span class="cabinet-chip cabinet-chip-email">✉ ${user.email}</span>`;
      }
      if (user.channel_url) {
        const chHref = user.channel_url.startsWith('http') ? user.channel_url : `https://t.me/${user.channel_url.replace(/^@/, '')}`;
        detailsHtml += `<a href="${chHref}" target="_blank" class="cabinet-chip cabinet-chip-channel" title="${user.channel_url}">📢 Телеграм-канал ↗</a>`;
      }
      if (user.website_url) {
        const webHref = user.website_url.startsWith('http') ? user.website_url : `https://${user.website_url}`;
        detailsHtml += `<a href="${webHref}" target="_blank" class="cabinet-chip cabinet-chip-website" title="${user.website_url}">🌐 Сайт ↗</a>`;
      }
      extraDetails.innerHTML = detailsHtml;
    }

    // Toggle header access status badge
    const headerAccessStatus = document.getElementById('user-access-status');
    if (headerAccessStatus) {
      headerAccessStatus.style.display = isClub ? 'inline-block' : 'none';
    }

    // ── Update Left Dock Cockpit Elements ──
    const dockName = document.getElementById('dock-display-name');
    if (dockName) dockName.innerText = displayName;

    const dockUsername = document.getElementById('dock-username-badge');
    if (dockUsername) {
      dockUsername.innerText = user.username ? '@' + user.username.replace(/^@/, '') : '';
      dockUsername.style.display = user.username ? 'inline-block' : 'none';
    }

    const dockIdVal = document.getElementById('dock-user-id-val');
    if (dockIdVal) {
      dockIdVal.innerText = user.telegram_id || (user.id ? String(user.id).slice(0, 8) : '—');
    }

    const dockRole = document.getElementById('dock-role-badge');
    if (dockRole) {
      if (isMikhail) {
        dockRole.innerText = '👑 Основатель';
        dockRole.className = 'badge-role club';
        dockRole.style.background = '#09090b';
        dockRole.style.color = '#ffffff';
        dockRole.style.borderColor = '#09090b';
      } else if (isClub) {
        dockRole.innerText = '💎 Резидент';
        dockRole.className = 'badge-role club';
        dockRole.style.background = '';
        dockRole.style.color = '';
        dockRole.style.borderColor = '';
      } else {
        dockRole.innerText = 'Пользователь';
        dockRole.className = 'badge-role';
        dockRole.style.background = '#f4f4f5';
        dockRole.style.color = '#52525b';
        dockRole.style.borderColor = '#e4e4e7';
      }
    }

    const dockAccessStatus = document.getElementById('dock-access-status');
    if (dockAccessStatus) {
      dockAccessStatus.style.display = isClub ? 'block' : 'none';
    }

    const dockAvatarWrap = document.getElementById('dock-avatar-wrap');
    if (dockAvatarWrap) {
      dockAvatarWrap.innerHTML = user.photo_url
        ? `<img src="${user.photo_url}" alt="${displayName}" class="dock-avatar" width="52" height="52">`
        : `<div class="dock-avatar-placeholder">${displayName.charAt(0).toUpperCase()}</div>`;
    }

    const dockBioWrap = document.getElementById('dock-bio-wrap');
    if (dockBioWrap) {
      if (user.bio && user.bio.trim()) {
        dockBioWrap.innerText = user.bio;
        dockBioWrap.style.display = 'block';
        dockBioWrap.style.fontStyle = 'normal';
        dockBioWrap.style.color = '#52525b';
      } else {
        dockBioWrap.innerText = 'Нажмите «Настроить профиль», чтобы добавить информацию.';
        dockBioWrap.style.display = 'block';
        dockBioWrap.style.fontStyle = 'italic';
        dockBioWrap.style.color = '#a1a1aa';
      }
    }

    const dockExtraDetails = document.getElementById('dock-extra-details');
    if (dockExtraDetails) {
      let dockDetailsHtml = '';
      if (user.email) {
        dockDetailsHtml += `<span class="cabinet-chip cabinet-chip-email" title="${user.email}">✉ ${user.email}</span>`;
      }
      if (user.channel_url) {
        const chHref = user.channel_url.startsWith('http') ? user.channel_url : `https://t.me/${user.channel_url.replace(/^@/, '')}`;
        dockDetailsHtml += `<a href="${chHref}" target="_blank" class="cabinet-chip cabinet-chip-channel" title="${user.channel_url}">📢 Телеграм-канал ↗</a>`;
      }
      if (user.website_url) {
        const webHref = user.website_url.startsWith('http') ? user.website_url : `https://${user.website_url}`;
        dockDetailsHtml += `<a href="${webHref}" target="_blank" class="cabinet-chip cabinet-chip-website" title="${user.website_url}">🌐 Сайт ↗</a>`;
      }
      dockExtraDetails.innerHTML = dockDetailsHtml;
    }

    // Sync live preview with current profile state
    livePreviewProfile();
  } else {
    document.body.classList.remove('user-logged-in');
    if (loggedInContainer) loggedInContainer.style.display = 'none';
    if (guestContainer) guestContainer.style.display = 'block';

    const subActiveEl = document.getElementById('subscription-status-active');
    const subInactiveEl = document.getElementById('subscription-status-inactive');
    if (subActiveEl && subInactiveEl) {
      subActiveEl.style.display = 'none';
      subInactiveEl.style.display = 'block';
    }
  }

  // Update favorite badge
  const badge = document.getElementById('fav-counter-badge');
  if (badge && typeof Auth !== 'undefined' && Auth.getFavorites) {
    badge.innerText = Auth.getFavorites().length;
  }
}

function populateProfileForm() {
  const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;
  if (!user) return;

  const fn = document.getElementById('inp-first-name');
  if (fn && user.first_name) fn.value = user.first_name;

  const ln = document.getElementById('inp-last-name');
  if (ln && user.last_name) ln.value = user.last_name;

  const un = document.getElementById('inp-tg-username');
  if (un && user.username) un.value = user.username.startsWith('@') ? user.username : '@' + user.username;

  const bio = document.getElementById('inp-bio');
  if (bio && user.bio) bio.value = user.bio;

  const ch = document.getElementById('inp-channel');
  if (ch && user.channel_url) ch.value = user.channel_url;

  const ws = document.getElementById('inp-website');
  if (ws && user.website_url) ws.value = user.website_url;

  const priv = document.getElementById('inp-is-private');
  if (priv) priv.checked = !user.is_private;
}

function livePreviewProfile() {
  const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;

  const fnInput = document.getElementById('inp-first-name')?.value;
  const lnInput = document.getElementById('inp-last-name')?.value;
  const unInput = document.getElementById('inp-tg-username')?.value;
  const bioInput = document.getElementById('inp-bio')?.value;
  const isChecked = document.getElementById('inp-is-private')?.checked ?? (user ? !user.is_private : true);

  const fn = (fnInput !== undefined && fnInput.trim() !== '') ? fnInput.trim() : (user?.first_name || '');
  const ln = (lnInput !== undefined && lnInput.trim() !== '') ? lnInput.trim() : (user?.last_name || '');
  const un = (unInput !== undefined && unInput.trim() !== '') ? unInput.trim() : (user?.username || '');
  const bio = (bioInput !== undefined && bioInput.trim() !== '') ? bioInput.trim() : (user?.bio || '');

  const name = (fn + ' ' + ln).trim() || user?.username || 'Имя Фамилия';
  const handle = un ? (un.startsWith('@') ? un : '@' + un) : '@username';

  const previewName = document.getElementById('preview-user-name');
  if (previewName) previewName.innerText = name;

  const previewHandle = document.getElementById('preview-user-handle');
  if (previewHandle) previewHandle.innerText = handle;

  const previewBio = document.getElementById('preview-user-bio');
  if (previewBio) previewBio.innerText = bio || 'Описание деятельности и стек технологий...';

  // Live preview avatar photo or initial
  const previewAvatarWrap = document.getElementById('preview-avatar-wrap');
  if (previewAvatarWrap) {
    if (user && user.photo_url) {
      previewAvatarWrap.innerHTML = `<img src="${user.photo_url}" alt="${name}" class="member-avatar" style="width:52px; height:52px; object-fit:cover; border-radius:0 !important; border:1px solid #18181b; display:block;">`;
    } else {
      previewAvatarWrap.innerHTML = `<div class="member-avatar-placeholder" id="preview-avatar-placeholder">${name.charAt(0).toUpperCase()}</div>`;
    }
  } else {
    const previewAvatar = document.getElementById('preview-avatar-placeholder');
    if (previewAvatar) previewAvatar.innerText = name.charAt(0).toUpperCase();
  }

  // Update role badge in preview card
  const previewRoleBadge = document.getElementById('preview-role-badge');
  if (previewRoleBadge) {
    const tgId = Number(user?.telegram_id || 0);
    const uname = (user?.username || '').toLowerCase();
    const isMikhail = uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911 || user?.role === 'founder';
    const isClub = isMikhail || user?.role === 'club_member' || (typeof Auth !== 'undefined' && Auth.hasClubAccess && Auth.hasClubAccess());
    if (isMikhail) {
      previewRoleBadge.innerText = '👑 Основатель';
      previewRoleBadge.className = 'badge-role club';
      previewRoleBadge.style.background = '#09090b';
      previewRoleBadge.style.color = '#ffffff';
      previewRoleBadge.style.borderColor = '#09090b';
    } else if (isClub) {
      previewRoleBadge.innerText = '💎 Резидент';
      previewRoleBadge.className = 'badge-role club';
      previewRoleBadge.style.background = '';
      previewRoleBadge.style.color = '';
      previewRoleBadge.style.borderColor = '';
    } else {
      previewRoleBadge.innerText = 'Пользователь';
      previewRoleBadge.className = 'badge-role';
      previewRoleBadge.style.background = '#f4f4f5';
      previewRoleBadge.style.color = '#52525b';
      previewRoleBadge.style.borderColor = '#e4e4e7';
    }
  }

  const previewPrivacy = document.getElementById('preview-user-privacy');
  if (previewPrivacy) {
    if (isChecked) {
      previewPrivacy.innerText = '🌐 Отображается в каталоге резидентов';
      previewPrivacy.style.color = '#059669';
    } else {
      previewPrivacy.innerText = '🔒 Скрыт из общего каталога резидентов';
      previewPrivacy.style.color = '#dc2626';
    }
  }

  // Live preview for Left Dock
  const dockName = document.getElementById('dock-display-name');
  if (dockName) dockName.innerText = name;

  const dockHandle = document.getElementById('dock-username-badge');
  if (dockHandle) {
    dockHandle.innerText = un ? (un.startsWith('@') ? un : '@' + un) : '';
    dockHandle.style.display = un ? 'inline-block' : 'none';
  }

  const dockBio = document.getElementById('dock-bio-wrap');
  if (dockBio) {
    dockBio.innerText = bio || 'Описание деятельности и стек технологий...';
    dockBio.style.fontStyle = bio ? 'normal' : 'italic';
    dockBio.style.color = bio ? '#52525b' : '#a1a1aa';
  }

  const dockAvatarPlaceholder = document.querySelector('#dock-avatar-wrap .dock-avatar-placeholder');
  if (dockAvatarPlaceholder) dockAvatarPlaceholder.innerText = name.charAt(0).toUpperCase();
}

async function handleProfileSave(event) {
  if (event) event.preventDefault();

  const fn = (document.getElementById('inp-first-name')?.value || '').trim();
  const ln = (document.getElementById('inp-last-name')?.value || '').trim();
  let un = (document.getElementById('inp-tg-username')?.value || '').trim();
  if (un.startsWith('@')) un = un.slice(1);

  const bio = (document.getElementById('inp-bio')?.value || '').trim();
  const channel = (document.getElementById('inp-channel')?.value || '').trim();
  const website = (document.getElementById('inp-website')?.value || '').trim();
  const isPublic = document.getElementById('inp-is-private')?.checked ?? true;

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : safeJsonParse(localStorage.getItem('asage_user'), {});
  const updates = {
    first_name: fn,
    last_name: ln,
    username: un || currentUser?.username || '',
    photo_url: currentUser?.photo_url || '',
    bio: bio,
    channel_url: channel,
    website_url: website,
    is_private: !isPublic
  };

  const btn = document.getElementById('btn-save-profile');
  const originalText = btn ? btn.innerText : '';
  if (btn) {
    btn.innerText = 'Сохраняем...';
    btn.disabled = true;
  }

  try {
    if (typeof Auth !== 'undefined' && (Auth.updateUserProfile || Auth.updateProfile)) {
      const saveFn = Auth.updateUserProfile || Auth.updateProfile;
      await saveFn.call(Auth, updates);
    } else {
      const user = safeJsonParse(localStorage.getItem('asage_user'), {});
      Object.assign(user, updates);
      localStorage.setItem('asage_user', JSON.stringify(user));
    }

    updateCabinetProfile();
    livePreviewProfile();
    networkingMembersCache = [];

    if (btn) {
      btn.innerText = '✓ Сохранено!';
      btn.style.background = '#10b981';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#ffffff';
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    }
  } catch (err) {
    console.error('Save profile error:', err);
    if (btn) {
      btn.innerText = 'Ошибка сохранения';
      btn.disabled = false;
    }
  }
}

// ── 7. MEMBERS DIRECTORY & RECIPROCAL PRIVACY ────────────────────────────────
async function loadMembersDirectory() {
  const container = document.getElementById('members-grid-container');
  const searchWrapper = document.getElementById('members-search-wrapper');
  const privacyFooter = document.getElementById('members-privacy-footer');
  if (!container) return;

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const hasAccess = typeof Auth !== 'undefined' && Auth.hasClubAccess ? Auth.hasClubAccess() : false;

  // Case 1: Not logged in
  if (!user) {
    if (searchWrapper) searchWrapper.style.display = 'none';
    if (privacyFooter) privacyFooter.style.display = 'none';
    container.innerHTML = `
      <div style="grid-column:1/-1; background:#ffffff; border:2px solid #09090b; padding:48px 24px; text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:12px;">👥</div>
        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:10px;">Каталог Резидентов Клуба</h3>
        <p style="color:#52525b; font-size:0.92rem; line-height:1.55; max-width:500px; margin:0 auto 20px auto;">
          База контактов и закрытый нетворкинг доступны резидентам сообщества SAGE Neuro Family. Войдите через Telegram, чтобы открыть каталог.
        </p>
        <button onclick="if(typeof Auth!=='undefined') Auth.openLoginModal()" class="btn-primary" style="padding:12px 24px; font-size:0.86rem; cursor:pointer;">
          Войти через Telegram ↗
        </button>
      </div>
    `;
    const countBadge = document.getElementById('members-count-badge');
    if (countBadge) countBadge.innerText = '0';
    return;
  }

  // Case 2: Logged in, but NOT a club resident
  if (!hasAccess) {
    if (searchWrapper) searchWrapper.style.display = 'none';
    if (privacyFooter) privacyFooter.style.display = 'none';
    container.innerHTML = `
      <div style="grid-column:1/-1; background:#ffffff; border:2px solid #09090b; padding:48px 24px; text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:12px;">💎</div>
        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:10px;">Доступно только Резидентам Клуба</h3>
        <p style="color:#52525b; font-size:0.92rem; line-height:1.55; max-width:520px; margin:0 auto 20px auto;">
          Каталог участников и закрытый нетворкинг открыты только резидентам SAGE Neuro Family. Оформите подписку на закрытый клуб, чтобы войти в сообщество.
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-primary" style="padding:12px 24px; font-size:0.86rem; text-decoration:none; display:inline-flex; align-items:center;">
            Вступить в Клуб (1 900 ₽) ↗
          </a>
          <button onclick="switchCabinetTab('club')" class="btn-secondary" style="padding:12px 24px; font-size:0.86rem; cursor:pointer;">
            Подробнее о Клубе ℹ
          </button>
        </div>
      </div>
    `;
    const countBadge = document.getElementById('members-count-badge');
    if (countBadge) countBadge.innerText = '0';
    return;
  }

  // Case 3: Logged in resident, but VISIBILITY IS TURNED OFF (Reciprocity: cannot see others if private)
  if (user.is_private === true) {
    if (searchWrapper) searchWrapper.style.display = 'none';
    if (privacyFooter) privacyFooter.style.display = 'none';
    container.innerHTML = `
      <div style="grid-column:1/-1; background:#ffffff; border:2px solid #09090b; padding:48px 24px; text-align:center;">
        <div style="font-size:2.4rem; margin-bottom:12px;">🔒</div>
        <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:10px;">Видимость вашего профиля отключена</h3>
        <p style="color:#52525b; font-size:0.92rem; line-height:1.55; max-width:540px; margin:0 auto 24px auto;">
          В сообществе действует строгое правило взаимности: если вы скрываете свой профиль из каталога, вы также не видите других резидентов. Чтобы открыть каталог и обмениваться контактами, включите видимость профиля.
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button onclick="enableProfileVisibility()" class="btn-primary" style="padding:12px 24px; font-size:0.86rem; font-family:var(--mono); cursor:pointer;">
            Включить видимость и открыть каталог 👁
          </button>
          <button onclick="switchCabinetTab('profile')" class="btn-secondary" style="padding:12px 24px; font-size:0.86rem; font-family:var(--mono); cursor:pointer;">
            Настройки профиля ⚙
          </button>
        </div>
      </div>
    `;
    const countBadge = document.getElementById('members-count-badge');
    if (countBadge) countBadge.innerText = '0';
    return;
  }

  // Case 4: Visibility IS active (is_private !== true)
  if (searchWrapper) searchWrapper.style.display = 'flex';
  if (privacyFooter) privacyFooter.style.display = 'flex';

  if (networkingMembersCache.length > 0) {
    renderMembersDirectory(networkingMembersCache);
    return;
  }

  container.innerHTML = `
    <div style="grid-column:1/-1; padding:48px 24px; text-align:center; color:var(--gray); font-family:var(--mono); font-size:0.85rem;">
      Загрузка каталога резидентов...
    </div>
  `;

  let members = [];
  try {
    if (typeof Auth !== 'undefined' && Auth.fetchMembersDirectory) {
      members = await Auth.fetchMembersDirectory();
    }
  } catch (e) {}

  if (!members || members.length === 0) {
    members = [
      {
        id: 'founder-sage',
        first_name: 'Михаил',
        last_name: 'Пузырёв',
        username: 'Michael_Sage',
        role: 'club_member',
        bio: 'AI-архитектор, основатель сообщества SAGE Neuro Family. Проектирование мультиагентных сред, Antigravity SDK и автоматизация бизнеса.',
        channel_url: 'https://t.me/uncrn_sage',
        website_url: 'https://a-sage.ru',
        photo_url: '/img/mikhail_hero.jpg',
        is_private: false
      }
    ];
  }

  networkingMembersCache = members;
  const countBadge = document.getElementById('members-count-badge');
  if (countBadge) countBadge.innerText = members.length;

  renderMembersDirectory(members);
}

async function enableProfileVisibility() {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  if (!user) return;

  if (typeof Auth !== 'undefined' && Auth.updateUserProfile) {
    await Auth.updateUserProfile({ is_private: false });
  } else {
    user.is_private = false;
    localStorage.setItem('asage_user', JSON.stringify(user));
  }

  const privCheckbox = document.getElementById('inp-is-private');
  if (privCheckbox) privCheckbox.checked = true;

  networkingMembersCache = [];
  loadMembersDirectory();
}
window.enableProfileVisibility = enableProfileVisibility;

function renderMembersDirectory(members) {
  const container = document.getElementById('members-grid-container');
  if (!container) return;

  const q = (document.getElementById('members-search-input')?.value || '').toLowerCase().trim();
  
  const filtered = (members || []).filter(m => {
    if (!q) return true;
    const name = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    const handle = (m.username || '').toLowerCase();
    const bio = (m.bio || '').toLowerCase();
    return name.includes(q) || handle.includes(q) || bio.includes(q);
  });

  const countBadge = document.getElementById('members-count-badge');
  if (countBadge) countBadge.innerText = (members || []).length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; background:#ffffff; border:1px solid var(--border); padding:48px 24px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:12px;">👥</div>
        <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">Резиденты не найдены</h3>
        <p style="color:var(--gray); font-size:0.9rem; max-width:400px; margin:0 auto 16px auto;">
          Попробуйте изменить поисковый запрос.
        </p>
        <button onclick="document.getElementById('members-search-input').value=''; renderMembersDirectory(networkingMembersCache);" class="btn-secondary" style="padding:8px 16px; font-size:0.8rem; cursor:pointer;">
          Сбросить поиск
        </button>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(m => {
    const name = `${m.first_name || ''} ${m.last_name || ''}`.trim() || (m.username ? '@' + m.username : 'Резидент Клуба');
    const isMikhail = (m.username && m.username.toLowerCase() === 'michael_sage') || m.telegram_id == 439634804 || m.telegram_id == 88472911;
    const roleBadge = isMikhail
      ? '<span class="badge-role club" style="font-size:0.68rem; padding:2px 6px; background:#09090b; color:#ffffff;">👑 Основатель</span>'
      : '<span class="badge-role club" style="font-size:0.68rem; padding:2px 6px;">💎 Резидент</span>';

    const avatar = m.photo_url
      ? `<img src="${m.photo_url}" alt="${name}" class="member-avatar">`
      : `<div class="member-avatar-placeholder">${name.charAt(0).toUpperCase()}</div>`;

    let linksHtml = '';
    if (m.username) {
      linksHtml += `<a href="https://t.me/${m.username}" target="_blank" class="cabinet-chip cabinet-chip-email" style="font-size:0.75rem;">💬 @${m.username} ↗</a>`;
    }
    if (m.channel_url) {
      const chHref = m.channel_url.startsWith('http') ? m.channel_url : `https://t.me/${m.channel_url.replace(/^@/, '')}`;
      linksHtml += `<a href="${chHref}" target="_blank" class="cabinet-chip cabinet-chip-channel" style="font-size:0.75rem;">📢 Канал ↗</a>`;
    }
    if (m.website_url) {
      const webHref = m.website_url.startsWith('http') ? m.website_url : `https://${m.website_url}`;
      linksHtml += `<a href="${webHref}" target="_blank" class="cabinet-chip cabinet-chip-website" style="font-size:0.75rem;">🌐 Сайт ↗</a>`;
    }

    html += `
      <div class="member-card" style="background:#ffffff; border:1px solid var(--border); padding:24px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="member-header" style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
            ${avatar}
            <div>
              <h3 class="member-name" style="font-size:1.15rem; font-weight:800; margin:0 0 4px 0;">${name}</h3>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                ${roleBadge}
                ${m.username ? `<span style="font-family:var(--mono); font-size:0.75rem; color:var(--gray);">@${m.username}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="member-bio" style="font-size:0.88rem; color:#52525b; line-height:1.5; margin-bottom:16px;">${m.bio || 'Резидент клуба SAGE Neuro Family'}</div>
        </div>
        <div class="member-actions" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; border-top:1px solid #f4f4f5; padding-top:14px; margin-top:auto;">
          ${linksHtml || '<span style="font-family:var(--mono); font-size:0.72rem; color:#a1a1aa;">Контакты не указаны</span>'}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterMembersList() {
  renderMembersDirectory(networkingMembersCache);
}

function setMemberRoleFilter(role, btn = null) {
  renderMembersDirectory(networkingMembersCache);
}

// ── 8. FAVORITES SYSTEM ──────────────────────────────────────────────────────
function renderFavorites() {
  const container = document.getElementById('favorites-list-container');
  if (!container) return;

  const favs = typeof Auth !== 'undefined' && Auth.getFavorites ? Auth.getFavorites() : [];
  const badge = document.getElementById('fav-counter-badge');
  if (badge) badge.innerText = favs.length;

  if (favs.length === 0) {
    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border); padding:48px 24px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:12px;">⭐</div>
        <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:8px;">У вас пока нет закладок</h3>
        <p style="color:var(--gray); font-size:0.95rem; max-width:480px; margin:0 auto 20px auto;">
          Нажимайте на звездочку рядом с видео-уроками, промптами или терминами глоссария, чтобы сохранять их для быстрого доступа.
        </p>
        <button onclick="switchCabinetTab('education')" class="btn-primary" style="padding:10px 20px; font-size:0.84rem;">
          Перейти к видео-урокам ↗
        </button>
      </div>
    `;
    return;
  }

  let html = '<div class="cabinet-grid">';
  favs.forEach(f => {
    const title = f.title || 'Материал';
    const type = f.type || 'item';
    const id = f.id || '';
    const meta = f.meta || {};

    let typeTag = 'МАТЕРИАЛ';
    if (type === 'lesson') typeTag = '🎬 ВИДЕО-УРОК';
    if (type === 'prompt') typeTag = '📝 ПРОМПТ';
    if (type === 'term') typeTag = '📖 ГЛОССАРИЙ';

    let actionBtn = '';
    if (type === 'lesson') {
      actionBtn = `<button onclick="openClubVideo('${id}')" class="btn-primary" style="padding:8px 14px; font-size:0.8rem;">Смотреть запись ↗</button>`;
    } else {
      actionBtn = `<a href="/base" class="btn-secondary" style="padding:8px 14px; font-size:0.8rem;">Открыть ↗</a>`;
    }

    html += `
      <div class="cabinet-card">
        <div>
          <div class="cabinet-card-tag">${typeTag}</div>
          <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">${title}</h3>
          <p style="color:var(--gray); font-size:0.88rem; line-height:1.5;">${meta.desc || ''}</p>
        </div>
        <div class="cabinet-card-actions" style="display:flex; justify-content:space-between; align-items:center;">
          ${actionBtn}
          <button onclick="removeFavorite('${type}', '${id}')" style="background:none; border:none; color:#ef4444; font-family:var(--mono); font-size:0.75rem; cursor:pointer;">Удалить ✕</button>
        </div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

function removeFavorite(type, id) {
  if (typeof Auth !== 'undefined' && Auth.toggleFavorite) {
    Auth.toggleFavorite(type, id, '', {});
  }
  renderFavorites();
  const badge = document.getElementById('fav-counter-badge');
  if (badge && Auth.getFavorites) badge.innerText = Auth.getFavorites().length;
}

// ── 9. INITIALIZATION & LIFECYCLE ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  updateCabinetProfile();
  renderClubLessons();

  // Determine initial active tab: URL query param -> URL hash -> default 'knowledge'
  const urlParams = new URLSearchParams(window.location.search);
  const urlTab = urlParams.get('tab');
  const hashTab = window.location.hash ? window.location.hash.replace('#tab-', '').replace('#', '') : null;

  let activeTab = 'knowledge';
  const validTabs = ['knowledge', 'education', 'solutions', 'club', 'members', 'favorites', 'profile', 'dashboard', 'library', 'store', 'community'];

  if (urlTab && validTabs.includes(urlTab.toLowerCase())) {
    activeTab = urlTab.toLowerCase();
  } else if (hashTab && validTabs.includes(hashTab.toLowerCase())) {
    activeTab = hashTab.toLowerCase();
  }

  switchCabinetTab(activeTab);

  if (typeof Auth !== 'undefined' && Auth.isLoggedIn && Auth.isLoggedIn()) {
    if (Auth.fetchFreshUserProfile) {
      await Auth.fetchFreshUserProfile();
    }
    // Perform silent background Telegram membership verification to auto-update resident status
    if (Auth.checkTelegramSubscriptions) {
      Auth.checkTelegramSubscriptions(false).then(() => {
        updateCabinetProfile();
        renderClubLessons();
      }).catch(() => {});
    }
    updateCabinetProfile();
    renderClubLessons();
  }
});

window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab') || 'knowledge';
  switchCabinetTab(tab);
});

window.addEventListener('asage_auth_changed', () => {
  updateCabinetProfile();
  renderClubLessons();
  loadMembersDirectory();
  renderFavorites();
});

window.addEventListener('asage_favorites_changed', () => {
  renderFavorites();
  const badge = document.getElementById('fav-counter-badge');
  if (badge && typeof Auth !== 'undefined' && Auth.getFavorites) {
    badge.innerText = Auth.getFavorites().length;
  }
});
