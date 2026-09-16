/**
 * SAGE Platform - Personal Cabinet Engine (v3.2)
 * Pure Swiss Stark Brutalism Architecture
 * Canonical Tabs: knowledge | education | solutions | club | members | favorites | profile
 */

// ── 1. GLOBAL STATE &&nbsp;UTILITIES ──────────────────────────────────────────────
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
    id: 'lesson-codex-deepseek',
    title: 'DeepSeek + Codex OpenAI: Связка века для&nbsp;вайбкодинга. Разбор и&nbsp;практика',
    badge: 'МАСТЕР-КЛАСС // CODEX + DEEPSEEK',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/egi47oLSuVjrzjZAxZ1hAb/plFB4qSL',
    embedUrl: 'https://kinescope.io/embed/egi47oLSuVjrzjZAxZ1hAb',
    cover: '/assets/club-lessons/lesson_media_codex_deepseek.jpg',
    date: '14 сентября 2026',
    duration: '14 мин',
    description: 'Пошаговый разбор и&nbsp;живая практика: как&nbsp;подключить китайский мотор DeepSeek с&nbsp;окном 1M токенов к&nbsp;OpenAI Codex (CLI, Desktop, VS Code), настроить нативный Responses API, разделить сессии и&nbsp;кодить в&nbsp;50 раз дешевле.',
    topics: ['DeepSeek', 'OpenAI Codex', 'Вайбкодинг', 'API-интеграция', 'CLI']
  },
  {
    id: 'lesson-969',
    title: 'SKILLS: Навыки в&nbsp;нейронных сетях. Настраиваем агентов',
    badge: 'МАСТЕР-КЛАСС // КЛУБ',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/ooYCG6pSQoMx28ikQiXbCp/pliG4cRv',
    embedUrl: 'https://kinescope.io/embed/ooYCG6pSQoMx28ikQiXbCp',
    cover: '/assets/club-lessons/lesson_media_969.jpg',
    date: '22 июня 2026',
    duration: '1ч 45мин',
    description: 'Архитектура кастомных навыков (skills) для&nbsp;LLM-агентов. Как&nbsp;проектировать системные промпты, связывать инструменты через MCP и&nbsp;исключать галлюцинации моделей в&nbsp;проде.',
    topics: ['AI-Агенты', 'Промпт-инжиниринг', 'MCP-серверы', 'Контекст']
  },
  {
    id: 'lesson-764',
    title: 'Как создавать сайты с&nbsp;помощью нейросетей. Обзор Stitch',
    badge: 'ВИДЕО-УРОК // STITCH',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/6caXdYNxSMZWduyUB6ChQM/pljpPBB6',
    embedUrl: 'https://kinescope.io/embed/6caXdYNxSMZWduyUB6ChQM',
    cover: '/assets/club-lessons/lesson_media_764.jpg',
    date: '29 апреля 2026',
    duration: '1ч 12мин',
    description: 'Пошаговый пайплайн генерации веб-интерфейсов и&nbsp;адаптивных дизайн-систем через Google Stitch MCP. Экспорт чистого Tailwind/HTML и&nbsp;быстрая посадка на&nbsp;хостинг.',
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
    description: 'Полноценный разбор генератора FLOW для&nbsp;создания реалистичных коммерческих фотосессий, лукбуков для&nbsp;брендов и&nbsp;сохранения внешности моделей.',
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
    description: 'Глубокое погружение в&nbsp;Google NotebookLM: работа с&nbsp;базой знаний из&nbsp;сотен документов, генерация глубоких аудио-подкастов и&nbsp;извлечение инсайтов из&nbsp;PDF.',
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
    description: 'Полный цикл производства аудио и&nbsp;видео-подкастов с&nbsp;помощью генеративных нейросетей: от&nbsp;сценария и&nbsp;структуры выпуска до&nbsp;клонирования голоса и&nbsp;сведения.',
    topics: ['Подкасты', 'Голосовые модели', 'Сценарии', 'ElevenLabs']
  },
  {
    id: 'lesson-332',
    title: 'Мастер-класс «Промпт-дизайн и&nbsp;создание ассистентов»',
    badge: 'МАСТЕР-КЛАСС // АССИСТЕНТЫ',
    type: 'video',
    platform: 'Kinescope',
    videoUrl: 'https://kinescope.io/0uEaDKVHDdqLmAj7krZ4Jd/plO41fqw',
    embedUrl: 'https://kinescope.io/0uEaDKVHDdqLmAj7krZ4Jd/plO41fqw',
    cover: '/assets/club-lessons/lesson_media_332.jpg',
    date: '1 марта 2026',
    duration: '1ч 40мин',
    description: 'Системный фреймворк создания надёжных промптов, ролевых моделей (GRACEF) и&nbsp;проектирования контекстных окон для&nbsp;цифровых ассистентов бизнеса.',
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

  // 3. Persist active tab &&nbsp;sync URL
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

// ── 4. RENDER CLUB LESSONS &&nbsp;VIDEO MODAL ──────────────────────────────────────
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
              <span style="font-size:0.88rem; color:#a1a1aa;">Эксклюзивные записи живых воркшопов и&nbsp;закрытые туториалы доступны участникам клуба по&nbsp;подписке (1 900 ₽ первый месяц, далее 1 500 ₽/мес).</span>
            </div>
          </div>
          <div>
            <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-primary" style="background:#ffffff; color:#09090b; border-color:#ffffff; padding:10px 20px; font-size:0.84rem; font-weight:700; font-family:var(--mono); text-decoration:none;">
              Вступить в&nbsp;Клуб (1 900 ₽) ↗
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
            <span>💳 Купить за&nbsp;349 ₽</span> ↗
          </button>
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-secondary" style="padding:9px 14px; font-size:0.82rem; width:100%; justify-content:center; text-align:center; text-decoration:none; background:#fafafa; color:#52525b; border:1px solid #d4d4d8; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
            <span>💎 Вступить в&nbsp;Клуб (все уроки)</span> ↗
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

  if (title) title.innerText = lesson.title;
  if (badge) badge.innerText = lesson.badge;

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

// ── 5. LIGHTING &&nbsp;CAMERA ANGLES GUIDE MODALS ─────────────────────────────────
function openLightingGuideModal() {
  if (typeof Auth !== 'undefined' && !Auth.isChannelSubscriber()) {
    Auth.openChannelGateModal({
      title: 'Шпаргалка по&nbsp;свету (20 схем)',
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
    { name: '🌌 Blue Hour', desc: 'Холодный синий свет, рассветная или&nbsp;сумеречная атмосфера', prompt: 'blue hour lighting, cool deep blue tones, subtle shadows, dawn atmosphere' },
    { name: '☁️ Overcast Light', desc: 'Мягкий рассеянный свет без&nbsp;резких теней, естественные цвета', prompt: 'overcast diffused lighting, soft even illumination, natural neutral colors' },
    { name: '✨ Diffused Light', desc: 'Равномерный мягкий свет, идеален для&nbsp;студийных портретов', prompt: 'diffused studio lighting, soft flattering light, gentle falloff' },
    { name: '🌇 Backlighting &&nbsp;Rim Light', desc: 'Источник света позади объекта, создаёт сияющий контур', prompt: 'strong backlighting, rim light, glowing silhouette edge, cinematic halo' },
    { name: '🌿 Soft Ambient Light', desc: 'Нежное рассеянное освещение интерьера, уют и&nbsp;глубина', prompt: 'soft ambient light, cozy room illumination, natural gentle shadows' },
    { name: '🖤 Low-Key Lighting', desc: 'Тёмный контрастный свет, глубокие тени и&nbsp;драматизм', prompt: 'dramatic low-key lighting, deep dark shadows, high contrast, moody chiaroscuro' },
    { name: '🤍 High-Key Lighting', desc: 'Яркое, светлое с&nbsp;минимумом теней — чистота и&nbsp;свежесть', prompt: 'high-key lighting, bright airy scene, minimal soft shadows, pure clean look' },
    { name: '🏠 Window Light', desc: 'Естественный свет из&nbsp;окна, мягкие блики и&nbsp;текстура кожи', prompt: 'natural window light, soft directional sunlight, organic shadow gradient' },
    { name: '🌳 Dappled Light', desc: 'Солнечные блики и&nbsp;пятна сквозь листву — динамика и&nbsp;игра света', prompt: 'dappled sunlight filtering through foliage, organic light patterns, textured shadows' },
    { name: '💡 Spotlight', desc: 'Фокус жесткого света на&nbsp;одном объекте, максимальная драма', prompt: 'intense direct spotlight, sharp dramatic focal beam, heavy contrast falloff' },
    { name: '🌆 Twilight Light', desc: 'Мягкий свет вечерних сумерек, кинематографичность', prompt: 'twilight evening light, dusky cinematic ambient, rich deep sky tones' },
    { name: '🕯 Candlelight', desc: 'Тёплый мерцающий свет свечей, интимность и&nbsp;золотой оттенок', prompt: 'warm flickering candlelight, intimate golden glow, soft penumbra shadows' },
    { name: '🎇 Neon Light', desc: 'Яркие неоновые огни, футуристичный киберпанк / ночной город', prompt: 'vibrant neon lighting, dual color cyan and magenta reflections, cyberpunk city night' },
    { name: '🌕 Moonlight', desc: 'Холодный серебристый ночной свет, магия луны', prompt: 'ethereal cool moonlight, silvery highlights, deep midnight shadows' },
    { name: '🚦 Street Light', desc: 'Желтоватое свечение уличных фонарей, городской вайб', prompt: 'warm sodium street lamp lighting, nighttime urban atmosphere, wet asphalt reflections' },
    { name: '🔁 Bounced Light', desc: 'Отражённый свет от&nbsp;поверхностей, естественный fill-свет', prompt: 'bounced indirect illumination, soft ambient bounce, natural fill light' },
    { name: '🌞 Lens Flare', desc: 'Анаморфотные солнечные блики в&nbsp;объективе, реализм', prompt: 'cinematic anamorphic lens flare, bright sun streak, photographic optical realism' },
    { name: '🎥 Studio 3-Point Light', desc: 'Трехточечный студийный свет (Key, Fill, Backlight)', prompt: 'professional 3-point studio lighting, balanced key and fill light, crisp rim highlight' },
    { name: '🔲 Pattern Light (Gobo)', desc: 'Свет с&nbsp;узорами через жалюзи или&nbsp;решётку, графичность', prompt: 'gobo patterned light, window blind shadows projected onto subject, graphic depth' }
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
        <h3 style="margin:0; font-size:1.2rem; font-weight:800;">💡 Шпаргалка по&nbsp;свету (20 схем освещения)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-lighting-modal')" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>
      <div class="guide-modal-body" style="padding:20px;">
        <div style="font-family:var(--mono); font-size:0.75rem; font-weight:700; color:var(--gray); margin-bottom:12px;">// 20 КИНЕМАТОГРАФИЧЕСКИХ СХЕМ СВЕТА ДЛЯ&nbsp;NANO BANANA ОТ&nbsp;GOOGLE</div>
        ${rowsHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openAnglesGuideModal() {
  if (typeof Auth !== 'undefined' && !Auth.isChannelSubscriber()) {
    Auth.openChannelGateModal({
      title: 'Гид по&nbsp;ракурсам съемки (20 схем)',
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
    { name: '📸 Анфас (Full Face)', desc: 'Прямой контакт глаза в&nbsp;глаза, открытость и&nbsp;симметрия', prompt: 'front view, centered headshot, direct gaze at camera, symmetrical composition' },
    { name: '📐 3/4 ракурс (Three-quarter)', desc: 'Классический портретный поворот головы на&nbsp;45 градусов', prompt: 'three-quarter view, 45 degree angle portrait, natural dimension and cheekbone definition' },
    { name: '👤 Профиль (Profile)', desc: 'Строго боком, акцент на&nbsp;силуэте и&nbsp;контурах лица', prompt: 'side view, profile shot, silhouette focus, clean jawline contour' },
    { name: '💫 Полуанфас (Semi-profile)', desc: 'Между 3/4 и&nbsp;профилем, акцент на&nbsp;скулах', prompt: 'semi-profile, subtle head turn, highlighting cheekbones and soft jawline' },
    { name: '🚶 Со&nbsp;спины (Back View)', desc: 'Загадочность и&nbsp;эффект созерцания сцены', prompt: 'view from behind, back to camera, looking at horizon, mysterious mood' },
    { name: '👁️ Уровень глаз (Eye Level)', desc: 'Нейтральная и&nbsp;реалистичная естественная перспектива', prompt: 'eye-level shot, natural perspective, direct human connection' },
    { name: '⬆️ Нижний ракурс (Low Angle)', desc: 'Властный, монументальный ракурс снизу вверх', prompt: 'low angle shot, looking up at person, heroic perspective, imposing authority' },
    { name: '⬇️ Верхний ракурс (High Angle)', desc: 'Взгляд сверху вниз, хрупкость или&nbsp;уязвимость', prompt: 'high angle shot, looking down at subject, emotional perspective' },
    { name: '🦅 Птичий полет (Bird\'s Eye)', desc: 'Вид строго сверху (Top-down) с&nbsp;высоты', prompt: 'bird\'s eye view, top-down perspective, high altitude cinematic shot' },
    { name: '🐜 Лягушачий ракурс (Worm\'s Eye)', desc: 'Экстремальный ракурс от&nbsp;самой поверхности земли', prompt: 'worm\'s eye view, ground level photography, extreme perspective looking straight up' },
    { name: '📐 Голландский угол (Dutch Angle)', desc: 'Заваленный горизонт, кинематографичное напряжение', prompt: 'dutch angle shot, tilted horizon, cinematic tension, dynamic framing' },
    { name: '👀 Субъективный ракурс (POV)', desc: 'Вид от&nbsp;первого лица глазами главного героя', prompt: 'first person point of view, POV shot, immersive perspective, subjective camera' },
    { name: '👥 Овершолдер (Over-the-shoulder)', desc: 'Взгляд через плечо собеседника в&nbsp;диалоге', prompt: 'over-the-shoulder shot, conversation framing, blurred foreground shoulder' },
    { name: '🔍 Макро (Macro Detail)', desc: 'Сверхкрупный план текстуры глаза, кожи или&nbsp;элемента', prompt: 'extreme close-up, macro shot of an eye, hyper-detailed texture, depth of field' }
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
        <h3 style="margin:0; font-size:1.2rem; font-weight:800;">📸 Шпаргалка по&nbsp;ракурсам съемки (20 схем)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-angles-modal')\" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
      </div>
      <div class="guide-modal-body" style="padding:20px;">
        <div style="font-family:var(--mono); font-size:0.75rem; font-weight:700; color:var(--gray); margin-bottom:12px;">// 20 РАКУРСОВ ДЛЯ&nbsp;ТОЧНОГО УПРАВЛЕНИЯ КАМЕРОЙ В&nbsp;НЕЙРОСЕТЯХ</div>
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

// ── 5.1 TELEGRAM UTM GENERATOR (≤ 64 BYTES BASE64) ───────────────────────────
function openUtmGeneratorModal() {
  if (typeof Auth !== 'undefined' && !Auth.isChannelSubscriber()) {
    Auth.openChannelGateModal({
      title: 'Генератор UTM-меток для&nbsp;Telegram',
      onVerified: () => openUtmGeneratorModal()
    });
    return;
  }

  const existing = document.getElementById('guide-utm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'guide-utm-modal';
  modal.className = 'guide-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeGuideModal('guide-utm-modal'); };

  modal.innerHTML = `
    <div class="guide-modal-content" style="background:#ffffff; max-width:880px; width:100%; max-height:88vh; overflow-y:auto; border:1px solid var(--border); box-shadow:0 10px 40px rgba(0,0,0,0.15); border-radius:0 !important;">
      <div class="guide-modal-header" style="padding:18px 24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
        <div>
          <h3 style="margin:0; font-size:1.2rem; font-weight:800; color:#09090b;">⚡ Генератор UTM-меток для&nbsp;Telegram (до&nbsp;64 байт)</h3>
          <div style="font-family:var(--mono); font-size:0.72rem; font-weight:700; color:var(--gray); margin-top:3px;">// BASE64 URL-SAFE, КОНТРОЛЬ ЛИМИТА 64 БАЙТА И&nbsp;ПРОБРОС МЕТОК</div>
        </div>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-utm-modal')" style="background:none; border:none; font-size:1.3rem; cursor:pointer; padding:4px 8px; line-height:1;">✕</button>
      </div>

      <div class="guide-modal-body" style="padding:22px 24px;">
        <div style="padding:12px 14px; background:#f4f4f5; border-left:3px solid #09090b; font-size:0.84rem; line-height:1.55; margin-bottom:20px; color:#27272a;">
          Telegram-боты принимают параметр <code>?start=...</code> <strong>строго до&nbsp;64 байт</strong>. Длинные ссылки обрезаются или&nbsp;игнорируются. Генератор сокращает ключи (<code>s, m, c, o, t, r</code>) и&nbsp;кодирует их в&nbsp;компактный URL-safe Base64.
        </div>

        <!-- Section: URLs -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:18px;">
          <div>
            <label style="font-size:0.78rem; font-weight:700; color:#3f3f46; margin-bottom:5px; display:block; font-family:var(--mono);">1. АДРЕС ВАШЕЙ СТРАНИЦЫ</label>
            <div style="display:flex; align-items:stretch;">
              <span style="background:#f4f4f5; border:1px solid var(--border); border-right:none; padding:8px 10px; font-family:var(--mono); font-size:0.8rem; color:#71717a; display:flex; align-items:center;">https://</span>
              <input type="text" id="utm-site-url" placeholder="a-sage.ru/offer" oninput="recalcUtmGenerator()" style="flex:1; border:1px solid var(--border); padding:8px 12px; font-family:var(--mono); font-size:0.82rem; border-radius:0; outline:none; background:#fff;">
            </div>
          </div>

          <div>
            <label style="font-size:0.78rem; font-weight:700; color:#3f3f46; margin-bottom:5px; display:block; font-family:var(--mono);">2. НИК БОТА / КАНАЛА В&nbsp;TELEGRAM</label>
            <div style="display:flex; align-items:stretch;">
              <span style="background:#f4f4f5; border:1px solid var(--border); border-right:none; padding:8px 10px; font-family:var(--mono); font-size:0.8rem; color:#71717a; display:flex; align-items:center;">https://t.me/</span>
              <input type="text" id="utm-tg-nick" placeholder="Michael_Sage_bot" oninput="recalcUtmGenerator()" style="flex:1; border:1px solid var(--border); padding:8px 12px; font-family:var(--mono); font-size:0.82rem; border-radius:0; outline:none; background:#fff;">
            </div>
          </div>
        </div>

        <!-- Presets -->
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:8px 12px; background:#fafafa; border:1px solid #f4f4f5;">
          <span style="font-family:var(--mono); font-size:0.72rem; font-weight:700; color:#71717a;">ПРЕСЕТЫ:</span>
          <button type="button" onclick="applyUtmPreset('yandex', 'cpc')" class="btn-secondary" style="padding:3px 8px; font-size:0.72rem; font-family:var(--mono); border-radius:0; cursor:pointer;">Яндекс Директ</button>
          <button type="button" onclick="applyUtmPreset('vk', 'targeted')" class="btn-secondary" style="padding:3px 8px; font-size:0.72rem; font-family:var(--mono); border-radius:0; cursor:pointer;">ВКонтакте</button>
          <button type="button" onclick="applyUtmPreset('tg_ads', 'cpc')" class="btn-secondary" style="padding:3px 8px; font-size:0.72rem; font-family:var(--mono); border-radius:0; cursor:pointer;">Telegram Ads</button>
          <button type="button" onclick="applyUtmPreset('telegram', 'channel')" class="btn-secondary" style="padding:3px 8px; font-size:0.72rem; font-family:var(--mono); border-radius:0; cursor:pointer;">TG Канал</button>
          <button type="button" onclick="applyUtmPreset('newsletter', 'email')" class="btn-secondary" style="padding:3px 8px; font-size:0.72rem; font-family:var(--mono); border-radius:0; cursor:pointer;">Рассылка</button>
        </div>

        <!-- Section: 6 UTM Fields -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #f4f4f5;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">ИСТОЧНИК КАМПАНИИ · utm_source (s)</label>
            <input type="text" id="utm-src" placeholder="yandex" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">ТИП ТРАФИКА · utm_medium (m)</label>
            <input type="text" id="utm-med" placeholder="cpc" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">НАЗВАНИЕ КАМПАНИИ · utm_campaign (c)</label>
            <input type="text" id="utm-cmp" placeholder="agent_launch" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">СОДЕРЖАНИЕ ОБЪЯВЛЕНИЯ · utm_content (o)</label>
            <input type="text" id="utm-cnt" placeholder="banner_01" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">КЛЮЧЕВОЕ СЛОВО · utm_term (t)</label>
            <input type="text" id="utm-trm" placeholder="vibe_coding" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#3f3f46; margin-bottom:4px; display:block; font-family:var(--mono);">РЕФЕРАЛЬНЫЙ КОД · referralCode (r)</label>
            <input type="text" id="utm-ref" placeholder="sage777" oninput="recalcUtmGenerator()" style="width:100%; border:1px solid var(--border); padding:8px 10px; font-family:var(--mono); font-size:0.82rem; border-radius:0; box-sizing:border-box; outline:none; background:#fff;">
          </div>
        </div>

        <!-- Generated Outputs -->
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- 1. Full Website URL -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:0.76rem; font-weight:700; color:#3f3f46; font-family:var(--mono);">ССЫЛКА ДЛЯ&nbsp;САЙТА (СТАНДАРТНАЯ)</label>
            </div>
            <div style="display:flex;">
              <input type="text" id="utm-out-site-full" readonly placeholder="https://..." style="flex:1; border:1px solid var(--border); border-right:none; padding:8px 12px; font-family:var(--mono); font-size:0.8rem; background:#fafafa; border-radius:0; outline:none;">
              <button type="button" class="btn-secondary" onclick="copyUtmValue('utm-out-site-full', this)" style="padding:8px 16px; font-size:0.76rem; font-family:var(--mono); border-radius:0; cursor:pointer; flex-shrink:0;">Копировать</button>
            </div>
          </div>

          <!-- 2. Base64 Website URL -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:0.76rem; font-weight:700; color:#3f3f46; font-family:var(--mono);">ССЫЛКА ДЛЯ&nbsp;САЙТА (BASE64 URL-SAFE)</label>
              <span id="utm-count-site-b64" style="font-family:var(--mono); font-size:0.72rem; color:#71717a;"></span>
            </div>
            <div style="display:flex;">
              <input type="text" id="utm-out-site-b64" readonly placeholder="https://.../?data=..." style="flex:1; border:1px solid var(--border); border-right:none; padding:8px 12px; font-family:var(--mono); font-size:0.8rem; background:#fafafa; border-radius:0; outline:none;">
              <button type="button" class="btn-secondary" onclick="copyUtmValue('utm-out-site-b64', this)" style="padding:8px 16px; font-size:0.76rem; font-family:var(--mono); border-radius:0; cursor:pointer; flex-shrink:0;">Копировать</button>
            </div>
          </div>

          <!-- 3. Standard Telegram URL -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:0.76rem; font-weight:700; color:#3f3f46; font-family:var(--mono);">СТАНДАРТНАЯ ССЫЛКА ДЛЯ&nbsp;TELEGRAM (МОЖНО РЕДАКТИРОВАТЬ)</label>
            </div>
            <div style="display:flex;">
              <input type="text" id="utm-out-tg-std" oninput="encodeManualUtmUrl()" placeholder="https://t.me/bot?start&..." style="flex:1; border:1px solid var(--border); border-right:none; padding:8px 12px; font-family:var(--mono); font-size:0.8rem; background:#fafafa; border-radius:0; outline:none;">
              <button type="button" class="btn-secondary" onclick="copyUtmValue('utm-out-tg-std', this)" style="padding:8px 16px; font-size:0.76rem; font-family:var(--mono); border-radius:0; cursor:pointer; flex-shrink:0;">Копировать</button>
            </div>
          </div>

          <!-- 4. Base64 Telegram URL -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:0.76rem; font-weight:700; color:#3f3f46; font-family:var(--mono);">ССЫЛКА ДЛЯ&nbsp;TELEGRAM (BASE64 URL-SAFE, ДО&nbsp;64 БАЙТ)</label>
              <span id="utm-count-tg-b64" style="font-family:var(--mono); font-size:0.75rem; font-weight:700; color:#71717a;"></span>
            </div>
            <div style="display:flex;">
              <input type="text" id="utm-out-tg-b64" readonly placeholder="https://t.me/bot?start=..." style="flex:1; border:1px solid var(--border); border-right:none; padding:8px 12px; font-family:var(--mono); font-size:0.8rem; background:#fafafa; border-radius:0; outline:none; font-weight:600;">
              <button type="button" class="btn-secondary" onclick="copyUtmValue('utm-out-tg-b64', this)" style="padding:8px 16px; font-size:0.76rem; font-family:var(--mono); border-radius:0; cursor:pointer; flex-shrink:0; background:#09090b; color:#fff; border-color:#09090b;">Копировать</button>
            </div>
            <div id="utm-alert-overflow" style="display:none; margin-top:8px; padding:10px 14px; background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; font-size:0.78rem; font-family:var(--mono); line-height:1.4;"></div>
          </div>
        </div>

        <!-- Forwarder Script Details -->
        <details style="margin-top:24px; border:1px solid var(--border); padding:12px 16px; background:#fafafa;">
          <summary style="font-weight:700; cursor:pointer; font-size:0.86rem; display:flex; justify-content:space-between; align-items:center; user-select:none;">
            <span>📋 Скрипт проброса UTM-меток на&nbsp;сайте (Tilda / Web)</span>
            <span style="font-family:var(--mono); font-size:0.75rem; color:#10b981;">Развернуть ▾</span>
          </summary>
          <div style="margin-top:12px; font-size:0.82rem; color:#52525b; line-height:1.55;">
            <p style="margin:0 0 10px 0;">
              Вставьте этот код в&nbsp;<code>&lt;head&gt;</code> вашего сайта или&nbsp;блок T123 (HTML) на&nbsp;Тильде. Когда посетитель переходит по&nbsp;рекламе с&nbsp;UTM-метками, скрипт автоматически добавляет их ко&nbsp;всем кнопкам и&nbsp;ссылкам на&nbsp;странице (включая ссылки на&nbsp;Telegram-ботов).
            </p>
            <div style="position:relative;">
              <pre style="background:#09090b; color:#34d399; font-family:var(--mono); font-size:0.75rem; padding:14px; overflow-x:auto; margin:0; line-height:1.45; border:1px solid var(--border);"><code id="utm-forwarder-code">&lt;!-- Скрипт сквозного проброса UTM-меток (AiSAGE) --&gt;
&lt;script&gt;
document.addEventListener('DOMContentLoaded', function() {
    var queryString = window.location.search;
    if (queryString) {
        var allLinks = document.querySelectorAll('a');
        allLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                link.href = href.indexOf('?') !== -1 ? href + '&' + queryString.substring(1) : href + queryString;
            }
        });
    }
});
&lt;/script&gt;</code></pre>
              <button type="button" class="btn-secondary" onclick="copyUtmSnippet('utm-forwarder-code', this)" style="position:absolute; top:8px; right:8px; padding:4px 10px; font-size:0.72rem; font-family:var(--mono); background:#27272a; border-color:#3f3f46; color:#fff; cursor:pointer;">Копировать код</button>
            </div>
          </div>
        </details>

        <!-- Footer actions -->
        <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <button type="button" onclick="resetUtmGenerator()" class="btn-secondary" style="padding:6px 14px; font-size:0.75rem; font-family:var(--mono); cursor:pointer;">Очистить поля</button>
          <a href="/tools/utm/" target="_blank" style="font-family:var(--mono); font-size:0.8rem; color:#09090b; font-weight:700; text-decoration:underline;">🔗 Открыть отдельной страницей (/tools/utm/) ↗</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function applyUtmPreset(src, med) {
  const s = document.getElementById('utm-src');
  const m = document.getElementById('utm-med');
  if (s) s.value = src;
  if (m) m.value = med;
  recalcUtmGenerator();
}

function recalcUtmGenerator() {
  const siteInput = (document.getElementById('utm-site-url')?.value || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const tgInput = (document.getElementById('utm-tg-nick')?.value || '').trim().replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').replace(/\/$/, '');

  const src = (document.getElementById('utm-src')?.value || '').trim();
  const med = (document.getElementById('utm-med')?.value || '').trim();
  const cmp = (document.getElementById('utm-cmp')?.value || '').trim();
  const cnt = (document.getElementById('utm-cnt')?.value || '').trim();
  const trm = (document.getElementById('utm-trm')?.value || '').trim();
  const ref = (document.getElementById('utm-ref')?.value || '').trim();

  const shortParams = [];
  if (ref) shortParams.push(`r=${ref}`);
  if (src) shortParams.push(`s=${src}`);
  if (med) shortParams.push(`m=${med}`);
  if (cmp) shortParams.push(`c=${cmp}`);
  if (cnt) shortParams.push(`o=${cnt}`);
  if (trm) shortParams.push(`t=${trm}`);

  const longParams = [];
  if (ref) longParams.push(`referralCode=${ref}`);
  if (src) longParams.push(`utm_source=${src}`);
  if (med) longParams.push(`utm_medium=${med}`);
  if (cmp) longParams.push(`utm_campaign=${cmp}`);
  if (cnt) longParams.push(`utm_content=${cnt}`);
  if (trm) longParams.push(`utm_term=${trm}`);

  const shortQuery = shortParams.join('&');
  const longQuery = longParams.join('&');

  const siteFullEl = document.getElementById('utm-out-site-full');
  const siteB64El = document.getElementById('utm-out-site-b64');
  const siteB64Counter = document.getElementById('utm-count-site-b64');

  if (siteInput) {
    if (longQuery) {
      if (siteFullEl) siteFullEl.value = `https://${siteInput}?${longQuery}`;
      try {
        const b64 = btoa(unescape(encodeURIComponent(shortQuery))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        if (siteB64El) siteB64El.value = `https://${siteInput}?data=${b64}`;
        if (siteB64Counter) {
          siteB64Counter.textContent = `(${b64.length} симв.)`;
          siteB64Counter.style.color = '#71717a';
        }
      } catch (e) {
        if (siteB64El) siteB64El.value = '';
      }
    } else {
      if (siteFullEl) siteFullEl.value = `https://${siteInput}`;
      if (siteB64El) siteB64El.value = `https://${siteInput}`;
      if (siteB64Counter) siteB64Counter.textContent = '';
    }
  } else {
    if (siteFullEl) siteFullEl.value = '';
    if (siteB64El) siteB64El.value = '';
    if (siteB64Counter) siteB64Counter.textContent = '';
  }

  const tgStdEl = document.getElementById('utm-out-tg-std');
  const tgB64El = document.getElementById('utm-out-tg-b64');
  const tgCounter = document.getElementById('utm-count-tg-b64');
  const alertBox = document.getElementById('utm-alert-overflow');

  if (tgInput) {
    const stdUrl = `https://t.me/${tgInput}${longQuery ? '?start&' + longQuery : ''}`;
    if (tgStdEl) tgStdEl.value = stdUrl;

    if (shortQuery) {
      try {
        const b64 = btoa(unescape(encodeURIComponent(shortQuery))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const b64Url = `https://t.me/${tgInput}?start=${b64}`;
        if (tgB64El) tgB64El.value = b64Url;

        const byteLen = b64.length;
        if (tgCounter) {
          tgCounter.textContent = `(${byteLen} / 64 байт)`;
          if (byteLen > 64) {
            tgCounter.style.color = '#ef4444';
            tgCounter.style.fontWeight = '700';
            if (alertBox) {
              alertBox.style.display = 'block';
              alertBox.innerHTML = `⚠️ <strong>Лимит превышен: ${byteLen} байт из&nbsp;64!</strong> Telegram отсекает параметр start длиннее 64 байт. Бот не&nbsp;получит метки. Сократите названия меток.`;
            }
          } else {
            tgCounter.style.color = '#10b981';
            tgCounter.style.fontWeight = '600';
            if (alertBox) alertBox.style.display = 'none';
          }
        }
      } catch (e) {
        if (tgB64El) tgB64El.value = 'Ошибка кодирования';
      }
    } else {
      if (tgB64El) tgB64El.value = `https://t.me/${tgInput}?start=`;
      if (tgCounter) {
        tgCounter.textContent = '(0 / 64 байт)';
        tgCounter.style.color = '#71717a';
      }
      if (alertBox) alertBox.style.display = 'none';
    }
  } else {
    if (tgStdEl) tgStdEl.value = '';
    if (tgB64El) tgB64El.value = '';
    if (tgCounter) tgCounter.textContent = '';
    if (alertBox) alertBox.style.display = 'none';
  }
}

function encodeManualUtmUrl() {
  const stdInput = document.getElementById('utm-out-tg-std');
  if (!stdInput) return;
  const val = stdInput.value.trim();
  const match = val.match(/t\.me\/([^?]+)\?start(?:&|=)(.+)/);
  if (match && match[1] && match[2]) {
    const nick = match[1];
    const rawParams = match[2];
    const shortParams = rawParams
      .replace(/utm_source=/g, 's=')
      .replace(/utm_medium=/g, 'm=')
      .replace(/utm_campaign=/g, 'c=')
      .replace(/utm_content=/g, 'o=')
      .replace(/utm_term=/g, 't=')
      .replace(/referralCode=/g, 'r=');

    try {
      const b64 = btoa(unescape(encodeURIComponent(shortParams))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const tgB64El = document.getElementById('utm-out-tg-b64');
      if (tgB64El) tgB64El.value = `https://t.me/${nick}?start=${b64}`;
      const tgCounter = document.getElementById('utm-count-tg-b64');
      const alertBox = document.getElementById('utm-alert-overflow');
      const byteLen = b64.length;
      if (tgCounter) {
        tgCounter.textContent = `(${byteLen} / 64 байт)`;
        if (byteLen > 64) {
          tgCounter.style.color = '#ef4444';
          tgCounter.style.fontWeight = '700';
          if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = `⚠️ <strong>Лимит превышен: ${byteLen} байт из&nbsp;64!</strong> Сократите параметры.`;
          }
        } else {
          tgCounter.style.color = '#10b981';
          tgCounter.style.fontWeight = '600';
          if (alertBox) alertBox.style.display = 'none';
        }
      }
    } catch (e) {}
  }
}

function copyUtmValue(id, btn) {
  const input = document.getElementById(id);
  if (!input || !input.value) return;
  const text = input.value;
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
      prompt('Скопируйте ссылку:', text);
    });
  } else {
    prompt('Скопируйте ссылку:', text);
  }
}

function copyUtmSnippet(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText || el.textContent;
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
      prompt('Скопируйте код:', text);
    });
  } else {
    prompt('Скопируйте код:', text);
  }
}

function resetUtmGenerator() {
  ['utm-site-url', 'utm-tg-nick', 'utm-src', 'utm-med', 'utm-cmp', 'utm-cnt', 'utm-trm', 'utm-ref', 'utm-out-site-full', 'utm-out-site-b64', 'utm-out-tg-std', 'utm-out-tg-b64'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const c1 = document.getElementById('utm-count-site-b64');
  if (c1) c1.textContent = '';
  const c2 = document.getElementById('utm-count-tg-b64');
  if (c2) c2.textContent = '';
  const a = document.getElementById('utm-alert-overflow');
  if (a) a.style.display = 'none';
}

// ── 6. PROFILE DISPLAY &&nbsp;EDITING ─────────────────────────────────────────────
function updateCabinetProfile() {
  const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;
  const loggedInContainer = document.getElementById('profile-container-logged-in');
  const guestContainer = document.getElementById('profile-container-guest');

  if (user) {
    if (loggedInContainer) loggedInContainer.style.display = 'block';
    if (guestContainer) guestContainer.style.display = 'none';

    document.body.classList.add('user-logged-in');

    const fName = (user.first_name || '').trim();
    const lName = (user.last_name || '').trim();
    const displayName = (fName && lName && fName.includes(lName)) ? fName : (`${fName} ${lName}`.trim() || user.username || 'Пользователь');
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
        bioWrap.innerText = 'Нажмите «Настроить профиль», чтобы добавить информацию о&nbsp;деятельности и&nbsp;контакты.';
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

  const showTg = document.getElementById('inp-show-telegram');
  if (showTg) showTg.checked = Boolean(user.show_telegram_contact);
}

function livePreviewProfile() {
  const user = typeof Auth !== 'undefined' && Auth.getUser ? Auth.getUser() : null;

  const fnInput = document.getElementById('inp-first-name')?.value;
  const lnInput = document.getElementById('inp-last-name')?.value;
  const unInput = document.getElementById('inp-tg-username')?.value;
  const bioInput = document.getElementById('inp-bio')?.value;
  const isChecked = document.getElementById('inp-is-private')?.checked ?? (user ? !user.is_private : true);
  const showTgChecked = document.getElementById('inp-show-telegram')?.checked ?? Boolean(user?.show_telegram_contact);

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
  if (previewBio) previewBio.innerText = bio || 'Описание деятельности и&nbsp;стек технологий...';

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
    const privText = isChecked ? '🌐 В&nbsp;каталоге' : '🔒 Скрыт из&nbsp;каталога';
    const tgText = showTgChecked ? '💬 Telegram открыт' : '🛡️ Telegram скрыт';
    previewPrivacy.innerText = `${privText} • ${tgText}`;
    previewPrivacy.style.color = isChecked ? '#059669' : '#dc2626';
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
    dockBio.innerText = bio || 'Описание деятельности и&nbsp;стек технологий...';
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
  const showTgContact = document.getElementById('inp-show-telegram')?.checked ?? false;

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : safeJsonParse(localStorage.getItem('asage_user'), {});
  const updates = {
    first_name: fn,
    last_name: ln,
    username: un || currentUser?.username || '',
    photo_url: currentUser?.photo_url || '',
    bio: bio,
    channel_url: channel,
    website_url: website,
    is_private: !isPublic,
    show_telegram_contact: showTgContact
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

// ── 7. MEMBERS DIRECTORY &&nbsp;RECIPROCAL PRIVACY ────────────────────────────────
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
          База контактов и&nbsp;закрытый нетворкинг доступны резидентам сообщества SAGE Neuro Family. Войдите через Telegram, чтобы открыть каталог.
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
          Каталог участников и&nbsp;закрытый нетворкинг открыты только резидентам SAGE Neuro Family. Оформите подписку на&nbsp;закрытый клуб, чтобы войти в&nbsp;сообщество.
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-primary" style="padding:12px 24px; font-size:0.86rem; text-decoration:none; display:inline-flex; align-items:center;">
            Вступить в&nbsp;Клуб (1 900 ₽) ↗
          </a>
          <button onclick="switchCabinetTab('club')" class="btn-secondary" style="padding:12px 24px; font-size:0.86rem; cursor:pointer;">
            Подробнее о&nbsp;Клубе ℹ
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
          В&nbsp;сообществе действует строгое правило взаимности: если вы скрываете свой профиль из&nbsp;каталога, вы также не&nbsp;видите других резидентов. Чтобы открыть каталог и&nbsp;обмениваться контактами, включите видимость профиля.
        </p>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button onclick="enableProfileVisibility()" class="btn-primary" style="padding:12px 24px; font-size:0.86rem; font-family:var(--mono); cursor:pointer;">
            Включить видимость и&nbsp;открыть каталог 👁
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
        bio: 'AI-архитектор, основатель сообщества SAGE Neuro Family. Проектирование мультиагентных сред, Antigravity SDK и&nbsp;автоматизация бизнеса.',
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
        <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">Резиденты не&nbsp;найдены</h3>
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
    const fName = (m.first_name || '').trim();
    const lName = (m.last_name || '').trim();
    const name = (fName && lName && fName.includes(lName)) ? fName : (`${fName} ${lName}`.trim() || (m.show_telegram_contact && m.username ? '@' + m.username : 'Резидент Клуба'));
    const isMikhail = (m.username && m.username.toLowerCase() === 'michael_sage') || m.telegram_id == 439634804 || m.telegram_id == 88472911;
    const roleBadge = isMikhail
      ? '<span class="badge-role club" style="font-size:0.68rem; padding:2px 6px; background:#09090b; color:#ffffff;">👑 Основатель</span>'
      : '<span class="badge-role club" style="font-size:0.68rem; padding:2px 6px;">💎 Резидент</span>';

    const avatar = m.photo_url
      ? `<img src="${m.photo_url}" alt="${name}" class="member-avatar">`
      : `<div class="member-avatar-placeholder">${name.charAt(0).toUpperCase()}</div>`;

    let linksHtml = '';
    if (m.show_telegram_contact && m.username) {
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
              </div>
            </div>
          </div>
          <div class="member-bio" style="font-size:0.88rem; color:#52525b; line-height:1.5; margin-bottom:16px;">${m.bio || 'Резидент клуба SAGE Neuro Family'}</div>
        </div>
        <div class="member-actions" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; border-top:1px solid #f4f4f5; padding-top:14px; margin-top:auto;">
          ${linksHtml || '<span style="font-family:var(--mono); font-size:0.72rem; color:#a1a1aa;">Контакты не&nbsp;указаны</span>'}
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
        <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:8px;">У&nbsp;вас пока нет закладок</h3>
        <p style="color:var(--gray); font-size:0.95rem; max-width:480px; margin:0 auto 20px auto;">
          Нажимайте на&nbsp;звездочку рядом с&nbsp;видео-уроками, промптами или&nbsp;терминами глоссария, чтобы сохранять их для&nbsp;быстрого доступа.
        </p>
        <button onclick="switchCabinetTab('education')" class="btn-primary" style="padding:10px 20px; font-size:0.84rem;">
          Перейти к&nbsp;видео-урокам ↗
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

// ── 9. INITIALIZATION &&nbsp;LIFECYCLE ────────────────────────────────────────────
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
