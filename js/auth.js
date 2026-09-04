/**
 * Mikhail Puzyrev Platform - Telegram Auth & User Session Engine
 * Connected with Supabase DB (wbmzcytpzqvjezhkilaa)
 */

const SUPABASE_URL = 'https://wbmzcytpzqvjezhkilaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibXpjeXRwenF2amV6aGtpbGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM0NjEsImV4cCI6MjA5Mzc1OTQ2MX0.a2grUbSZudE5oklTjZidebDQxGNNy9Cit0CWwBSRJfA';

const Auth = {
  // 1. Get current logged-in user from localStorage
  getUser() {
    try {
      const stored = localStorage.getItem('asage_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  // 2. Handle Telegram Login Callback
  async handleTelegramAuth(tgUser) {
    if (!tgUser || !tgUser.id) return null;

    try {
      // Upsert user into Supabase platform_users
      const payload = {
        telegram_id: tgUser.id,
        first_name: tgUser.first_name || '',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        last_login_at: new Date().toISOString()
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });

      let dbUser = null;
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          dbUser = data[0];
        }
      }

      const sessionUser = {
        id: dbUser ? dbUser.id : 'tg_' + tgUser.id,
        telegram_id: tgUser.id,
        first_name: (dbUser && dbUser.first_name) ? dbUser.first_name : (tgUser.first_name || 'Гость'),
        last_name: (dbUser && dbUser.last_name !== undefined) ? dbUser.last_name : (tgUser.last_name || ''),
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        email: dbUser && dbUser.email ? dbUser.email : '',
        bio: dbUser && dbUser.bio ? dbUser.bio : '',
        channel_url: dbUser && dbUser.channel_url ? dbUser.channel_url : '',
        website_url: dbUser && dbUser.website_url ? dbUser.website_url : '',
        is_private: dbUser ? Boolean(dbUser.is_private) : false,
        role: dbUser ? dbUser.role : 'member',
        auth_date: tgUser.auth_date
      };

      localStorage.setItem('asage_user', JSON.stringify(sessionUser));
      
      // Close modal if open
      this.closeModal();

      // Trigger event
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: sessionUser }));
      
      // Track analytics
      if (typeof window.trackMetrikaEvent === 'function') {
        window.trackMetrikaEvent('telegram_login_success', {
          telegram_id: tgUser.id,
          username: tgUser.username || 'no_username'
        });
      }

      // If user is on a page other than cabinet/profile and logs in, redirect to cabinet or update UI
      if (!window.location.pathname.includes('cabinet') && !window.location.pathname.includes('profile')) {
        window.location.href = '/cabinet';
      } else {
        window.location.reload();
      }

      return sessionUser;
    } catch (err) {
      console.warn('[Auth Error]', err);
      const fallbackUser = {
        id: 'tg_' + tgUser.id,
        telegram_id: tgUser.id,
        first_name: tgUser.first_name || 'Пользователь',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        email: '',
        bio: '',
        channel_url: '',
        website_url: '',
        is_private: false,
        role: 'member'
      };
      localStorage.setItem('asage_user', JSON.stringify(fallbackUser));
      this.closeModal();
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: fallbackUser }));
      if (!window.location.pathname.includes('cabinet') && !window.location.pathname.includes('profile')) {
        window.location.href = '/cabinet';
      }
      return fallbackUser;
    }
  },

  // 3. Update User Profile in Supabase & LocalStorage
  async updateUserProfile(profileData) {
    const user = this.getUser();
    if (!user || !user.telegram_id) {
      this.showToast('Ошибка: Пользователь не авторизован', 'error');
      return { success: false, error: 'Пользователь не авторизован' };
    }

    try {
      const isPrivateVal = profileData.is_private !== undefined ? Boolean(profileData.is_private) : Boolean(user.is_private);
      const payload = {
        telegram_id: user.telegram_id,
        first_name: profileData.first_name !== undefined ? profileData.first_name.trim() : user.first_name,
        last_name: profileData.last_name !== undefined ? profileData.last_name.trim() : (user.last_name || ''),
        username: user.username || '',
        photo_url: user.photo_url || '',
        email: profileData.email !== undefined ? profileData.email.trim() : (user.email || ''),
        bio: profileData.bio !== undefined ? profileData.bio.trim() : (user.bio || ''),
        channel_url: profileData.channel_url !== undefined ? profileData.channel_url.trim() : (user.channel_url || ''),
        website_url: profileData.website_url !== undefined ? profileData.website_url.trim() : (user.website_url || ''),
        is_private: isPrivateVal,
        updated_at: new Date().toISOString()
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });

      let dbUser = null;
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) dbUser = data[0];
      }

      const updatedSessionUser = {
        ...user,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        bio: payload.bio,
        channel_url: payload.channel_url,
        website_url: payload.website_url,
        is_private: payload.is_private,
        id: dbUser ? dbUser.id : user.id,
        role: dbUser ? dbUser.role : user.role
      };

      localStorage.setItem('asage_user', JSON.stringify(updatedSessionUser));
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: updatedSessionUser }));
      
      this.showToast('Данные профиля успешно сохранены', 'success');

      if (typeof window.trackMetrikaEvent === 'function') {
        window.trackMetrikaEvent('profile_update_success', {
          telegram_id: user.telegram_id,
          has_email: !!payload.email,
          has_bio: !!payload.bio,
          is_private: payload.is_private
        });
      }

      return { success: true, user: updatedSessionUser };
    } catch (err) {
      console.warn('[Update Profile Warning]', err);
      const fallbackUser = {
        ...user,
        ...profileData
      };
      localStorage.setItem('asage_user', JSON.stringify(fallbackUser));
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: fallbackUser }));
      this.showToast('Данные сохранены локально', 'success');
      return { success: true, user: fallbackUser };
    }
  },

  // 4. Fetch fresh profile data from Supabase
  async fetchFreshUserProfile() {
    const user = this.getUser();
    if (!user || !user.telegram_id) return null;

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_users?telegram_id=eq.${user.telegram_id}`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const dbUser = data[0];
          const freshUser = {
            ...user,
            first_name: dbUser.first_name || user.first_name,
            last_name: dbUser.last_name !== undefined ? dbUser.last_name : user.last_name,
            username: dbUser.username || user.username,
            photo_url: dbUser.photo_url || user.photo_url,
            role: dbUser.role || user.role,
            email: dbUser.email || '',
            bio: dbUser.bio || '',
            channel_url: dbUser.channel_url || '',
            website_url: dbUser.website_url || '',
            is_private: dbUser.is_private !== undefined ? Boolean(dbUser.is_private) : false,
            id: dbUser.id || user.id
          };
          localStorage.setItem('asage_user', JSON.stringify(freshUser));
          window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: freshUser }));
          return freshUser;
        }
      }
    } catch (e) {
      console.warn('[Fetch Profile Warning]', e);
    }
    return user;
  },

  // 5. Check if user has Club / Mentorship Access (SAGE Neuro Family resident or 1-on-1 student)
  hasClubAccess() {
    const user = this.getUser();
    if (!user) return false;
    const tgId = Number(user.telegram_id || 0);
    const uname = (user.username || '').toLowerCase();
    // Mikhail Sage is platform founder and has full access
    if (uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911) {
      return true;
    }
    // Resident of SAGE Neuro Family chat or Student of Mentorship
    if (user.role === 'club_member' || user.role === 'student') {
      return true;
    }
    return false;
  },

  // 6. Initial / Demo Members Directory (SAGE Neuro Family Residents & Students)
  getInitialMembers() {
    return [
      {
        id: 'founder-sage',
        telegram_id: 439634804,
        first_name: 'Михаил',
        last_name: 'Пузырёв',
        username: 'Michael_Sage',
        photo_url: 'https://a-sage.ru/img/mikhail_about.jpg',
        role: 'club_member',
        bio: 'Основатель платформы, AI-архитектор & инженер-разработчик. Создаю автономные агентные системы и обучаю Vibe Coding.',
        channel_url: '@uncrn_sage',
        website_url: 'https://a-sage.ru',
        is_private: false
      },
      {
        id: 'member-2',
        telegram_id: 1002,
        first_name: 'Александр',
        last_name: 'Власов',
        username: 'vlasov_ai',
        photo_url: '',
        role: 'club_member',
        bio: 'Product Lead в EdTech. Резидент SAGE Neuro Family. Внедряю AI-пайплайны автоматизации и кастомные LLM-агенты.',
        channel_url: '@vlasov_tech',
        website_url: '',
        is_private: false
      },
      {
        id: 'member-3',
        telegram_id: 1003,
        first_name: 'Елена',
        last_name: 'Романова',
        username: 'elena_romanova_design',
        photo_url: '',
        role: 'student',
        bio: 'Senior UX/UI Designer. Ученик наставничества 1-на-1 по Vibe Coding и разработке AI-интерфейсов.',
        channel_url: '@design_romanova',
        website_url: '',
        is_private: false
      },
      {
        id: 'member-4',
        telegram_id: 1004,
        first_name: 'Дмитрий',
        last_name: 'Ковалёв',
        username: 'dk_engineer',
        photo_url: '',
        role: 'club_member',
        bio: 'Fullstack разработчик (Node / Python / React). Резидент SAGE Neuro Family. Создаю Telegram Mini Apps.',
        channel_url: '',
        website_url: '',
        is_private: false
      }
    ];
  },

  // 7. Fetch Public Members Directory from Supabase + Strict Deduplication
  async fetchMembersDirectory() {
    let list = [];
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_users?select=id,telegram_id,first_name,last_name,username,photo_url,role,bio,channel_url,website_url,is_private,last_login_at&order=last_login_at.desc.nullslast&limit=80`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          list = users.filter(u => u.is_private !== true);
        }
      }
    } catch (e) {
      console.warn('[Fetch Members Error]', e);
    }

    if (!list || list.length === 0) {
      list = this.getInitialMembers();
    }

    // Merge current logged-in user if available
    const currentUser = this.getUser();
    if (currentUser && currentUser.telegram_id) {
      const isMikhail = (currentUser.username && currentUser.username.toLowerCase() === 'michael_sage') ||
                        currentUser.telegram_id == 439634804 ||
                        currentUser.telegram_id == 88472911;

      const userRole = isMikhail ? 'club_member' : (currentUser.role || 'member');
      const normalizedUser = { ...currentUser, role: userRole };

      // Only add to club directory if resident or student and not private
      if (!normalizedUser.is_private && (normalizedUser.role === 'club_member' || normalizedUser.role === 'student')) {
        // Check existing index
        const idx = list.findIndex(m => {
          if (m.telegram_id && m.telegram_id == normalizedUser.telegram_id) return true;
          if (m.username && normalizedUser.username && m.username.toLowerCase() === normalizedUser.username.toLowerCase()) return true;
          if (isMikhail && (m.username === 'Michael_Sage' || m.telegram_id == 439634804 || m.telegram_id == 88472911)) return true;
          return false;
        });

        if (idx !== -1) {
          list[idx] = { ...list[idx], ...normalizedUser };
        } else {
          list.unshift(normalizedUser);
        }
      } else {
        // If private or regular member without club, remove from catalog
        const idx = list.findIndex(m => {
          if (m.telegram_id && m.telegram_id == normalizedUser.telegram_id) return true;
          if (m.username && normalizedUser.username && m.username.toLowerCase() === normalizedUser.username.toLowerCase()) return true;
          if (isMikhail && (m.username === 'Michael_Sage' || m.telegram_id == 439634804 || m.telegram_id == 88472911)) return true;
          return false;
        });
        if (idx !== -1) list.splice(idx, 1);
      }
    }

    // Filter list: only keep club_member and student (residents of SAGE Neuro Family chat & students)
    const validRoles = ['club_member', 'student'];
    list = list.filter(m => validRoles.includes(m.role) && m.is_private !== true);

    // Strict Deduplication Pass
    const seenMap = new Map();
    const result = [];
    for (const item of list) {
      const uname = (item.username || '').toLowerCase();
      const tgId = item.telegram_id ? String(item.telegram_id) : '';
      const isMikhail = uname === 'michael_sage' || tgId === '439634804' || tgId === '88472911';

      const dedupKey = isMikhail ? 'founder_mikhail_sage' : (uname ? 'u:' + uname : 'id:' + tgId);
      if (!seenMap.has(dedupKey)) {
        seenMap.set(dedupKey, true);
        result.push(item);
      }
    }

    return result;
  },

  // 5. Toast Notification System
  showToast(message, type = 'info') {
    let toast = document.getElementById('asage-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'asage-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        background: #09090b;
        color: #ffffff;
        padding: 12px 20px;
        font-family: var(--mono, monospace);
        font-size: 0.85rem;
        font-weight: 600;
        border: 1px solid #27272a;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    const accentColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4';
    
    toast.innerHTML = `<span style="color:${accentColor}; font-weight:800;">${icon}</span> <span>${message}</span>`;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3500);
  },

  // 6. Logout
  logout() {
    localStorage.removeItem('asage_user');
    window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: null }));
    if (window.location.pathname.includes('cabinet') || window.location.pathname.includes('profile')) {
      window.location.reload();
    } else {
      this.updateHeaderUI();
    }
  },

  // 7. Modal Popup Management
  openModal(customMessage = null, customTitle = null) {
    const user = this.getUser();

    let modal = document.getElementById('asage-auth-modal');
    if (!modal) {
      this.injectModal();
      modal = document.getElementById('asage-auth-modal');
    }

    if (modal) {
      const tagElem = modal.querySelector('#auth-modal-tag');
      const titleElem = modal.querySelector('#auth-modal-title');
      const descElem = modal.querySelector('#auth-modal-desc');
      const noticeElem = modal.querySelector('#auth-modal-notice');

      if (customMessage) {
        if (tagElem) tagElem.innerText = '// ТОЛЬКО ДЛЯ РЕЗИДЕНТОВ КЛУБА В ЛК';
        if (titleElem) titleElem.innerText = customTitle || 'Материал Базы Знаний';
        if (descElem) descElem.innerHTML = 'Зарегистрируйтесь или войдите в личный кабинет через Telegram, чтобы получить доступ к закрытым инженерным гайдам и сценариям.';
        if (noticeElem) {
          noticeElem.innerHTML = `🔒 ${customMessage}`;
          noticeElem.style.display = 'block';
        }
      } else {
        if (tagElem) tagElem.innerText = '// АВТОРИЗАЦИЯ & РЕГИСТРАЦИЯ';
        if (titleElem) titleElem.innerText = 'Вход в Личный Кабинет';
        if (descElem) descElem.innerHTML = 'Быстрый доступ к Базе Знаний, практическим урокам и Закрытому Клубу.';
        if (noticeElem) noticeElem.style.display = 'none';
      }

      // If user is already logged in
      if (user) {
        if (!this.hasClubAccess() && customMessage) {
          if (noticeElem) {
            noticeElem.innerHTML = `🔒 <strong>Материал доступен только резидентам Закрытого Клуба.</strong><br><span style="display:inline-block; margin-top:6px; color:#52525b; font-size:0.8rem;">Вы авторизованы как ${user.first_name || 'пользователь'}, но для доступа к этому гайду требуется статус резидента SAGE Neuro Family.</span><div style="margin-top:12px;"><a href="/cabinet?tab=club" class="btn-primary" style="display:inline-block; padding:8px 16px; font-size:0.8rem; background:#09090b; color:#fff; text-decoration:none;">Оформить доступ в Клуб ↗</a></div>`;
            noticeElem.style.display = 'block';
          }
        } else {
          window.location.href = '/cabinet';
          return;
        }
      }

      // Ensure Telegram widget script is injected and executed
      const widgetBox = modal.querySelector('.auth-modal-widget-box');
      if (widgetBox && !widgetBox.querySelector('script') && !widgetBox.querySelector('iframe')) {
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'Michaelsage_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '0');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;
        widgetBox.appendChild(script);
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (typeof window.trackMetrikaEvent === 'function') {
        window.trackMetrikaEvent('open_auth_modal', { custom_message: !!customMessage });
      }
    }
  },

  openResidentGuide(guideUrl, guideTitle = '') {
    if (this.hasClubAccess()) {
      window.location.href = guideUrl;
    } else {
      this.openModal(
        'Данный гайд доступен только в личном кабинете для резидентов клуба.',
        'Доступен только в личном кабинете'
      );
    }
  },

  closeModal() {
    const modal = document.getElementById('asage-auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  injectModal() {
    if (document.getElementById('asage-auth-modal')) return;

    const modalHtml = `
      <div id="asage-auth-modal" class="auth-modal-overlay" onclick="if(event.target === this) Auth.closeModal()">
        <div class="auth-modal-dialog" style="border-radius:0 !important;">
          <button class="auth-modal-close" onclick="Auth.closeModal()" aria-label="Закрыть" style="border-radius:0 !important;">✕</button>
          
          <div id="auth-modal-tag" style="font-family:var(--mono, monospace); font-size:0.75rem; font-weight:700; color:#71717a; margin-bottom:8px; text-transform:uppercase;">
            // АВТОРИЗАЦИЯ & РЕГИСТРАЦИЯ
          </div>
          
          <h2 id="auth-modal-title" style="font-size:1.5rem; font-weight:800; margin:0 0 8px 0; color:#09090b; letter-spacing:-0.02em;">
            Вход в Личный Кабинет
          </h2>
          
          <p id="auth-modal-desc" style="font-size:0.92rem; color:#71717a; line-height:1.55; margin:0 0 16px 0;">
            Быстрый доступ к Базе Знаний, практическим урокам и Закрытому Клубу.
          </p>

          <div id="auth-modal-notice" style="display:none; background:#fafafa; border:1px solid #09090b; padding:12px 14px; margin-bottom:20px; font-family:var(--mono, monospace); font-size:0.82rem; color:#09090b; line-height:1.5;">
          </div>

          <div class="auth-modal-widget-box" style="display:flex; justify-content:center; align-items:center; min-height:48px; padding:16px 0; background:#f4f4f5; border:1px solid #e4e4e7; margin-bottom:20px; border-radius:0 !important;">
          </div>

          <div style="font-family:var(--mono, monospace); font-size:0.72rem; color:#a1a1aa; line-height:1.5; text-align:center;">
            🔒 Официальная криптографическая авторизация Telegram API.<br>Никаких паролей и спам-рассылок.
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // 5. Favorites Management (Prompts / Glossary / Articles)
  getFavorites() {
    try {
      const stored = localStorage.getItem('asage_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  async toggleFavorite(itemType, itemId, itemTitle, itemMeta = {}) {
    let favorites = this.getFavorites();
    const existingIdx = favorites.findIndex(f => f.item_type === itemType && f.item_id === itemId);
    const user = this.getUser();
    let isAdded = false;

    if (existingIdx >= 0) {
      favorites.splice(existingIdx, 1);
      isAdded = false;
    } else {
      const newItem = {
        id: 'fav_' + Date.now(),
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        item_meta: itemMeta,
        created_at: new Date().toISOString()
      };
      favorites.unshift(newItem);
      isAdded = true;
    }

    localStorage.setItem('asage_favorites', JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('asage_favorites_changed', { detail: favorites }));

    // Sync with Supabase if logged in
    if (user && user.id && !user.id.startsWith('tg_')) {
      try {
        if (isAdded) {
          await fetch(`${SUPABASE_URL}/rest/v1/user_favorites`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              user_id: user.id,
              item_type: itemType,
              item_id: itemId,
              item_title: itemTitle,
              item_meta: itemMeta
            })
          });
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/user_favorites?user_id=eq.${user.id}&item_type=eq.${itemType}&item_id=eq.${itemId}`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          });
        }
      } catch (err) {
        console.warn('[Sync Favorites Error]', err);
      }
    }

    if (typeof window.trackMetrikaEvent === 'function') {
      window.trackMetrikaEvent('toggle_favorite', {
        item_type: itemType,
        item_id: itemId,
        is_added: isAdded
      });
    }

    return isAdded;
  },

  isFavorite(itemType, itemId) {
    const favorites = this.getFavorites();
    return favorites.some(f => f.item_type === itemType && f.item_id === itemId);
  },

  // 6. User Profile Dropdown Menu in Navigation
  toggleUserDropdown(e, btn) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const wrap = btn ? btn.closest('.nav-user-dropdown-wrap') : document.querySelector('.nav-user-dropdown-wrap');
    if (!wrap) return;
    const menu = wrap.querySelector('.nav-user-dropdown-menu');
    const chevron = wrap.querySelector('.nav-dropdown-chevron');
    if (!menu) return;

    const isOpen = menu.classList.contains('show');
    if (isOpen) {
      this.closeUserDropdown();
    } else {
      this.closeUserDropdown();
      menu.classList.add('show');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  },

  closeUserDropdown() {
    document.querySelectorAll('.nav-user-dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
    document.querySelectorAll('.nav-dropdown-chevron').forEach(ch => {
      ch.style.transform = 'rotate(0deg)';
    });
    document.querySelectorAll('#nav-user-profile-trigger').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
    });
  },

  // 7. Update Header Profile Button & Auth Elements
  updateHeaderUI() {
    const user = this.getUser();
    const navRights = document.querySelectorAll('.nav-right');

    navRights.forEach(nr => {
      let dropdownWrap = nr.querySelector('.nav-user-dropdown-wrap');
      let authBtn = nr.querySelector('.nav-auth-btn');
      const burger = nr.querySelector('.nav-burger');

      if (user) {
        if (authBtn && !dropdownWrap) {
          authBtn.remove();
          authBtn = null;
        }

        if (!dropdownWrap) {
          dropdownWrap = document.createElement('div');
          dropdownWrap.className = 'nav-user-dropdown-wrap';
          if (burger) {
            nr.insertBefore(dropdownWrap, burger);
          } else {
            nr.appendChild(dropdownWrap);
          }
        }

        const displayName = user.first_name ? (user.first_name + (user.last_name ? ' ' + user.last_name : '')) : (user.username || 'Кабинет');
        const usernameDisplay = user.username ? '@' + user.username : (user.id ? 'ID: ' + user.id : 'Авторизован');
        const avatarHtml = user.photo_url 
          ? `<img src="${user.photo_url}" alt="${displayName}" class="nav-user-avatar-mini" style="width:20px; height:20px; border-radius:50%; object-fit:cover; border:1px solid rgba(0,0,0,0.15);">`
          : `<span class="nav-user-avatar-placeholder-mini" style="width:20px; height:20px; border-radius:50%; background:#18181b; color:#fff; font-size:10px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;">${displayName.charAt(0).toUpperCase()}</span>`;

        dropdownWrap.innerHTML = `
          <button class="nav-auth-btn logged-in" id="nav-user-profile-trigger" aria-haspopup="true" aria-expanded="false" onclick="Auth.toggleUserDropdown(event, this)">
            ${avatarHtml}
            <span>${displayName}</span>
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-left:2px;" title="Онлайн"></span>
            <svg class="nav-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:2px; transition:transform 0.2s ease;"><path d="M6 9l6 6 6-6"></path></svg>
          </button>
          <div class="nav-user-dropdown-menu" id="nav-user-dropdown-menu">
            <div class="nav-user-dropdown-header">
              <div class="nav-user-dropdown-name">${displayName}</div>
              <div class="nav-user-dropdown-sub">${usernameDisplay}</div>
            </div>
            <a href="/cabinet" class="nav-user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Личный Кабинет</span>
            </a>
            <a href="/cabinet?tab=profile" class="nav-user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Мой Профиль</span>
            </a>
            <div class="nav-user-dropdown-divider"></div>
            <button type="button" onclick="Auth.logout()" class="nav-user-dropdown-item nav-user-dropdown-logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        `;
      } else {
        if (dropdownWrap) {
          dropdownWrap.remove();
          dropdownWrap = null;
        }

        if (!authBtn) {
          authBtn = document.createElement('button');
          authBtn.className = 'nav-auth-btn';
          if (burger) {
            nr.insertBefore(authBtn, burger);
          } else {
            nr.appendChild(authBtn);
          }
        }

        authBtn.innerHTML = `
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Войти</span>
        `;
        authBtn.setAttribute('title', 'Войти в Личный Кабинет');
        authBtn.onclick = () => { Auth.openModal(); };
      }
    });

    // Also update mobile menu auth button if present
    const mobileAuthSlots = document.querySelectorAll('.mobile-menu-auth-slot');
    mobileAuthSlots.forEach(slot => {
      if (user) {
        slot.innerHTML = `
          <a href="/cabinet" class="m-cta" style="background:#f4f4f5; color:#18181b; border:1px solid #e4e4e7; margin-bottom:8px;">👤 ${user.first_name || 'Кабинет'} (ЛК) ↗</a>
          <button onclick="Auth.logout()" class="m-cta" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; width:100%; cursor:pointer;">🚪 Выйти из аккаунта</button>
        `;
      } else {
        slot.innerHTML = `<button onclick="Auth.openModal()" class="m-cta" style="background:#f4f4f5; color:#18181b; border:1px solid #e4e4e7; width:100%; cursor:pointer;">👤 Войти / Регистрация ↗</button>`;
      }
    });
  }
};

// Global click outside to close dropdown
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-user-dropdown-wrap')) {
    if (typeof Auth !== 'undefined' && Auth.closeUserDropdown) {
      Auth.closeUserDropdown();
    }
  }
});

// Global Escape to close dropdown
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typeof Auth !== 'undefined' && Auth.closeUserDropdown) {
      Auth.closeUserDropdown();
    }
  }
});

// Global callback for Telegram Widget
window.onTelegramAuth = function(user) {
  Auth.handleTelegramAuth(user);
};

// Global export
window.Auth = Auth;

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Auth.injectModal();
  Auth.updateHeaderUI();
});

window.addEventListener('asage_auth_changed', () => {
  Auth.updateHeaderUI();
});
