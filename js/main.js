/**
 * Mikhail Puzyrev Platform - Interactive Scripts
 * Swiss Stark AI Theme
 */

document.addEventListener('DOMContentLoaded', () => {
  // Active Nav Link Highlighter (Strict clean URL matching)
  const lastSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
  const cleanPath = lastSegment.replace(/\.html$/, '');
  const currentPath = (cleanPath === '' || cleanPath === 'index') ? 'home' : cleanPath;

  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const rawAttr = link.getAttribute('href');
    if (!rawAttr || rawAttr === '#' || rawAttr.startsWith('#') || rawAttr.startsWith('javascript:')) {
      return;
    }

    const cleanHref = rawAttr.split('#')[0].replace(/^\/+|\/+$/g, '').replace(/\.html$/, '') || 'home';

    if (cleanHref === currentPath) {
      link.classList.add('active');
      const parentDropdown = link.closest('.nav-dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) toggle.classList.add('active');
      }
    }
  });

  // Mobile Burger Menu
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(other => other.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // Simulator Data & Logic
  const simData = {
    mvp: {
      title: 'vibe-coding-engine.ts',
      steps: [
        { label: '01 / АРХИТЕКТУРА', title: 'Оцифровка бизнес-логики и юнит-экономики', desc: 'Снятие потребностей, определение точки монетизации и отказ от избыточных фичей.', tags: ['Vibe Coding', 'ROI First', 'Supabase'] },
        { label: '02 / ГЕНЕРАЦИЯ & КОД', title: 'Сборка интерфейса и логики через AI-агентов', desc: 'Antigravity, Stitch MCP, Next.js, чистый HTML/CSS, защищенный API бэкенд.', tags: ['Stitch MCP', 'Fluid CSS', 'FastAPI'] },
        { label: '03 / ЗАПУСК & ПЛАТЕЖИ', title: 'Деплой на хостинг и боевой тест за 3-5 дней', desc: 'Подключение оплат (ЮKassa/Т-Банк), сквозная Метрика и получение первых клиентов.', tags: ['Beget', 'ФЗ-152', '100% Prod'] }
      ]
    },
    agents: {
      title: 'crm-autonomous-agents.py',
      steps: [
        { label: '01 / АНАЛИЗАТОР', title: 'Парсинг чатов и аудиосообщений клиентов', desc: 'Автоматическая выжимка ключевых смыслов из Telegram через Telethon и Whisper.', tags: ['Voice AI', 'Whisper API', 'JSON'] },
        { label: '02 / КАСКАД СВЯЗОК', title: 'Сквозной мост: Мессенджер → AI → Bitrix24 / amoCRM', desc: 'Агент готовит черновик задачи, проверяет контекст сделки и создает сущности.', tags: ['Bitrix24 API', 'PostgreSQL', 'Webhooks'] },
        { label: '03 / КОНТРОЛЬ РЕШЕНИЙ', title: 'Уведомление руководителя и дожим сделки', desc: 'Генерация КП, счетов и напоминаний без затягивания времени.', tags: ['Timeline CRM', 'Авто-КП', 'Zero Friction'] }
      ]
    },
    media: {
      title: 'autonomous-media-machine.sh',
      steps: [
        { label: '01 / МОНИТОРИНГ', title: 'Сбор инфоповодов и мировых трендов', desc: 'Парсинг 50+ научных журналов, блогов и новостных лент в режиме 24/7.', tags: ['RSS', 'Playwright', 'Europe PMC'] },
        { label: '02 / РЕДАКЦИЯ ИИ', title: 'Генерация, фактчекинг и локализация', desc: 'Автоматическое написание уникальных лонгридов и тестов по стандартам aipsy.press.', tags: ['55+ статей/день', 'SEO / AEO', 'Clean Meta'] },
        { label: '03 / МУЛЬТИ-ПОСТИНГ', title: 'Авто-публикация в СМИ и Telegram-каналы', desc: 'Публикация на домен с разметкой OpenGraph, Schema.org и Яндекс Турбо.', tags: ['aipsy.press', 'Telegram API', 'Instant Index'] }
      ]
    },
    geo: {
      title: 'geo-search-optimizer.json',
      steps: [
        { label: '01 / АУДИТ ВЫДАЧИ', title: 'Диагностика присутствия в поиске Яндекса и нейросетях', desc: 'Проверка ответов ИИ-моделей и поисковиков по ключевым запросам вашей ниши.', tags: ['Яндекс Поиск', 'ChatGPT 4o', 'Perplexity'] },
        { label: '02 / GEO-ОПТИМИЗАЦИЯ', title: 'Подготовка и адаптация контента под ИИ', desc: 'Структурирование данных и смысловых блоков для прямого цитирования в поисковых нейросетях.', tags: ['GEO Strategy', 'Яндекс Нейро', 'AEO'] },
        { label: '03 / ЦИТИРУЕМОСТЬ', title: 'Закрепление бренда как авторитетного источника', desc: 'Рост прямого трафика из ответов нейросетей с прозрачной фиксацией динамики.', tags: ['Citations', 'Brand Lift', 'GEO Analytics'] }
      ]
    }
  };

  const simTabs = document.querySelectorAll('.sim-tab');
  const simBody = document.querySelector('.sim-body');
  const windowTitle = document.querySelector('.window-title');

  if (simTabs.length > 0 && simBody) {
    simTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        simTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const data = simData[mode];
        if (data) {
          if (windowTitle) windowTitle.textContent = data.title;
          simBody.style.opacity = '0';
          simBody.style.transform = 'translateY(4px)';
          simBody.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

          setTimeout(() => {
            simBody.innerHTML = data.steps.map((step, idx) => `
              <div class="sim-step ${idx === 0 ? 'active' : ''}">
                <div class="sim-step-label">${step.label}</div>
                <div class="sim-step-title">${step.title}</div>
                <div class="sim-step-desc">${step.desc}</div>
                <div class="sim-tags">
                  ${step.tags.map(tag => `<span class="sim-tag">${tag}</span>`).join('')}
                </div>
              </div>
            `).join('');
            simBody.style.opacity = '1';
            simBody.style.transform = 'translateY(0)';
          }, 120);
        }
      });
    });
  }

  // Lead Forms Handling & Honeypot Protection
  const leadForms = document.querySelectorAll('form.lead-form');
  leadForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check Honeypot
      const hp = form.querySelector('input[name="confirm_user_email"]');
      if (hp && hp.value.trim() !== '') {
        console.warn('Bot detected by honeypot');
        return;
      }

      const name = form.querySelector('[name="name"]')?.value || '';
      const phone = form.querySelector('[name="phone"]')?.value || '';
      const telegram = form.querySelector('[name="telegram"]')?.value || '';
      const message = form.querySelector('[name="message"]')?.value || '';
      const page = form.dataset.page || window.location.pathname;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Отправка...';
      }

      // Format Telegram direct link fallback or send
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '✓ Заявка отправлена!';
          submitBtn.style.backgroundColor = '#10b981';
          submitBtn.style.borderColor = '#10b981';
        }
        
        // Show success alert/modal
        alert(`Спасибо, ${name || 'друг'}! Заявка принята. Я свяжусь с вами в Telegram (${telegram || phone}) в ближайшее время.`);
        
        form.reset();
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = '';
            submitBtn.style.borderColor = '';
          }
        }, 3000);
      }, 600);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // ULTRA-SEAMLESS INFINITE MARQUEE, DRAG & DYNAMIC FOCAL ENGINE
  // ══════════════════════════════════════════════════════════════════
  function initInfiniteMarquee(options) {
    const {
      wrapperSelector,
      trackSelector,
      cardSelector,
      speed = 0.7,
      numSets = 4
    } = options;

    const wrapper = document.querySelector(wrapperSelector);
    const track = document.querySelector(trackSelector);
    if (!wrapper || !track) return;

    // Force wrapper to prevent native scrollLeft displacement
    wrapper.style.overflow = 'hidden';
    wrapper.scrollLeft = 0;

    const cards = track.querySelectorAll(cardSelector);
    if (!cards.length) return;

    let currentPos = 0;
    let singleSetWidth = 0;
    let isHovered = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartPos = 0;
    let isVisible = false;
    let hasMoved = false;

    // Calculate width of one single set of items
    function updateDimensions() {
      const cardsPerSet = Math.floor(cards.length / numSets);
      if (cards.length >= cardsPerSet * 2 && cards[0] && cards[cardsPerSet]) {
        const firstCardLeft = cards[0].offsetLeft;
        const nextSetCardLeft = cards[cardsPerSet].offsetLeft;
        singleSetWidth = nextSetCardLeft - firstCardLeft;
      }
      if (!singleSetWidth || singleSetWidth <= 0) {
        singleSetWidth = track.scrollWidth / numSets;
      }
    }

    // Run measurement on DOM ready, image loads, and resize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('load', updateDimensions);

    // Track visibility to pause RAF when out of viewport
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.02 });
    observer.observe(wrapper);

    // Hover listeners
    wrapper.addEventListener('mouseenter', () => {
      isHovered = true;
    });
    wrapper.addEventListener('mouseleave', () => {
      isHovered = false;
      if (isDragging) isDragging = false;
    });

    // Pointer / Mouse Drag listeners
    wrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
      dragStartX = e.pageX;
      dragStartPos = currentPos;
      wrapper.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const diff = e.pageX - dragStartX;
      if (Math.abs(diff) > 4) hasMoved = true;
      currentPos = dragStartPos + diff;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        wrapper.style.cursor = 'grab';
      }
    });

    // Touch listeners for mobile
    wrapper.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      isDragging = true;
      hasMoved = false;
      dragStartX = e.touches[0].pageX;
      dragStartPos = currentPos;
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!isDragging || !e.touches.length) return;
      const diff = e.touches[0].pageX - dragStartX;
      if (Math.abs(diff) > 4) hasMoved = true;
      currentPos = dragStartPos + diff;
    }, { passive: true });

    wrapper.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Prevent click opening lightbox if user was dragging
    wrapper.addEventListener('click', (e) => {
      if (hasMoved) {
        e.stopPropagation();
        e.preventDefault();
        hasMoved = false;
      }
    }, true);

    // Single unified Animation Loop
    function frame() {
      if (isVisible && singleSetWidth > 0) {
        // Auto continuous scroll to left
        if (!isHovered && !isDragging) {
          currentPos -= speed;
        }

        // Modular infinite wrapping:
        // As track moves left (currentPos decreases negatively), wrap when passing 1 set
        while (currentPos <= -singleSetWidth) {
          currentPos += singleSetWidth;
          dragStartPos += singleSetWidth;
        }
        while (currentPos > 0) {
          currentPos -= singleSetWidth;
          dragStartPos -= singleSetWidth;
        }

        // Apply high-performance GPU transform
        track.style.transform = `translate3d(${currentPos}px, 0, 0)`;

        // Dynamic Focal Grayscale-to-Color Calculation
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
        const focusRadius = Math.max(wrapperRect.width * 0.42, 280);

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const cardRect = card.getBoundingClientRect();
          // Only process cards near or inside viewport
          if (cardRect.right > wrapperRect.left - 60 && cardRect.left < wrapperRect.right + 60) {
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distFromCenter = Math.abs(wrapperCenter - cardCenter);
            const factor = Math.min(Math.max(distFromCenter / focusRadius, 0), 1);
            
            // Cosine ease for smooth visual focus
            const ease = 0.5 - 0.5 * Math.cos(factor * Math.PI);
            const grayscale = (ease * 100).toFixed(1);
            const opacity = (1 - ease * 0.38).toFixed(2);
            const scale = (1 + (1 - ease) * 0.04).toFixed(3);
            
            card.style.filter = `grayscale(${grayscale}%) contrast(${(100 + (1 - ease) * 10).toFixed(0)}%)`;
            card.style.opacity = opacity;
            card.style.transform = `scale(${scale})`;
          }
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  // Initialize Infinite Marquee for Reviews, Certificates, and Speaking Photos
  initInfiniteMarquee({
    wrapperSelector: '.speaking-carousel-wrapper',
    trackSelector: '.speaking-track',
    cardSelector: '.speaking-slide-card',
    speed: 0.75, // Speaking photos speed
    numSets: 4
  });

  initInfiniteMarquee({
    wrapperSelector: '.reviews-carousel-wrapper',
    trackSelector: '.reviews-track',
    cardSelector: '.review-slide-card',
    speed: 0.65, // Reviews speed
    numSets: 4
  });

  initInfiniteMarquee({
    wrapperSelector: '.certs-carousel-wrapper',
    trackSelector: '.certs-track',
    cardSelector: '.cert-slide-card',
    speed: 0.85, // Certificates speed
    numSets: 4
  });

  // ══════════════════════════════════════════════════════════════════
  // UNIVERSAL INTERACTIVE LIGHTBOX VIEWER WITH PREV/NEXT & CLICK-NEXT
  // ══════════════════════════════════════════════════════════════════
  let currentGalleryItems = [];
  let currentGalleryIndex = 0;

  const createLightbox = () => {
    let lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox-modal';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Закрыть">×</button>
          <button class="lightbox-nav-btn lightbox-prev" aria-label="Предыдущее фото">‹</button>
          <button class="lightbox-nav-btn lightbox-next" aria-label="Следующее фото">›</button>
          
          <div class="lightbox-img-box" title="Нажмите, чтобы открыть следующее фото →">
            <img class="lightbox-img" src="" alt="">
          </div>
          
          <div class="lightbox-meta">
            <div class="lightbox-caption"></div>
            <div class="lightbox-counter">1 / 1</div>
          </div>
          <div class="lightbox-hint">Нажмите на фото или клавиши ← → для переключения</div>
        </div>
      `;
      document.body.appendChild(lightbox);

      const closeBtn = lightbox.querySelector('.lightbox-close');
      const prevBtn = lightbox.querySelector('.lightbox-prev');
      const nextBtn = lightbox.querySelector('.lightbox-next');
      const imgBox = lightbox.querySelector('.lightbox-img-box');

      const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      };

      const showImage = (index) => {
        if (!currentGalleryItems.length) return;
        currentGalleryIndex = (index + currentGalleryItems.length) % currentGalleryItems.length;
        const item = currentGalleryItems[currentGalleryIndex];
        const imgEl = lightbox.querySelector('.lightbox-img');
        const captionEl = lightbox.querySelector('.lightbox-caption');
        const counterEl = lightbox.querySelector('.lightbox-counter');

        imgEl.style.opacity = '0.35';
        setTimeout(() => {
          imgEl.src = item.src;
          imgEl.alt = item.caption || item.alt || '';
          captionEl.textContent = item.caption || item.alt || '';
          counterEl.textContent = `${currentGalleryIndex + 1} / ${currentGalleryItems.length}`;
          imgEl.style.opacity = '1';
        }, 70);
      };

      const nextImage = () => {
        showImage(currentGalleryIndex + 1);
      };

      const prevImage = () => {
        showImage(currentGalleryIndex - 1);
      };

      // Click on photo directly advances to next image
      imgBox.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextImage();
      });

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevImage();
      });

      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prevImage();
        }
      });

      // Swipe navigation for touch screens
      let touchStartX = 0;
      lightbox.addEventListener('touchstart', (e) => {
        if (e.touches.length) touchStartX = e.touches[0].pageX;
      }, { passive: true });

      lightbox.addEventListener('touchend', (e) => {
        if (!e.changedTouches.length) return;
        const diffX = e.changedTouches[0].pageX - touchStartX;
        if (diffX < -40) {
          nextImage();
        } else if (diffX > 40) {
          prevImage();
        }
      });
    }
    return lightbox;
  };

  const openLightboxWithCollection = (items, startIndex = 0) => {
    if (!items || !items.length) return;
    currentGalleryItems = items;
    currentGalleryIndex = startIndex;
    const modal = createLightbox();
    const item = currentGalleryItems[currentGalleryIndex];
    const imgEl = modal.querySelector('.lightbox-img');
    const captionEl = modal.querySelector('.lightbox-caption');
    const counterEl = modal.querySelector('.lightbox-counter');

    imgEl.src = item.src;
    imgEl.alt = item.caption || item.alt || '';
    captionEl.textContent = item.caption || item.alt || '';
    counterEl.textContent = `${currentGalleryIndex + 1} / ${currentGalleryItems.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Attach click handler to zoom review cards, certificate cards, speaking cards, and gallery items
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.review-slide-card, .cert-slide-card, .speaking-slide-card, .gallery-item');
    if (card) {
      const container = card.closest('.speaking-track, .certs-track, .reviews-track, .speaking-gallery') || document.body;
      const allCards = Array.from(container.querySelectorAll('.review-slide-card, .cert-slide-card, .speaking-slide-card, .gallery-item'));
      
      // Filter out duplicate cloned items to have a clean gallery sequence
      const uniqueItems = [];
      const seenSources = new Set();
      
      allCards.forEach((c) => {
        const img = c.querySelector('img');
        if (img && img.src && !seenSources.has(img.src)) {
          seenSources.add(img.src);
          const captionEl = c.querySelector('.speaking-slide-caption, .cert-slide-caption, .gallery-caption');
          const tagEl = c.querySelector('.speaking-slide-tag, .gallery-tag');
          let fullCaption = '';
          if (tagEl && captionEl) {
            fullCaption = `[${tagEl.textContent.trim()}] ${captionEl.textContent.trim()}`;
          } else if (captionEl) {
            fullCaption = captionEl.textContent.trim();
          } else {
            fullCaption = img.alt || '';
          }
          uniqueItems.push({
            src: img.src,
            alt: img.alt || '',
            caption: fullCaption
          });
        }
      });

      const clickedImg = card.querySelector('img');
      const clickedSrc = clickedImg ? clickedImg.src : '';
      let initialIdx = uniqueItems.findIndex((it) => it.src === clickedSrc);
      if (initialIdx === -1) initialIdx = 0;

      openLightboxWithCollection(uniqueItems, initialIdx);
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // SMOOTH SCROLL REVEAL & HERO ENTRANCE ENGINE (DESKTOP ONLY)
  // ══════════════════════════════════════════════════════════════════
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  // 1. Hero Entrance Animation on Load (Desktop only)
  const heroSection = document.querySelector('.hero');
  if (heroSection && !prefersReduced && !isMobile) {
    heroSection.classList.add('hero-animated');
  }

  // 2. Scroll Reveal Observer for Blocks, Text & Grids (Desktop only)
  if (!prefersReduced && !isMobile && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -20px 0px',
      threshold: 0.02
    });

    // Elements to reveal smoothly
    const singleElements = document.querySelectorAll(
      '.section-tag, .section-title, .section-sub, .project-card, .direct-contact-card, .form-left, .calendar-direct-card, .calendar-embed-wrapper, .author-intro-grid, .faq-item'
    );
    singleElements.forEach(el => {
      if (!el.closest('.hero')) {
        el.classList.add('reveal-init');
        revealObserver.observe(el);
      }
    });

    // Grids for staggered card reveals
    const staggerGroups = document.querySelectorAll(
      '.grid-3, .grid-2, .grid-4, .price-grid, .logos-grid, .speaking-gallery'
    );
    staggerGroups.forEach(group => {
      if (!group.closest('.hero')) {
        group.classList.add('stagger-group');
        revealObserver.observe(group);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // DYNAMIC DESKTOP SECTION SCROLLSPY & DYNAMIC LOGO BADGE
  // ══════════════════════════════════════════════════════════════════
  function initPageScrollspy() {
    const rawSections = Array.from(document.querySelectorAll('section[id], header[id]')).filter(sec => {
      return sec.id && !sec.classList.contains('mobile-menu') && sec.offsetHeight > 100;
    });

    if (rawSections.length < 2) return;

    let nav = document.querySelector('.page-scrollspy');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'page-scrollspy';
      nav.setAttribute('aria-label', 'Навигация по разделам');
      document.body.appendChild(nav);
    }

    const logoBadge = document.querySelector('.nav-logo-badge');
    const defaultBadgeText = logoBadge ? logoBadge.textContent.trim() : '';

    const ul = document.createElement('ul');
    ul.className = 'scrollspy-list';

    const items = rawSections.map((sec, idx) => {
      const id = sec.id;
      const num = String(idx + 1).padStart(2, '0');
      let title = sec.dataset.navTitle;
      if (!title) {
        const tag = sec.querySelector('.section-tag, .hero-tag');
        const h = sec.querySelector('h1, h2, .form-title, .hero-title');
        title = tag ? tag.textContent.replace('//', '').trim() : (h ? h.textContent.trim().split(' ')[0] : `Раздел ${num}`);
      }
      if (title.length > 22) title = title.substring(0, 20) + '...';

      const li = document.createElement('li');
      li.className = `scrollspy-item ${idx === 0 ? 'active' : ''}`;
      li.innerHTML = `
        <a href="#${id}" class="scrollspy-link" data-id="${id}" title="${title}">
          <span class="scrollspy-label">${title}</span>
          <span class="scrollspy-num">${num}</span>
          <span class="scrollspy-dot"></span>
        </a>
      `;
      ul.appendChild(li);
      return { el: sec, id, li, title };
    });

    nav.innerHTML = '';
    nav.appendChild(ul);

    // Smooth scroll on click
    ul.addEventListener('click', (e) => {
      const link = e.target.closest('.scrollspy-link');
      if (link) {
        e.preventDefault();
        const targetId = link.dataset.id;
        const targetSec = document.getElementById(targetId);
        if (targetSec) {
          const headerOffset = 72;
          const elementPosition = targetSec.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });

    // Rock-solid Scrollspy Position Calculator (60 FPS)
    let isTicking = false;

    function updateActiveSection() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      let activeIndex = 0;

      // If scrolled to the very bottom (within 80px), activate last section
      if (scrollY + viewportHeight >= docHeight - 80) {
        activeIndex = items.length - 1;
      } else {
        // Find the section closest to the top of viewport (offset by header height)
        const triggerPoint = scrollY + 120;
        for (let i = 0; i < items.length; i++) {
          const sec = items[i].el;
          const top = sec.offsetTop;
          const height = sec.offsetHeight;
          if (triggerPoint >= top && triggerPoint < top + height) {
            activeIndex = i;
            break;
          } else if (triggerPoint >= top) {
            activeIndex = i;
          }
        }
      }

      const activeItem = items[activeIndex];
      if (activeItem) {
        items.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.li.classList.add('active');
          } else {
            item.li.classList.remove('active');
          }
        });

        // Theme adaptation (on-dark when over dark section/footer)
        const activeSec = activeItem.el;
        const isDark = activeSec.classList.contains('form-section') || 
                       activeSec.id === 'contact' ||
                       activeSec.classList.contains('dark-section') ||
                       activeSec.getAttribute('data-theme') === 'dark';
        if (isDark) {
          nav.classList.add('on-dark');
        } else {
          nav.classList.remove('on-dark');
        }

        // Dynamic logo badge update
        if (logoBadge) {
          if (activeIndex === 0) {
            logoBadge.textContent = defaultBadgeText;
          } else {
            logoBadge.textContent = activeItem.title.toUpperCase();
          }
        }
      }

      isTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateActiveSection);
        isTicking = true;
      }
    }, { passive: true });

    // Initial check on load
    updateActiveSection();
  }

  initPageScrollspy();
});

// ══════════════════════════════════════════════════════════════════
// UNIVERSAL INTERACTIVE ROADMAP & ACCORDION ENGINES
// ══════════════════════════════════════════════════════════════════
function initUniversalEngines() {
  // 1. Roadmap Interactive Pipeline
  const roadmapContainers = document.querySelectorAll('.roadmap-flow-wrapper');
  roadmapContainers.forEach(container => {
    const pipelineItems = container.querySelectorAll('.pipeline-item');
    const roadmapCards = container.querySelectorAll('.roadmap-card');

    function setActiveStep(stepNum) {
      pipelineItems.forEach(item => {
        if (item.getAttribute('data-step-target') === stepNum) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      roadmapCards.forEach(card => {
        if (card.getAttribute('data-step-id') === stepNum) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }

    pipelineItems.forEach(item => {
      item.addEventListener('click', () => {
        const step = item.getAttribute('data-step-target');
        setActiveStep(step);
      });
    });

    roadmapCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const step = card.getAttribute('data-step-id');
        setActiveStep(step);
      });
      card.addEventListener('click', () => {
        const step = card.getAttribute('data-step-id');
        setActiveStep(step);
      });
    });
  });

  // 2. Smooth FAQ Accordion (Global Delegation)
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.faq-toggle');
    if (!toggleBtn) return;
    const item = toggleBtn.closest('.faq-item');
    if (item) {
      item.classList.toggle('active');
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// YANDEX METRIKA ENTERPRISE EVENT & GOAL TRACKER (Counter: 101414837)
// ══════════════════════════════════════════════════════════════════
const METRIKA_COUNTER_ID = 101414837;

/**
 * Universal Event Tracker for Yandex Metrika
 * @param {string} goalName - JavaScript Goal Identifier
 * @param {object} customParams - Detailed metadata about the action
 */
function trackMetrikaEvent(goalName, customParams = {}) {
  try {
    const pagePath = window.location.pathname || '/';
    const pageTitle = document.title || '';
    const payload = {
      page: pagePath,
      page_title: pageTitle,
      timestamp: new Date().toISOString(),
      ...customParams
    };

    if (typeof window.ym === 'function') {
      // 1. Trigger JavaScript Goal in Yandex Metrika
      window.ym(METRIKA_COUNTER_ID, 'reachGoal', goalName, payload);

      // 2. Transmit hierarchical visit parameters for analytics drilldown
      window.ym(METRIKA_COUNTER_ID, 'params', {
        clicks_by_page: {
          [pagePath]: {
            [goalName]: payload.button_text || payload.action || 'click'
          }
        },
        actions_log: {
          [goalName]: {
            page: pagePath,
            section: payload.section || 'global',
            text: payload.button_text || 'no_text',
            href: payload.href || 'no_href'
          }
        }
      });
    }

    if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
      console.log(`[YM Metrika ${METRIKA_COUNTER_ID}] Goal: ${goalName}`, payload);
    }
  } catch (err) {
    console.warn('[YM Metrika Error]', err);
  }
}

// Global click delegation for all buttons, links, and interactive triggers
function initUniversalAnalytics() {
  document.addEventListener('click', (e) => {
    const clickable = e.target.closest('a, button, .copy-chip, .btn-primary, .btn-secondary, .btn-guide, .nav-cta, .m-cta, .prompt-code-btn, .prompt-card-expand, .filter-chip, .prompts-tag-chip, .scrollspy-link, .faq-q, .faq-toggle');
    if (!clickable) return;

    const href = clickable.getAttribute('href') || '';
    const btnText = (clickable.innerText || clickable.textContent || '').replace(/\s+/g, ' ').trim().substring(0, 60);
    const btnId = clickable.id || '';
    const btnClass = clickable.className || '';
    const parentSection = clickable.closest('section[id], section[data-nav-title], header, footer');
    const sectionTitle = parentSection ? (parentSection.getAttribute('data-nav-title') || parentSection.id || parentSection.tagName.toLowerCase()) : 'global';

    let goal = 'btn_click';
    let actionCategory = 'general';

    // 1. Messenger / Telegram Goals
    if (href.includes('t.me/') || href.includes('telegram.me')) {
      goal = 'telegram_click';
      actionCategory = 'messenger';
    } else if (href.includes('max.ru/')) {
      goal = 'max_messenger_click';
      actionCategory = 'messenger';
    }
    // 2. Booking / Calendar CTA
    else if (href.includes('/booking') || btnText.includes('Забронировать') || btnClass.includes('nav-cta') || btnClass.includes('m-cta')) {
      goal = 'booking_slot_click';
      actionCategory = 'conversion_cta';
    }
    // 3. Copy action (prompts, addresses, links)
    else if (btnClass.includes('copy-chip') || btnClass.includes('prompt-code-btn') || btnText.includes('Скопировать') || btnText.includes('Копировать')) {
      goal = 'copy_action';
      actionCategory = 'user_utility';
    }
    // 4. Interactive address generator
    else if (btnId === 'btn-random-address' || btnText.includes('Сгенерировать адрес')) {
      goal = 'address_generator_click';
      actionCategory = 'interactive_tool';
    }
    // 5. Prompt expand / collapse
    else if (btnClass.includes('prompt-card-expand') || btnText.includes('Развернуть') || btnText.includes('Свернуть')) {
      goal = 'prompt_expand_click';
      actionCategory = 'content_interaction';
    }
    // 6. Category filters (glossary, prompts)
    else if (btnClass.includes('filter-chip') || btnClass.includes('prompts-tag-chip')) {
      goal = 'category_filter_click';
      actionCategory = 'navigation_filter';
    }
    // 7. Right Scrollspy navigation
    else if (btnClass.includes('scrollspy-link') || clickable.closest('.scrollspy-link')) {
      goal = 'scrollspy_nav_click';
      actionCategory = 'scrollspy';
    }
    // 8. FAQ Accordion toggle
    else if (btnClass.includes('faq-q') || btnClass.includes('faq-toggle') || clickable.closest('.faq-item')) {
      goal = 'faq_accordion_click';
      actionCategory = 'faq';
    }
    // 9. External link outbound
    else if (href.startsWith('http') && !href.includes('a-sage.ru') && !href.includes('localhost')) {
      goal = 'external_link_click';
      actionCategory = 'outbound';
    }
    // 10. General Primary / Secondary Action Button
    else if (btnClass.includes('btn-primary') || btnClass.includes('btn-guide-primary')) {
      goal = 'primary_cta_click';
      actionCategory = 'conversion_cta';
    } else if (btnClass.includes('btn-secondary') || btnClass.includes('btn-guide-outline')) {
      goal = 'secondary_action_click';
      actionCategory = 'navigation_cta';
    }

    trackMetrikaEvent(goal, {
      action_category: actionCategory,
      button_text: btnText,
      button_id: btnId,
      href: href || undefined,
      section: sectionTitle
    });
  }, { passive: true });
}

// Universal Interactive Guide Modals (Camera Angles & Lighting Schemes)
function openAnglesGuideModal() {
  const existing = document.getElementById('guide-angles-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'guide-angles-modal';
  modal.className = 'guide-modal-overlay';
  modal.onclick = (e) => { if (e.target === modal) closeGuideModal('guide-angles-modal'); };

  modal.innerHTML = `
    <div class="guide-modal-content">
      <div class="guide-modal-header">
        <h3>📸 Полный гид по ракурсам (20 схем)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-angles-modal')" aria-label="Закрыть">✕</button>
      </div>
      <div class="guide-modal-body">
        <div style="font-family:var(--mono, monospace); font-size:0.8rem; font-weight:700; color:var(--gray, #71717a); margin-bottom:12px;">// 1. ГОРИЗОНТАЛЬНЫЕ РАКУРСЫ (ПОВОРОТ ОБЪЕКТА)</div>
        
        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Анфас (Full Face) — Прямой взгляд, идеальная симметрия</strong>
            <div class="guide-prompt-code">front view, looking at camera, symmetrical face</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('front view, looking at camera, symmetrical face', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Три четверти (3/4 View) — Поворот на 45°, объем и глубина</strong>
            <div class="guide-prompt-code">three-quarter view, 45 degree turn, depth of field</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('three-quarter view, 45 degree turn, depth of field', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Профиль (Profile) — Строго боком, акцент на силуэте</strong>
            <div class="guide-prompt-code">side view, profile shot, silhouette focus</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('side view, profile shot, silhouette focus', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Полуанфас (Semi-profile) — Между 3/4 и профилем, скулы</strong>
            <div class="guide-prompt-code">semi-profile, subtle head turn, highlighting cheekbones</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('semi-profile, subtle head turn, highlighting cheekbones', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Со спины (Back View) — Загадочность и эффект присутствия</strong>
            <div class="guide-prompt-code">view from behind, back to camera, mysterious mood</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('view from behind, back to camera, mysterious mood', this)">Копировать</button>
        </div>

        <div style="font-family:var(--mono, monospace); font-size:0.8rem; font-weight:700; color:var(--gray, #71717a); margin:20px 0 12px 0;">// 2. ВЕРТИКАЛЬНЫЕ РАКУРСЫ (ТОЧКА СЪЕМКИ)</div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Уровень глаз (Eye Level) — Нейтрально и естественно</strong>
            <div class="guide-prompt-code">eye-level shot, natural perspective, direct gaze</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('eye-level shot, natural perspective, direct gaze', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Нижний ракурс (Low Angle) — Властный, монументальный ракурс снизу</strong>
            <div class="guide-prompt-code">low angle shot, looking up at person, heroic perspective</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('low angle shot, looking up at person, heroic perspective', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Верхний ракурс (High Angle) — Взгляд сверху, уязвимость</strong>
            <div class="guide-prompt-code">high angle shot, looking down at subject, emotional vulnerability</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('high angle shot, looking down at subject, emotional vulnerability', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Птичий полет (Bird's Eye) — Вид строго сверху (Top-down)</strong>
            <div class="guide-prompt-code">bird's eye view, top-down perspective, high altitude shot</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('bird\\'s eye view, top-down perspective, high altitude shot', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Лягушачий ракурс (Worm's Eye) — Экстремальный ракурс от самой земли</strong>
            <div class="guide-prompt-code">worm's eye view, ground level photography, extreme perspective</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('worm\\'s eye view, ground level photography, extreme perspective', this)">Копировать</button>
        </div>

        <div style="font-family:var(--mono, monospace); font-size:0.8rem; font-weight:700; color:var(--gray, #71717a); margin:20px 0 12px 0;">// 3. КРЕАТИВ & КИНЕМАТОГРАФИЧНОСТЬ</div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Голландский угол (Dutch Angle) — Заваленный горизонт, динамика</strong>
            <div class="guide-prompt-code">dutch angle shot, tilted horizon, cinematic tension</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('dutch angle shot, tilted horizon, cinematic tension', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Субъективный ракурс (POV) — Вид от первого лица</strong>
            <div class="guide-prompt-code">first person point of view, POV shot, immersive perspective</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('first person point of view, POV shot, immersive perspective', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Овершолдер (Over-the-shoulder) — Взгляд через плечо собеседника</strong>
            <div class="guide-prompt-code">over-the-shoulder shot, conversation framing, blurred foreground shoulder</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('over-the-shoulder shot, conversation framing, blurred foreground shoulder', this)">Копировать</button>
        </div>

        <div class="guide-item-row">
          <div class="guide-item-info">
            <strong>Макро (Macro) — Сверхкрупный план детали</strong>
            <div class="guide-prompt-code">extreme close-up, macro shot of an eye, hyper-detailed texture</div>
          </div>
          <button class="guide-copy-btn" onclick="copyGuidePrompt('extreme close-up, macro shot of an eye, hyper-detailed texture', this)">Копировать</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openLightingGuideModal() {
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
    <div class="guide-item-row">
      <div class="guide-item-info">
        <strong>${s.name} — ${s.desc}</strong>
        <div class="guide-prompt-code">${s.prompt}</div>
      </div>
      <button class="guide-copy-btn" onclick="copyGuidePrompt('${s.prompt.replace(/'/g, "\\'")}', this)">Копировать</button>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="guide-modal-content">
      <div class="guide-modal-header">
        <h3>💡 Шпаргалка по свету (20 схем освещения)</h3>
        <button class="guide-modal-close-btn" onclick="closeGuideModal('guide-lighting-modal')" aria-label="Закрыть">✕</button>
      </div>
      <div class="guide-modal-body">
        <div style="font-family:var(--mono, monospace); font-size:0.8rem; font-weight:700; color:var(--gray, #71717a); margin-bottom:12px;">// 20 КИНЕМАТОГРАФИЧЕСКИХ СХЕМ СВЕТА ДЛЯ MIDJOURNEY, FLUX & DALL-E</div>
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
  if (navigator.clipboard) {
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

// Global exports
window.openAnglesGuideModal = openAnglesGuideModal;
window.openLightingGuideModal = openLightingGuideModal;
window.closeGuideModal = closeGuideModal;
window.copyGuidePrompt = copyGuidePrompt;

// Export to window for explicit programmatic triggers
window.trackMetrikaEvent = trackMetrikaEvent;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initUniversalEngines();
    initUniversalAnalytics();
  });
} else {
  initUniversalEngines();
  initUniversalAnalytics();
}