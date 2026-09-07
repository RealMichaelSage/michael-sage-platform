/**
 * SAGE Platform - Personal Cabinet (Cockpit & Digital Store)
 * Engine: Vibes UI Engine 3.0 (Swiss Stark AI)
 * Authoritative: DESIGN_SYSTEM.md, personal_cabinet_architecture_spec.md
 */

// ── 1. GLOBAL STATE & UTILS ──────────────────────────────────────────────────
let allShowcaseProducts = [];
let activeStoreFilter = "all";
let currentViewerProduct = null;
let countdownTimerInterval = null;
let networkingMembersCache = [];

function safeJsonParse(val, fallback = null) {
  try {
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function padZero(num) {
  return String(num).padStart(2, "0");
}

// ── 2. NEXT MASTERMIND CALCULATION & LIVE COUNTDOWN ───────────────────────────
function getNextMastermindDate(fromDate = new Date()) {
  const now = fromDate instanceof Date ? fromDate : new Date(fromDate);
  const candidates = [];
  
  for (let i = 0; i <= 14; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const day = d.getUTCDay(); // 0=Sun, 4=Thu
    
    if (day === 4) {
      const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 16, 0, 0));
      if (target.getTime() > now.getTime()) {
        candidates.push(target);
      }
    } else if (day === 0) {
      const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 13, 0, 0));
      if (target.getTime() > now.getTime()) {
        candidates.push(target);
      }
    }
  }
  
  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates.length > 0 ? candidates[0] : new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
}

function startCountdownTimer() {
  const timerDisplay = document.getElementById("countdown-timer-display") || document.querySelector(".countdown-timer, [data-countdown]");
  if (!timerDisplay) return;

  function update() {
    const nextDate = getNextMastermindDate(new Date());
    const now = new Date();
    const diff = Math.max(0, nextDate.getTime() - now.getTime());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const formatted = `${days} д ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    timerDisplay.innerText = formatted;
    timerDisplay.setAttribute("data-countdown", formatted);
  }

  update();
  if (countdownTimerInterval) clearInterval(countdownTimerInterval);
  countdownTimerInterval = setInterval(update, 1000);
}

// ── 3. CLIPBOARD COPY WITH FEEDBACK ──────────────────────────────────────────
async function copyPromptByIndex(idx, btn) {
  if (!currentViewerProduct || !currentViewerProduct.content || !currentViewerProduct.content.prompts) return;
  const pr = currentViewerProduct.content.prompts[idx];
  if (pr) {
    copyPromptToClipboard(pr.body, btn);
  }
}

async function copyPromptToClipboard(text, btnElement = null) {
  let success = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      success = true;
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      success = true;
    }
  } catch (err) {
    console.warn("[Clipboard Warn]", err);
  }

  const btn = btnElement || (window.event && window.event.target && window.event.target.closest("button"));
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = "СКОПИРОВАНО ✓";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove("copied");
    }, 2000);
  }

  if (typeof Auth !== "undefined" && Auth.showToast) {
    Auth.showToast("Промпт скопирован в буфер обмена", "success");
  }
}

// ── 4. TAB SWITCHING SYSTEM ──────────────────────────────────────────────────
function switchCabinetTab(tabId, btnElem = null) {
  const normalizedTab = tabId === "club" ? "community" : tabId;
  const validTabs = ["dashboard", "library", "store", "community", "profile"];
  const targetId = validTabs.includes(normalizedTab) ? normalizedTab : "dashboard";

  try {
    localStorage.setItem("asage_cabinet_tab", targetId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", targetId);
    history.replaceState(null, "", url.toString());
  } catch (e) {}

  document.querySelectorAll(".cabinet-tab-btn").forEach(b => {
    const btnTab = (b.dataset.tab || b.getAttribute("data-tab") || "").toLowerCase();
    if (btnTab === targetId || (targetId === "community" && btnTab === "club")) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  document.querySelectorAll(".cabinet-tab-pane").forEach(p => {
    p.classList.remove("active");
    p.style.display = "none";
  });

  const targetPane = document.getElementById(`tab-${targetId}`);
  if (targetPane) {
    targetPane.classList.add("active");
    targetPane.style.display = "block";
  }

  renderCabinetUI();
}

// ── 5. DATA FETCHING (PRODUCTS MANIFEST) ──────────────────────────────────────
async function loadShowcaseProducts() {
  try {
    const res = await fetch("/data/showcase_products.json?v=" + Date.now());
    if (res.ok) {
      allShowcaseProducts = await res.json();
      return allShowcaseProducts;
    }
  } catch (e) {
    console.warn("[Manifest Load Warn]", e);
  }

  allShowcaseProducts = [
    {
      id: "telegram-voice-transcriber-bot",
      title: "Telegram Voice Transcriber Bot // Whisper & aiogram 3",
      category: "bot",
      badge: "ХИТ ПРОДАЖ",
      description: "Автономный микросервисный Telegram-бот для мгновенной транскрибации голосовых сообщений и видео-кружочков через Groq Whisper API со скоростью 220x реалтайма.",
      price_rub: 2990,
      is_free_for_club: true,
      tech_stack: ["Python 3.11", "aiogram 3", "Groq Whisper API", "Docker", "FFmpeg", "Redis"],
      content: {
        video_embed_url: "https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2",
        download_zip_url: "/downloads/bots/telegram-voice-transcriber-v2.zip",
        github_url: "https://github.com/mikhail-sage/telegram-voice-transcriber-bot",
        prompts: [
          {
            title: "Системный промпт пост-обработки транскриптов",
            body: "Ты — профессиональный стенографист. Исправь грамматические ошибки, разбей на абзацы и выдели Action Items."
          }
        ],
        checklist: [
          "1. Создать Telegram-бота через @BotFather и скопировать BOT_TOKEN",
          "2. Сгенерировать ключ API в Groq Console",
          "3. Скопировать .env.example в .env и запустить docker compose up -d"
        ]
      }
    },
    {
      id: "ai-lead-scraper-crm-enricher",
      title: "AI Lead Scraper & CRM Enricher // Telethon & Bitrix24",
      category: "bot",
      badge: "B2B ИНСТРУМЕНТ",
      description: "Асинхронный парсер Telegram-чатов с ИИ-фильтрацией платежеспособных лидов и созданием сделок в CRM.",
      price_rub: 4990,
      is_free_for_club: true,
      tech_stack: ["Python 3.11", "Telethon", "OpenAI GPT-4o-mini", "Bitrix24 REST API"],
      content: {
        video_embed_url: "https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2",
        download_zip_url: "/downloads/bots/lead-scraper.zip",
        github_url: "https://github.com/mikhail-sage/ai-lead-scraper",
        prompts: [{ title: "Промпт квалификации лидов", body: "Определи платежеспособность клиента..." }],
        checklist: ["1. Получить API ID и Hash на my.telegram.org", "2. Настроить вебхук в Bitrix24"]
      }
    },
    {
      id: "vibe-coding-antigravity-setup-guide",
      title: "Архитектура Vibe Coding в Antigravity & Claude Code",
      category: "vibe",
      badge: "СТАНДАРТ 2026",
      description: "Глубокий инженерный гайд по развертыванию мультиагентной среды, MCP-серверов и автономных пайплайнов разработки.",
      price_rub: 1990,
      is_free_for_club: true,
      tech_stack: ["Antigravity", "Claude Code", "MCP Servers", "Docker", "Zsh"],
      content: {
        video_embed_url: "https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2",
        download_zip_url: "/downloads/guides/vibe-coding-setup.zip",
        github_url: "https://github.com/mikhail-sage/vibe-coding-starter",
        prompts: [{ title: "Системный промпт архитектора", body: "Ты — Lead AI Architect..." }],
        checklist: ["1. Установить Antigravity CLI", "2. Настроить config/skills"]
      }
    },
    {
      id: "mastermind-mcp-deepdive-01",
      title: "Запись Мастермайна: Проектирование сложных MCP-серверов",
      category: "guide",
      badge: "ЗАПИСЬ ЭФИРА",
      description: "Практический воркшоп резидентов SAGE Neuro Family: создание сервера для синхронизации с базой данных и живое тестирование.",
      price_rub: 1990,
      is_free_for_club: true,
      tech_stack: ["TypeScript", "Model Context Protocol", "Supabase", "Node.js"],
      content: {
        video_embed_url: "https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2",
        download_zip_url: "/downloads/masterminds/mcp-deepdive.zip",
        github_url: "https://github.com/mikhail-sage/mcp-sample-server",
        prompts: [{ title: "Промпт генерации MCP схем", body: "Создай спецификацию MCP инструментов..." }],
        checklist: ["1. Запустить тестовый сервер", "2. Подключить к IDE"]
      }
    }
  ];
  return allShowcaseProducts;
}

// ── 6. RENDER DASHBOARD (⚡ ДАШБОРД) ─────────────────────────────────────────
function renderDashboard(user, isClubResident) {
  const avatarImg = document.getElementById("cabinet-user-avatar") || document.querySelector(".cabinet-avatar");
  const displayName = document.getElementById("cabinet-display-name") || document.querySelector(".cabinet-user-name");
  const tgHandle = document.getElementById("cabinet-tg-handle") || document.querySelector(".cabinet-user-handle");
  const subStatusBadge = document.getElementById("cabinet-sub-badge") || document.querySelector(".cabinet-sub-status");

  if (avatarImg) {
    if (user && user.photo_url) {
      avatarImg.src = user.photo_url;
      avatarImg.style.display = "block";
    } else {
      avatarImg.src = "/img/mikhail_hero.jpg";
    }
  }

  if (displayName) {
    if (user && (user.first_name || user.last_name)) {
      displayName.innerText = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    } else {
      displayName.innerText = "Гость Платформы";
    }
  }

  if (tgHandle) {
    const u = user && user.username ? user.username.replace(/^@/, "") : "guest_user";
    tgHandle.innerText = `@${u}`;
  }

  if (subStatusBadge) {
    if (isClubResident) {
      const expDate = user && user.subscription_expires_at 
        ? new Date(user.subscription_expires_at).toLocaleDateString("ru-RU")
        : "05.10.2026";
      subStatusBadge.className = "badge-role club cabinet-sub-status";
      subStatusBadge.innerHTML = `💎 Резидент SAGE Neuro Family <span class="badge-exp">до ${expDate}</span>`;
    } else {
      subStatusBadge.className = "badge-role cabinet-sub-status";
      subStatusBadge.innerHTML = `Гость Платформы <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-tribute-cta">Вступить в Клуб (1 900 ₽) ↗</a>`;
    }
  }
}

// ── 7. RENDER MY LIBRARY (📂 МОЯ БИБЛИОТЕКА) ──────────────────────────────────
function renderLibrary(user, isClubResident) {
  const container = document.getElementById("library-content-container");
  if (!container) return;

  const storedPurchases = safeJsonParse(localStorage.getItem("asage_purchases"), []);

  let availableItems = [];
  if (isClubResident) {
    availableItems = [...allShowcaseProducts];
  } else {
    availableItems = allShowcaseProducts.filter(p => storedPurchases.includes(p.id));
  }

  const libBadge = document.getElementById("tab-badge-library");
  if (libBadge) {
    libBadge.innerText = String(availableItems.length);
  }

  if (availableItems.length === 0) {
    container.innerHTML = `
      <div class="library-empty-state empty-library-banner">
        <div class="empty-icon">📂</div>
        <h3 class="empty-title">Ваша библиотека пока пуста</h3>
        <p class="empty-desc">У вас пока нет купленных цифровых решений или активной подписки в Клуб SAGE Neuro Family.</p>
        <div class="empty-actions">
          <button class="btn-primary" onclick="switchCabinetTab('store')">Перейти в Витрину Решений ↗</button>
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-secondary">Вступить в Клуб (1 900 ₽) ↗</a>
        </div>
      </div>
    `;
    return;
  }

  let html = `<div class="library-grid">`;
  availableItems.forEach(p => {
    const badgeText = isClubResident ? "✓ По подписке Клуба" : "✓ Куплено навсегда";
    html += `
      <div class="library-card material-card" data-product-id="${p.id}" data-open-viewer="${p.id}" onclick="openInAppViewer('${p.id}')">
        <div class="library-card-header">
          <span class="badge-role club library-card-badge">${badgeText}</span>
          <span class="library-card-category">[ ${p.category.toUpperCase()} ]</span>
        </div>
        <h3 class="library-card-title">${p.title}</h3>
        <p class="library-card-desc">${p.description}</p>
        <div class="library-card-footer">
          <div class="library-tech-stack">
            ${(p.tech_stack || []).slice(0, 3).map(t => `<span class="tech-tag">${t}</span>`).join("")}
          </div>
          <button class="btn-primary btn-library-open" data-open-viewer="${p.id}">
            Открыть материалы ↗
          </button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// ── 8. RENDER SOLUTIONS STORE (🛍️ ВИТРИНА РЕШЕНИЙ) ───────────────────────────
function renderStore(user, isClubResident) {
  const container = document.getElementById("store-grid-container");
  const emptyState = document.getElementById("store-empty-state");
  const searchInput = document.getElementById("store-search-input");
  if (!container) return;

  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = allShowcaseProducts.filter(p => {
    if (activeStoreFilter !== "all" && p.category !== activeStoreFilter) {
      return false;
    }
    if (searchQuery) {
      const matchTitle = p.title.toLowerCase().includes(searchQuery);
      const matchDesc = p.description.toLowerCase().includes(searchQuery);
      const matchTech = (p.tech_stack || []).some(t => t.toLowerCase().includes(searchQuery));
      return matchTitle || matchDesc || matchTech;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  container.style.display = "grid";
  if (emptyState) emptyState.style.display = "none";

  let html = "";
  filtered.forEach(p => {
    const formattedPrice = Number(p.price_rub).toLocaleString("ru-RU") + " ₽";
    
    let actionBtnHtml = "";
    let pricingHtml = "";

    if (isClubResident) {
      pricingHtml = `
        <div class="store-pricing-row">
          <span class="price-resident">0 ₽</span>
          <span class="badge-role club">✓ Включено в Клуб</span>
        </div>
      `;
      actionBtnHtml = `
        <button class="btn-primary store-buy-btn btn-action" onclick="openInAppViewer('${p.id}')">
          ✓ Доступно в вашей библиотеке ↗
        </button>
      `;
    } else {
      pricingHtml = `
        <div class="store-pricing-row">
          <span class="price-single">${formattedPrice}</span>
          <span class="price-club-hint">или <a href="https://web.tribute.tg/s/O6I" target="_blank">0 ₽ с подпиской SAGE Club</a></span>
        </div>
      `;
      actionBtnHtml = `
        <div class="store-actions-dual">
          <button class="btn-primary store-buy-btn btn-action" onclick="handleBuyProduct('${p.id}', ${p.price_rub})">
            Купить навсегда (${formattedPrice})
          </button>
          <a href="https://web.tribute.tg/s/O6I" target="_blank" class="btn-secondary btn-store-club">
            Все решения за 1 900 ₽ ↗
          </a>
        </div>
      `;
    }

    html += `
      <div class="store-card showcase-product-card" data-product-id="${p.id}" data-category="${p.category}">
        <div class="store-card-header">
          <span class="badge-role badge-category store-card-badge">${p.badge || p.category.toUpperCase()}</span>
          <span class="store-card-cat-label">[ ${p.category.toUpperCase()} ]</span>
        </div>
        <h3 class="store-card-title">${p.title}</h3>
        <p class="store-card-desc">${p.description}</p>
        <div class="store-card-tech">
          ${(p.tech_stack || []).map(t => `<span class="tech-tag">${t}</span>`).join("")}
        </div>
        <div class="store-card-bottom">
          ${pricingHtml}
          ${actionBtnHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setStoreCategoryFilter(category, btnElement) {
  activeStoreFilter = category;
  document.querySelectorAll(".category-chip").forEach(b => {
    if ((b.dataset.filter || b.getAttribute("data-filter")) === category) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  const user = typeof Auth !== "undefined" ? Auth.getUser() : null;
  const isClub = (typeof Auth !== "undefined" && Auth.hasClubAccess && Auth.hasClubAccess()) || 
                 (user && (user.role === "club_member" || user.username === "Michael_Sage"));
  renderStore(user, isClub);
}

function handleBuyProduct(productId, price) {
  const storedPurchases = safeJsonParse(localStorage.getItem("asage_purchases"), []);
  if (!storedPurchases.includes(productId)) {
    storedPurchases.push(productId);
    localStorage.setItem("asage_purchases", JSON.stringify(storedPurchases));
  }
  if (typeof Auth !== "undefined" && Auth.showToast) {
    Auth.showToast("Материал добавлен в вашу библиотеку!", "success");
  }
  switchCabinetTab("library");
}

// ── 9. IN-APP VIEWER (MODAL PLAYER & WORKSHOP VIEWER) ─────────────────────────
function openInAppViewer(productId) {
  const product = allShowcaseProducts.find(p => p.id === productId);
  if (!product) return;
  currentViewerProduct = product;

  const modal = document.getElementById("in-app-viewer-modal");
  if (!modal) return;

  const titleEl = document.getElementById("viewer-title");
  const badgeEl = document.getElementById("viewer-badge");
  const descEl = document.getElementById("viewer-desc");
  if (titleEl) titleEl.innerText = product.title;
  if (badgeEl) badgeEl.innerText = `[ ${product.category.toUpperCase()} ]`;
  if (descEl) descEl.innerText = product.description;

  const content = product.content || {};

  // 1. Video tab
  const videoPane = document.getElementById("viewer-pane-video");
  if (videoPane) {
    const videoUrl = content.video_embed_url || "https://vk.com/video_ext.php?oid=708436546&id=456239175&hash=44ba6d5be9fb7a75&hd=2";
    videoPane.innerHTML = `
      <div class="video-container">
        <iframe src="${videoUrl}" width="100%" height="480" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>
      <div class="video-meta-bar">
        <span>🎬 Практический разбор внедрения // Время: ~45 мин</span>
        <a href="${videoUrl}" target="_blank" class="link-external">Открыть в полный экран ↗</a>
      </div>
    `;
  }

  // 2. Code tab
  const codePane = document.getElementById("viewer-pane-code");
  if (codePane) {
    const zipUrl = content.download_zip_url || `/downloads/bots/${product.id}.zip`;
    const gitUrl = content.github_url || `https://github.com/mikhail-sage/${product.id}`;
    codePane.innerHTML = `
      <div class="code-tab-content">
        <div class="code-download-bar">
          <a href="${zipUrl}" download class="btn-primary btn-dl-zip">Скачать ZIP с кодом (.zip) ↗</a>
          <a href="${gitUrl}" target="_blank" class="btn-secondary btn-git-link">Репозиторий на GitHub ↗</a>
        </div>
        <div class="tech-requirements-box">
          <h4>Стек технологий & Окружение:</h4>
          <div class="tech-pills-row">
            ${(product.tech_stack || []).map(t => `<span class="tech-tag">${t}</span>`).join("")}
          </div>
          <p class="code-note">Исходный код полностью готов к деплою в Docker / Beget / VPS. Включает .env.example и Dockerfile.</p>
        </div>
      </div>
    `;
  }

  // 3. Prompts tab
  const promptsPane = document.getElementById("viewer-pane-prompts");
  if (promptsPane) {
    const prompts = content.prompts || [];
    if (prompts.length === 0) {
      promptsPane.innerHTML = `<p class="empty-note">Системные промпты упакованы внутри репозитория.</p>`;
    } else {
      let pHtml = `<div class="prompts-list-wrap">`;
      prompts.forEach((pr, idx) => {
        const escaped = pr.body.replace(/"/g, "&quot;");
        pHtml += `
          <div class="prompt-card">
            <div class="prompt-card-header">
              <span class="prompt-num">#${idx + 1}</span>
              <strong class="prompt-card-title">${pr.title}</strong>
              <button class="btn-secondary copy-prompt-btn" data-action="copy-prompt" onclick="copyPromptByIndex(${idx}, this)">
                Скопировать промпт 📋
              </button>
            </div>
            <pre class="prompt-body-code"><code>${pr.body}</code></pre>
          </div>
        `;
      });
      pHtml += `</div>`;
      promptsPane.innerHTML = pHtml;
    }
  }

  // 4. Checklist tab with localStorage persistence
  const checklistPane = document.getElementById("viewer-pane-checklist");
  if (checklistPane) {
    const checklist = content.checklist || [];
    const savedChecks = safeJsonParse(localStorage.getItem(`asage_checklist_${product.id}`), []);

    let cHtml = `<div class="checklist-items-wrap">`;
    checklist.forEach((item, idx) => {
      const isChecked = savedChecks.includes(idx) ? "checked" : "";
      cHtml += `
        <label class="checklist-item ${isChecked ? "completed" : ""}">
          <input type="checkbox" data-index="${idx}" onchange="toggleChecklistItem('${product.id}', ${idx}, this)" ${isChecked}>
          <span class="checklist-text">${item}</span>
        </label>
      `;
    });
    cHtml += `</div>`;
    checklistPane.innerHTML = cHtml;
  }

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  switchViewerSubtab("video");
}

function closeInAppViewer() {
  const modal = document.getElementById("in-app-viewer-modal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
  currentViewerProduct = null;
}

function switchViewerSubtab(subtabId) {
  document.querySelectorAll(".in-app-subtab-btn").forEach(b => {
    if ((b.dataset.subtab || b.getAttribute("data-subtab")) === subtabId) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  document.querySelectorAll(".in-app-subtab-pane").forEach(p => {
    if ((p.dataset.pane || p.getAttribute("data-pane")) === subtabId) {
      p.style.display = "block";
    } else {
      p.style.display = "none";
    }
  });
}

function toggleChecklistItem(productId, index, checkbox) {
  const storageKey = `asage_checklist_${productId}`;
  let savedChecks = safeJsonParse(localStorage.getItem(storageKey), []);

  if (checkbox.checked) {
    if (!savedChecks.includes(index)) savedChecks.push(index);
    checkbox.closest(".checklist-item").classList.add("completed");
  } else {
    savedChecks = savedChecks.filter(i => i !== index);
    checkbox.closest(".checklist-item").classList.remove("completed");
  }
  localStorage.setItem(storageKey, JSON.stringify(savedChecks));
}

// ── 10. CLUB HUB (💎 КЛУБНЫЙ ХАБ) ───────────────────────────────────────────
async function loadNetworkingMembers() {
  const container = document.getElementById("members-directory-grid");
  if (!container) return;

  const currentUser = typeof Auth !== "undefined" ? Auth.getUser() : safeJsonParse(localStorage.getItem("asage_user"));

  const baseMembers = [
    {
      first_name: "Михаил",
      last_name: "Пузырёв",
      username: "Michael_Sage",
      role: "club_member",
      bio: "Основатель платформы & AI-архитектор. Обучаю Vibe Coding, проектирую автономные агентные системы.",
      channel_url: "https://t.me/uncrn_sage",
      website_url: "https://a-sage.ru",
      is_private: false
    },
    {
      first_name: "Алексей",
      last_name: "Громов",
      username: "gromov_ai",
      role: "club_member",
      bio: "Инженер автоматизации. Интегрирую LLM в CRM-системы (Bitrix24, amoCRM) и n8n.",
      channel_url: "https://t.me/gromov_ai",
      website_url: "",
      is_private: false
    },
    {
      first_name: "Елена",
      last_name: "Соколова",
      username: "sokolova_ux",
      role: "club_member",
      bio: "Product Designer. Исследую интерфейсы взаимодействия человека с агентными ИИ.",
      channel_url: "",
      website_url: "https://sokolova.design",
      is_private: false
    }
  ];

  let directory = [...baseMembers];
  if (typeof Auth !== "undefined" && Auth.fetchMembersDirectory) {
    try {
      const fetched = await Auth.fetchMembersDirectory();
      if (fetched && fetched.length > 0) {
        directory = fetched;
      }
    } catch (e) {}
  }

  if (currentUser) {
    const idx = directory.findIndex(m => 
      (m.telegram_id && currentUser.telegram_id && m.telegram_id == currentUser.telegram_id) ||
      (m.username && currentUser.username && m.username.toLowerCase() === currentUser.username.toLowerCase())
    );

    if (currentUser.is_private) {
      if (idx !== -1) directory.splice(idx, 1);
    } else if (currentUser.role === "club_member" || currentUser.username === "Michael_Sage") {
      const normalizedCurrent = {
        first_name: currentUser.first_name || "Пользователь",
        last_name: currentUser.last_name || "",
        username: currentUser.username || "user",
        role: "club_member",
        bio: currentUser.bio || "Резидент SAGE Neuro Family",
        channel_url: currentUser.channel_url || "",
        website_url: currentUser.website_url || "",
        is_private: false
      };
      if (idx !== -1) {
        directory[idx] = normalizedCurrent;
      } else {
        directory.unshift(normalizedCurrent);
      }
    }
  }

  const visibleMembers = directory.filter(m => !m.is_private);

  let html = "";
  visibleMembers.forEach(m => {
    const handle = m.username ? `@${m.username.replace(/^@/, "")}` : "";
    html += `
      <div class="member-card resident-card">
        <div class="member-header">
          <div class="member-avatar-placeholder">${(m.first_name || "U")[0].toUpperCase()}</div>
          <div class="member-info">
            <h4 class="member-name">${m.first_name || ""} ${m.last_name || ""}</h4>
            <span class="member-handle">${handle}</span>
          </div>
          <span class="badge-role club">РЕЗИДЕНТ</span>
        </div>
        <p class="member-bio">${m.bio || "Резидент сообщества SAGE Neuro Family"}</p>
        <div class="member-actions">
          ${m.channel_url ? `<a href="${m.channel_url}" target="_blank" class="link-meta">📢 Канал</a>` : ""}
          ${m.website_url ? `<a href="${m.website_url}" target="_blank" class="link-meta">🌐 Сайт</a>` : ""}
          ${handle ? `<a href="https://t.me/${handle.replace("@", "")}" target="_blank" class="link-meta">💬 Написать</a>` : ""}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterArchiveMasterminds() {
  const input = document.getElementById("archive-search-inp");
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  const items = document.querySelectorAll(".mastermind-archive .archive-card, .mastermind-archive .mastermind-item");
  items.forEach(it => {
    const text = it.innerText.toLowerCase();
    it.style.display = text.includes(q) ? "block" : "none";
  });
}

function handleQASubmit(e) {
  e.preventDefault();
  const form = e.target;
  const textarea = form.querySelector("textarea");
  if (!textarea || !textarea.value.trim()) return;

  if (typeof Auth !== "undefined" && Auth.showToast) {
    Auth.showToast("Вопрос отправлен! Михаил разберет его на ближайшем созвоне.", "success");
  }
  form.reset();
}

// ── 11. PROFILE & REAL-TIME PREVIEW (👤 ПРОФИЛЬ) ──────────────────────────────
function syncProfileForm(user) {
  if (!user) return;
  const fnInp = document.getElementById("inp-first-name");
  const lnInp = document.getElementById("inp-last-name");
  const tgInp = document.getElementById("inp-tg-username");
  const bioInp = document.getElementById("inp-bio");
  const chInp = document.getElementById("inp-channel");
  const webInp = document.getElementById("inp-website");
  const privInp = document.getElementById("inp-is-private");

  if (fnInp) fnInp.value = user.first_name || "";
  if (lnInp) lnInp.value = user.last_name || "";
  if (tgInp) tgInp.value = user.username || "";
  if (bioInp) bioInp.value = user.bio || "";
  if (chInp) chInp.value = user.channel_url || "";
  if (webInp) webInp.value = user.website_url || "";
  if (privInp) privInp.checked = Boolean(user.is_private);

  updateProfileLivePreview();
}

function updateProfileLivePreview() {
  const fnInp = document.getElementById("inp-first-name");
  const lnInp = document.getElementById("inp-last-name");
  const tgInp = document.getElementById("inp-tg-username");
  const bioInp = document.getElementById("inp-bio");
  const privInp = document.getElementById("inp-is-private");

  const pName = document.getElementById("preview-user-name");
  const pHandle = document.getElementById("preview-user-handle");
  const pBio = document.getElementById("preview-user-bio");
  const pPrivacy = document.getElementById("preview-user-privacy");

  const fn = fnInp ? fnInp.value.trim() : "";
  const ln = lnInp ? lnInp.value.trim() : "";
  const fullName = `${fn} ${ln}`.trim() || "Имя Фамилия";

  if (pName) pName.innerText = fullName;
  if (pHandle) pHandle.innerText = tgInp && tgInp.value ? `@${tgInp.value.replace(/^@/, "")}` : "@username";
  if (pBio) pBio.innerText = bioInp && bioInp.value ? bioInp.value : "Описание вашего опыта и проектов...";
  if (pPrivacy) {
    const isPrivate = privInp ? privInp.checked : false;
    pPrivacy.innerText = isPrivate ? "🔒 Скрыт в каталоге резидентов" : "🌐 Отображается в каталоге резидентов";
  }
}

async function handleProfileSave(e) {
  if (e) e.preventDefault();
  const fnInp = document.getElementById("inp-first-name");
  const lnInp = document.getElementById("inp-last-name");
  const tgInp = document.getElementById("inp-tg-username");
  const bioInp = document.getElementById("inp-bio");
  const chInp = document.getElementById("inp-channel");
  const webInp = document.getElementById("inp-website");
  const privInp = document.getElementById("inp-is-private");

  const currentUser = (typeof Auth !== "undefined" && Auth.getUser()) || safeJsonParse(localStorage.getItem("asage_user"), {});

  const updatedUser = {
    ...currentUser,
    first_name: fnInp ? fnInp.value.trim() : (currentUser.first_name || ""),
    last_name: lnInp ? lnInp.value.trim() : (currentUser.last_name || ""),
    username: tgInp ? tgInp.value.replace(/^@/, "").trim() : (currentUser.username || ""),
    bio: bioInp ? bioInp.value.trim() : (currentUser.bio || ""),
    channel_url: chInp ? chInp.value.trim() : (currentUser.channel_url || ""),
    website_url: webInp ? webInp.value.trim() : (currentUser.website_url || ""),
    is_private: privInp ? Boolean(privInp.checked) : Boolean(currentUser.is_private)
  };

  localStorage.setItem("asage_user", JSON.stringify(updatedUser));
  window.dispatchEvent(new CustomEvent("asage_auth_changed", { detail: updatedUser }));

  if (typeof Auth !== "undefined" && Auth.updateUserProfile) {
    try {
      await Auth.updateUserProfile(updatedUser);
    } catch (err) {
      console.warn("[Supabase Sync Warn]", err);
    }
  }

  renderCabinetUI();
  if (typeof Auth !== "undefined" && Auth.showToast) {
    Auth.showToast("Профиль успешно сохранен", "success");
  }
}

// ── 12. MASTER RENDERER & INIT ───────────────────────────────────────────────
function renderCabinetUI() {
  const user = typeof Auth !== "undefined" ? Auth.getUser() : safeJsonParse(localStorage.getItem("asage_user"));
  const isClubResident = (typeof Auth !== "undefined" && Auth.hasClubAccess && Auth.hasClubAccess()) || 
                         (user && (user.role === "club_member" || user.username === "Michael_Sage"));

  renderDashboard(user, isClubResident);
  renderLibrary(user, isClubResident);
  renderStore(user, isClubResident);
  loadNetworkingMembers();
  syncProfileForm(user);
}

function updateHeaderAuthUI() {
  if (typeof Auth !== "undefined" && Auth.updateHeaderUI) {
    Auth.updateHeaderUI();
  }
  renderCabinetUI();
}

// ── 13. DOM READY INITIALIZATION ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadShowcaseProducts();

  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || localStorage.getItem("asage_cabinet_tab") || "dashboard";
  switchCabinetTab(initialTab);

  startCountdownTimer();
  renderCabinetUI();

  const formFields = ["inp-first-name", "inp-last-name", "inp-tg-username", "inp-bio", "inp-channel", "inp-website", "inp-is-private"];
  formFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateProfileLivePreview);
      el.addEventListener("change", updateProfileLivePreview);
    }
  });

  window.addEventListener("asage_auth_changed", () => {
    renderCabinetUI();
  });
});
