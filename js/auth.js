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
        first_name: tgUser.first_name || 'Гость',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        role: dbUser ? dbUser.role : 'member',
        auth_date: tgUser.auth_date
      };

      localStorage.setItem('asage_user', JSON.stringify(sessionUser));
      
      // Trigger event
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: sessionUser }));
      
      // Track analytics
      if (typeof window.trackMetrikaEvent === 'function') {
        window.trackMetrikaEvent('telegram_login_success', {
          telegram_id: tgUser.id,
          username: tgUser.username || 'no_username'
        });
      }

      return sessionUser;
    } catch (err) {
      console.warn('[Auth Error]', err);
      // Fallback local session if offline
      const fallbackUser = {
        id: 'tg_' + tgUser.id,
        telegram_id: tgUser.id,
        first_name: tgUser.first_name || 'Пользователь',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        role: 'member'
      };
      localStorage.setItem('asage_user', JSON.stringify(fallbackUser));
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: fallbackUser }));
      return fallbackUser;
    }
  },

  // 3. Logout
  logout() {
    localStorage.removeItem('asage_user');
    window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: null }));
    if (window.location.pathname.includes('cabinet')) {
      window.location.reload();
    } else {
      this.updateHeaderUI();
    }
  },

  // 4. Favorites Management (Prompts / Glossary / Articles)
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

  // 5. Update Header User Profile Badge across pages
  updateHeaderUI() {
    const user = this.getUser();
    const userBtnContainers = document.querySelectorAll('.nav-auth-slot, .nav-cta-wrapper');

    userBtnContainers.forEach(container => {
      if (user) {
        const displayName = user.first_name || user.username || 'Кабинет';
        const avatarHtml = user.photo_url 
          ? `<img src="${user.photo_url}" alt="${displayName}" class="nav-user-avatar" style="width:24px; height:24px; border-radius:50%; object-fit:cover; margin-right:8px; border:1px solid rgba(0,0,0,0.1);">`
          : `<span class="nav-user-avatar-placeholder" style="display:inline-flex; width:24px; height:24px; border-radius:50%; background:#18181b; color:#fff; font-size:11px; font-weight:700; align-items:center; justify-content:center; margin-right:8px;">${displayName.charAt(0).toUpperCase()}</span>`;

        container.innerHTML = `
          <a href="/cabinet" class="nav-user-pill" style="display:inline-flex; align-items:center; padding:4px 12px 4px 6px; background:#f4f4f5; border:1px solid #e4e4e7; border-radius:100px; text-decoration:none; color:#18181b; font-family:var(--font-mono, monospace); font-size:0.8rem; font-weight:600; transition:all 0.2s ease;">
            ${avatarHtml}
            <span>${displayName}</span>
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e; margin-left:8px;" title="Онлайн"></span>
          </a>
        `;
      }
    });
  }
};

// Global callback for Telegram Widget
window.onTelegramAuth = function(user) {
  Auth.handleTelegramAuth(user).then(() => {
    if (window.location.pathname.includes('cabinet')) {
      window.location.reload();
    } else {
      Auth.updateHeaderUI();
    }
  });
};

// Global export
window.Auth = Auth;

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateHeaderUI();
});

window.addEventListener('asage_auth_changed', () => {
  Auth.updateHeaderUI();
});
