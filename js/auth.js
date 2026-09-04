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
          has_bio: !!payload.bio
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
  openModal() {
    const user = this.getUser();
    if (user) {
      window.location.href = '/cabinet';
      return;
    }

    let modal = document.getElementById('asage-auth-modal');
    if (!modal) {
      this.injectModal();
      modal = document.getElementById('asage-auth-modal');
    }

    if (modal) {
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
        window.trackMetrikaEvent('open_auth_modal');
      }
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
        <div class="auth-modal-dialog">
          <button class="auth-modal-close" onclick="Auth.closeModal()" aria-label="Закрыть">✕</button>
          
          <div style="font-family:var(--mono, monospace); font-size:0.75rem; font-weight:700; color:#71717a; margin-bottom:8px; text-transform:uppercase;">
            // АВТОРИЗАЦИЯ & РЕГИСТРАЦИЯ
          </div>
          
          <h2 style="font-size:1.5rem; font-weight:800; margin:0 0 8px 0; color:#09090b; letter-spacing:-0.02em;">
            Вход в Личный Кабинет
          </h2>
          
          <p style="font-size:0.92rem; color:#71717a; line-height:1.55; margin:0 0 24px 0;">
            Быстрый доступ к Базе Знаний, практическим урокам и Закрытому Клубу.
          </p>

          <div class="auth-modal-widget-box" style="display:flex; justify-content:center; align-items:center; min-height:48px; padding:16px 0; background:#f4f4f5; border:1px solid #e4e4e7; margin-bottom:20px;">
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

  // 6. Update Header Profile Button & Auth Elements
  updateHeaderUI() {
    const user = this.getUser();
    const navRights = document.querySelectorAll('.nav-right');

    navRights.forEach(nr => {
      // Find or create .nav-auth-btn right after .nav-cta (Забронировать слот)
      let authBtn = nr.querySelector('.nav-auth-btn');
      const burger = nr.querySelector('.nav-burger');

      if (!authBtn) {
        authBtn = document.createElement('button');
        authBtn.className = 'nav-auth-btn';
        if (burger) {
          nr.insertBefore(authBtn, burger);
        } else {
          nr.appendChild(authBtn);
        }
      }

      if (user) {
        const displayName = user.first_name || user.username || 'Кабинет';
        const avatarHtml = user.photo_url 
          ? `<img src="${user.photo_url}" alt="${displayName}" class="nav-user-avatar-mini" style="width:20px; height:20px; border-radius:50%; object-fit:cover; border:1px solid rgba(0,0,0,0.15);">`
          : `<span class="nav-user-avatar-placeholder-mini" style="width:20px; height:20px; border-radius:50%; background:#18181b; color:#fff; font-size:10px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;">${displayName.charAt(0).toUpperCase()}</span>`;

        authBtn.innerHTML = `
          ${avatarHtml}
          <span>${displayName}</span>
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-left:2px;" title="Онлайн"></span>
        `;
        authBtn.setAttribute('title', 'Перейти в Личный Кабинет');
        authBtn.onclick = () => { window.location.href = '/cabinet'; };
      } else {
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
        slot.innerHTML = `<a href="/cabinet" class="m-cta" style="background:#f4f4f5; color:#18181b; border:1px solid #e4e4e7;">👤 ${user.first_name || 'Кабинет'} (ЛК) ↗</a>`;
      } else {
        slot.innerHTML = `<button onclick="Auth.openModal()" class="m-cta" style="background:#f4f4f5; color:#18181b; border:1px solid #e4e4e7; width:100%; cursor:pointer;">👤 Войти / Регистрация ↗</button>`;
      }
    });
  }
};

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
