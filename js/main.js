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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUniversalEngines);
} else {
  initUniversalEngines();
}