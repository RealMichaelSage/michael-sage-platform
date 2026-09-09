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
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (user) {
        const tgId = Number(user.telegram_id || 0);
        const uname = (user.username || '').replace(/^@/, '').toLowerCase();
        if (uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911) {
          user.role = 'founder';
          user.is_founder = true;
          if (!user.bio || !user.bio.trim()) {
            user.bio = 'Просто обучаю людей упрощать жизнь и бизнес с помощью нейросетей';
          }
        } else if (uname === 'imichaelsage' || tgId === 8489288884) {
          user.role = 'club_member';
          user.is_club_resident = true;
          user.is_channel_subscriber = true;
        }
      }
      return user;
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
      const tgId = Number(tgUser.id);
      const uname = (tgUser.username || '').replace(/^@/, '').toLowerCase();
      const isFounder = (uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911);
      const isKnownResident = (uname === 'imichaelsage' || tgId === 8489288884);

      let isClubResident = isFounder || isKnownResident;
      let isChannelSubscriber = isFounder || isKnownResident;
      let userRole = isFounder ? 'founder' : (isClubResident ? 'club_member' : 'member');

      // 1. Immediately verify Telegram club/channel status via Backend API
      try {
        const checkRes = await fetch('/api/check-telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: tgId, username: tgUser.username || '' })
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.ok) {
            if (checkData.is_club_resident) {
              isClubResident = true;
              userRole = isFounder ? 'founder' : 'club_member';
            }
            if (checkData.is_channel_subscriber) {
              isChannelSubscriber = true;
              localStorage.setItem('asage_channel_verified', 'true');
            }
          }
        }
      } catch (checkErr) {
        console.warn('[Check Telegram API Warning during login]', checkErr);
      }

      // 2. Sync to Backend resilient local store (/api/user/sync)
      let backendUser = null;
      try {
        const syncRes = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegram_id: tgId,
            first_name: tgUser.first_name || '',
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || '',
            role: userRole,
            is_club_resident: isClubResident,
            is_channel_subscriber: isChannelSubscriber,
            last_login_at: new Date().toISOString()
          })
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData && syncData.ok && syncData.user) {
            backendUser = syncData.user;
          }
        }
      } catch (syncErr) {
        console.warn('[User Sync API Warning during login]', syncErr);
      }

      // 3. Non-blocking attempt to Supabase (safe if 402 quota error occurs)
      let dbUser = null;
      try {
        const payload = {
          telegram_id: tgId,
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          photo_url: tgUser.photo_url || '',
          role: userRole,
          is_club_resident: isClubResident,
          is_channel_subscriber: isChannelSubscriber,
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

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            dbUser = data[0];
          }
        }
      } catch (sbErr) {
        console.warn('[Supabase Sync Warning during login]', sbErr);
      }

      const sessionUser = {
        id: (backendUser && backendUser.id) ? backendUser.id : (dbUser ? dbUser.id : 'tg_' + tgUser.id),
        telegram_id: tgId,
        first_name: (backendUser && backendUser.first_name) ? backendUser.first_name : ((dbUser && dbUser.first_name) ? dbUser.first_name : (tgUser.first_name || 'Гость')),
        last_name: (backendUser && backendUser.last_name !== undefined) ? backendUser.last_name : ((dbUser && dbUser.last_name !== undefined) ? dbUser.last_name : (tgUser.last_name || '')),
        username: tgUser.username || (backendUser ? backendUser.username : ''),
        photo_url: tgUser.photo_url || (backendUser ? backendUser.photo_url : ''),
        email: (backendUser && backendUser.email) ? backendUser.email : (dbUser && dbUser.email ? dbUser.email : ''),
        bio: (backendUser && backendUser.bio) ? backendUser.bio : (dbUser && dbUser.bio ? dbUser.bio : (isFounder ? 'Просто обучаю людей упрощать жизнь и бизнес с помощью нейросетей' : '')),
        channel_url: (backendUser && backendUser.channel_url) ? backendUser.channel_url : (dbUser && dbUser.channel_url ? dbUser.channel_url : ''),
        website_url: (backendUser && backendUser.website_url) ? backendUser.website_url : (dbUser && dbUser.website_url ? dbUser.website_url : ''),
        is_private: backendUser ? Boolean(backendUser.is_private) : (dbUser ? Boolean(dbUser.is_private) : false),
        role: (backendUser && backendUser.role) ? backendUser.role : (dbUser ? dbUser.role : userRole),
        is_club_resident: isClubResident,
        is_channel_subscriber: isChannelSubscriber,
        is_founder: isFounder,
        auth_date: tgUser.auth_date || Math.floor(Date.now() / 1000)
      };

      localStorage.setItem('asage_user', JSON.stringify(sessionUser));
      
      // Close modal if open
      this.closeModal();

      // Trigger event
      window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: sessionUser }));
      
      // Track analytics
      if (typeof window.trackMetrikaEvent === 'function') {
        window.trackMetrikaEvent('telegram_login_success', {
          telegram_id: tgId,
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
      const tgId = Number(tgUser.id);
      const uname = (tgUser.username || '').replace(/^@/, '').toLowerCase();
      const isFounder = (uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911);
      const isKnownResident = (uname === 'imichaelsage' || tgId === 8489288884);

      const fallbackUser = {
        id: 'tg_' + tgUser.id,
        telegram_id: tgUser.id,
        first_name: tgUser.first_name || 'Пользователь',
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        photo_url: tgUser.photo_url || '',
        email: '',
        bio: isFounder ? 'Просто обучаю людей упрощать жизнь и бизнес с помощью нейросетей' : '',
        channel_url: '',
        website_url: '',
        is_private: false,
        role: isFounder ? 'founder' : (isKnownResident ? 'club_member' : 'member'),
        is_club_resident: isFounder || isKnownResident,
        is_channel_subscriber: isFounder || isKnownResident,
        is_founder: isFounder
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

  // 3. Update User Profile in Backend & Supabase & LocalStorage
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
        username: profileData.username !== undefined ? profileData.username.trim() : (user.username || ''),
        photo_url: profileData.photo_url !== undefined ? profileData.photo_url : (user.photo_url || ''),
        email: profileData.email !== undefined ? profileData.email.trim() : (user.email || ''),
        bio: profileData.bio !== undefined ? profileData.bio.trim() : (user.bio || ''),
        channel_url: profileData.channel_url !== undefined ? profileData.channel_url.trim() : (user.channel_url || ''),
        website_url: profileData.website_url !== undefined ? profileData.website_url.trim() : (user.website_url || ''),
        is_private: isPrivateVal,
        role: user.role,
        is_club_resident: user.is_club_resident,
        is_channel_subscriber: user.is_channel_subscriber,
        updated_at: new Date().toISOString()
      };

      // 1. Sync to local backend resilient store
      try {
        await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (syncErr) {
        console.warn('[Local Sync Warning on Profile Update]:', syncErr);
      }

      // 2. Non-blocking attempt to Supabase
      let dbUser = null;
      try {
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

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) dbUser = data[0];
        }
      } catch (sbErr) {
        console.warn('[Supabase Direct Sync Warning]:', sbErr);
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

  async updateProfile(profileData) {
    return this.updateUserProfile(profileData);
  },

  // 4. Fetch fresh profile data from Backend / Supabase
  async fetchFreshUserProfile() {
    const user = this.getUser();
    if (!user || !user.telegram_id) return null;

    try {
      // 1. Try local backend first (fast and immune to Supabase 402)
      try {
        const localRes = await fetch(`/api/user/profile?telegram_id=${user.telegram_id}`);
        if (localRes.ok) {
          const lData = await localRes.json();
          if (lData && lData.ok && lData.user) {
            const dbUser = lData.user;
            const uname = (dbUser.username || user.username || '').replace(/^@/, '').toLowerCase();
            const tgId = Number(dbUser.telegram_id || user.telegram_id || 0);
            const isKnownResident = (uname === 'imichaelsage' || tgId === 8489288884);
            const isResident = isKnownResident || dbUser.is_club_resident === true || dbUser.role === 'club_member';
            const role = isKnownResident ? 'club_member' : (dbUser.role || user.role);

            const freshUser = {
              ...user,
              first_name: dbUser.first_name || user.first_name,
              last_name: dbUser.last_name !== undefined ? dbUser.last_name : user.last_name,
              username: dbUser.username || user.username,
              photo_url: dbUser.photo_url || user.photo_url,
              role: role,
              is_club_resident: isResident,
              is_channel_subscriber: dbUser.is_channel_subscriber !== undefined ? Boolean(dbUser.is_channel_subscriber) : user.is_channel_subscriber,
              email: dbUser.email || user.email || '',
              bio: dbUser.bio || user.bio || '',
              channel_url: dbUser.channel_url || user.channel_url || '',
              website_url: dbUser.website_url || user.website_url || '',
              is_private: dbUser.is_private !== undefined ? Boolean(dbUser.is_private) : false,
              id: dbUser.id || user.id
            };
            localStorage.setItem('asage_user', JSON.stringify(freshUser));
            window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: freshUser }));
            return freshUser;
          }
        }
      } catch (localErr) {
        console.warn('[Local Profile API Warning]', localErr);
      }

      // 2. Fallback attempt to Supabase
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
          const uname = (dbUser.username || user.username || '').replace(/^@/, '').toLowerCase();
          const tgId = Number(dbUser.telegram_id || user.telegram_id || 0);
          const isKnownResident = (uname === 'imichaelsage' || tgId === 8489288884);
          const isResident = isKnownResident || dbUser.is_club_resident === true || dbUser.role === 'club_member';
          const role = isKnownResident ? 'club_member' : (dbUser.role || user.role);

          const freshUser = {
            ...user,
            first_name: dbUser.first_name || user.first_name,
            last_name: dbUser.last_name !== undefined ? dbUser.last_name : user.last_name,
            username: dbUser.username || user.username,
            photo_url: dbUser.photo_url || user.photo_url,
            role: role,
            is_club_resident: isResident,
            is_channel_subscriber: dbUser.is_channel_subscriber !== undefined ? Boolean(dbUser.is_channel_subscriber) : user.is_channel_subscriber,
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
    const uname = (user.username || '').replace(/^@/, '').toLowerCase();
    // Mikhail Sage is platform founder and has full access
    if (uname === 'michael_sage' || uname === 'uncrn_sage' || tgId === 439634804 || tgId === 88472911) {
      return true;
    }
    // Resident whitelist (Imichaelsage, etc.)
    if (uname === 'imichaelsage' || tgId === 8489288884) {
      return true;
    }
    // Resident of SAGE Neuro Family chat or Student of Mentorship
    if (user.role === 'club_member' || user.role === 'resident' || user.role === 'student' || user.club_member === true || user.is_club_resident === true) {
      return true;
    }
    return false;
  },

  // 5.1 Check if user is subscribed to Telegram channel (@uncrn_sage)
  isChannelSubscriber() {
    const user = this.getUser();
    if (this.hasClubAccess()) return true;
    if (user && (user.is_channel_subscriber === true || user.channel_subscriber === true)) return true;
    if (localStorage.getItem('asage_channel_verified') === 'true') return true;
    return false;
  },

  // 5.2 Get list of purchased items from local cache
  getPurchasedItems() {
    try {
      const stored = localStorage.getItem('asage_purchased_items');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) return arr;
      }
    } catch (e) {}
    return [];
  },

  // 5.3 Check if specific item is purchased or unlocked for user
  hasPurchasedItem(itemId) {
    if (this.hasClubAccess()) return true;
    const list = this.getPurchasedItems();
    return Array.isArray(list) && list.includes(itemId);
  },

  // 5.4 Fetch fresh purchases from API
  async fetchPurchasedItems() {
    const user = this.getUser();
    if (!user || !user.telegram_id) return [];
    try {
      const res = await fetch(`/api/user/purchases?telegram_id=${user.telegram_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.purchased_items)) {
          localStorage.setItem('asage_purchased_items', JSON.stringify(data.purchased_items));
          window.dispatchEvent(new CustomEvent('asage_purchases_updated', { detail: data.purchased_items }));
          return data.purchased_items;
        }
      }
    } catch (e) {
      console.warn('[Fetch Purchases Warning]', e);
    }
    return this.getPurchasedItems();
  },

  // 5.5 Verify Telegram Channel & Club Chat subscriptions via Bot API
  async checkTelegramSubscriptions(showFeedback = false) {
    const user = this.getUser();
    if (!user || !user.telegram_id) {
      if (showFeedback) {
        this.openModal('Для проверки подписки на канал авторизуйтесь через Telegram в 1 клик.', 'Проверка подписки');
      }
      return { ok: false, error: 'NOT_LOGGED_IN' };
    }

    try {
      const res = await fetch('/api/check-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          telegram_id: user.telegram_id,
          username: user.username || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.ok) {
          user.is_channel_subscriber = data.is_channel_subscriber;
          user.is_club_resident = data.is_club_resident;
          if (data.is_club_resident) {
            user.role = 'club_member';
          }
          if (data.is_channel_subscriber) {
            localStorage.setItem('asage_channel_verified', 'true');
          }
          localStorage.setItem('asage_user', JSON.stringify(user));
          window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: user }));

          if (showFeedback) {
            if (data.is_club_resident) {
              this.showToast('Статус подтвержден: Резидент SAGE Neuro Family 💎', 'success');
            } else if (data.is_channel_subscriber) {
              this.showToast('Подписка на канал @uncrn_sage подтверждена ✓', 'success');
            } else {
              this.showToast('Подписка на канал @uncrn_sage пока не обнаружена', 'error');
            }
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('[Check Telegram Error]', err);
      if (showFeedback) this.showToast('Ошибка связи с сервером проверки', 'error');
    }
    return { ok: false };
  },

  // 5.6 Initiate purchase via Tochka Bank acquiring (Direct redirect to payment form)
  async initiatePayment({ itemId, itemType = 'material', amount = 349, title = 'Цифровой материал' }) {
    const user = this.getUser();

    // If user specifically purchased this item in DB
    if (user && this.hasPurchasedItem(itemId)) {
      this.showToast('Материал уже оплачен! Переходим в кабинет...', 'info');
      window.location.href = `/cabinet/?item_id=${encodeURIComponent(itemId)}`;
      return;
    }

    const cleanTitle = decodeURIComponent(title || 'Цифровой материал');
    this.showToast('Перенаправление на форму оплаты Точка Банка...', 'info');

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user ? user.telegram_id : 0,
          item_id: itemId,
          item_type: itemType,
          amount: amount,
          title: cleanTitle,
          client_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Покупатель',
          client_email: (user && user.email) ? user.email : 'i@michaelpuzyrev.ru'
        })
      });

      const data = await res.json();
      if (data && data.ok) {
        if (data.already_purchased) {
          await this.fetchPurchasedItems();
          this.showToast('Материал уже оплачен! Доступ открыт.', 'success');
          window.location.href = `/cabinet/?item_id=${encodeURIComponent(itemId)}`;
          return;
        }

        if (data.payment_url) {
          // DIRECT REDIRECT TO TOCHKA BANK SECURE PAYMENT FORM
          window.location.href = data.payment_url;
          return;
        }

        this.showToast('Не удалось получить ссылку на оплату', 'error');
      } else {
        this.showToast(data.error || 'Ошибка создания счета', 'error');
      }
    } catch (e) {
      this.showToast('Ошибка обращения к платежному шлюзу', 'error');
    }
  },

  // 5.7 Switch to another account / test customer (for testing without another physical Telegram)
  switchAccount(telegramId = 999123456, username = 'test_guest', firstName = 'Тестовый', lastName = 'Покупатель') {
    const testUser = {
      id: 'tg_' + telegramId,
      telegram_id: Number(telegramId),
      first_name: firstName,
      last_name: lastName,
      username: username,
      photo_url: '',
      email: '',
      bio: 'Тестовый аккаунт для проверки покупок',
      role: 'member',
      is_private: false,
      auth_date: Math.floor(Date.now() / 1000)
    };
    localStorage.setItem('asage_user', JSON.stringify(testUser));
    localStorage.removeItem('asage_user_purchases');
    window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: testUser }));
    this.showToast(`Вошли как @${username} (ID: ${telegramId})`, 'success');
    if (window.location.pathname.includes('cabinet') || window.location.pathname.includes('profile')) {
      window.location.reload();
    } else {
      this.updateHeaderUI();
    }
  },

  // 6. Initial Members Directory (SAGE Neuro Family Founder)
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
      }
    ];
  },

  // 7. Fetch Public Members Directory from Backend / Supabase + Strict Deduplication
  async fetchMembersDirectory() {
    let list = [];
    try {
      // 1. Try local backend first (resilient and instant)
      try {
        const apiRes = await fetch('/api/residents');
        if (apiRes.ok) {
          const aData = await apiRes.json();
          if (aData && aData.ok && Array.isArray(aData.residents) && aData.residents.length > 0) {
            list = aData.residents.filter(u => u.is_private !== true);
          }
        }
      } catch (apiErr) {
        console.warn('[Residents API Warning]', apiErr);
      }

      // 2. Fallback to Supabase if list is empty
      if (!list || list.length === 0) {
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
                        currentUser.telegram_id == 88472911 ||
                        currentUser.role === 'founder';

      const userRole = isMikhail ? 'founder' : (currentUser.role || 'member');
      const normalizedUser = { ...currentUser, role: userRole };

      // Only add to club directory if resident or student and not private
      if (!normalizedUser.is_private && (normalizedUser.role === 'founder' || normalizedUser.role === 'club_member' || normalizedUser.role === 'student' || normalizedUser.is_club_resident === true)) {
        // Check existing index
        const idx = list.findIndex(m => {
          if (m.telegram_id && m.telegram_id == normalizedUser.telegram_id) return true;
          if (m.username && normalizedUser.username && m.username.toLowerCase() === normalizedUser.username.toLowerCase()) return true;
          if (isMikhail && (m.username === 'Michael_Sage' || m.telegram_id == 439634804 || m.telegram_id == 88472911 || m.role === 'founder')) return true;
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
          if (isMikhail && (m.username === 'Michael_Sage' || m.telegram_id == 439634804 || m.telegram_id == 88472911 || m.role === 'founder')) return true;
          return false;
        });
        if (idx !== -1) list.splice(idx, 1);
      }
    }

    // Filter list: keep founder, club_member, student or anyone with is_club_resident === true
    const validRoles = ['founder', 'club_member', 'student'];
    list = list.filter(m => (validRoles.includes(m.role) || m.is_club_resident === true) && m.is_private !== true);

    // Strict Deduplication Pass
    const seenMap = new Map();
    const result = [];
    for (const item of list) {
      const uname = (item.username || '').toLowerCase();
      const tgId = item.telegram_id ? String(item.telegram_id) : '';
      const isMikhail = uname === 'michael_sage' || tgId === '439634804' || tgId === '88472911' || item.role === 'founder';

      const dedupKey = isMikhail ? 'founder_mikhail_sage' : (uname ? 'u:' + uname : 'id:' + tgId);
      if (!seenMap.has(dedupKey)) {
        seenMap.set(dedupKey, true);
        result.push(item);
      }
    }

    // Ensure founder Mikhail is always pinned at the top if present
    const mikhailIdx = result.findIndex(m => {
      const uname = (m.username || '').toLowerCase();
      const tgId = String(m.telegram_id || '');
      return uname === 'michael_sage' || tgId === '439634804' || tgId === '88472911' || m.role === 'founder';
    });
    if (mikhailIdx > 0) {
      const [mikhailItem] = result.splice(mikhailIdx, 1);
      result.unshift(mikhailItem);
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
    localStorage.removeItem('asage_user_purchases');
    sessionStorage.removeItem('asage_pending_purchase');
    window.dispatchEvent(new CustomEvent('asage_auth_changed', { detail: null }));
    window.dispatchEvent(new CustomEvent('asage_purchases_updated', { detail: [] }));
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

  // Protect standalone page from unauthorized / guest access
  protectPageAccess(type = 'club') {
    const check = () => {
      const hasAccess = this.hasClubAccess();
      const user = this.getUser();
      const lockwall = document.getElementById('page-gate-lockwall');
      const protectedContent = document.getElementById('page-protected-content');

      if (!hasAccess) {
        if (protectedContent) protectedContent.style.display = 'none';
        if (lockwall) lockwall.style.display = 'block';

        if (!user) {
          this.openModal(
            'Данный сценарий доступен только в личном кабинете для резидентов клуба.',
            'Доступен только в личном кабинете'
          );
        }
      } else {
        if (protectedContent) protectedContent.style.display = 'block';
        if (lockwall) lockwall.style.display = 'none';
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }

    window.addEventListener('asage_auth_changed', check);
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

    if (!document.getElementById('asage-auth-injected-styles')) {
      const styles = document.createElement('style');
      styles.id = 'asage-auth-injected-styles';
      styles.textContent = `
        .auth-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 9, 11, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .auth-modal-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        .auth-modal-dialog {
          background: #ffffff;
          border: 1px solid #18181b;
          width: 100%;
          max-width: 460px;
          padding: 32px 28px 28px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
          position: relative;
          transform: translateY(16px) scale(0.98);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #09090b;
        }
        .auth-modal-overlay.active .auth-modal-dialog {
          transform: translateY(0) scale(1);
        }
        .auth-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          color: #09090b;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          z-index: 10;
        }
        .auth-modal-close:hover {
          background: #09090b;
          color: #ffffff;
          border-color: #09090b;
        }
        body.asage-page-gated > *:not(#asage-channel-gate-modal):not(#asage-auth-modal):not(#asage-tochka-modal) {
          filter: blur(14px);
          pointer-events: none;
          user-select: none;
          transition: filter 0.3s ease;
        }
      `;
      document.head.appendChild(styles);
    }

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

    // Inject Channel Gate Modal if not present
    if (!document.getElementById('asage-channel-gate-modal')) {
      const channelModalHtml = `
        <div id="asage-channel-gate-modal" class="auth-modal-overlay" onclick="if(event.target === this && this.getAttribute('data-prevent-close') !== 'true') Auth.closeChannelGateModal()">
          <div class="auth-modal-dialog" style="border-radius:0 !important; max-width:480px;">
            <button class="auth-modal-close" onclick="Auth.closeChannelGateModal()" aria-label="Закрыть" style="border-radius:0 !important;">✕</button>
            
            <div style="display:inline-block; padding:3px 8px; background:#f4f4f5; border:1px solid #e4e4e7; font-family:var(--mono); font-size:0.7rem; font-weight:700; color:#09090b; margin-bottom:12px;">
              // ДОСТУП ДЛЯ ПОДПИСЧИКОВ КАНАЛА
            </div>
            
            <h2 id="channel-gate-title" style="font-size:1.35rem; font-weight:800; margin:0 0 10px 0; color:#09090b; letter-spacing:-0.02em;">
              Материал доступен подписчикам
            </h2>
            
            <p id="channel-gate-desc" style="font-size:0.9rem; color:#52525b; line-height:1.55; margin:0 0 20px 0;">
              Этот материал предоставляется бесплатно для подписчиков официального Telegram-канала Михаила Пузырёва (<strong>@uncrn_sage</strong>).
            </p>

            <div id="channel-gate-status" style="display:none; padding:10px 14px; margin-bottom:16px; font-family:var(--mono); font-size:0.8rem; line-height:1.5;"></div>

            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
              <a href="https://t.me/uncrn_sage" target="_blank" class="btn-primary" style="background:#09090b; color:#ffffff; padding:12px 18px; font-size:0.88rem; font-weight:700; font-family:var(--mono); text-align:center; justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                <span>📢 1. Подписаться на @uncrn_sage</span> ↗
              </a>
              
              <button id="btn-verify-channel" onclick="Auth.handleChannelVerifyModalClick()" class="btn-primary" style="background:#10b981; border-color:#10b981; color:#ffffff; padding:12px 18px; font-size:0.88rem; font-weight:700; font-family:var(--mono); justify-content:center; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <span>⚡ 2. Проверить подписку</span>
              </button>
            </div>

            <div id="channel-gate-login-prompt" style="display:none; background:#fafafa; border:1px solid #e4e4e7; padding:14px; text-align:center;">
              <div style="font-family:var(--mono); font-size:0.75rem; color:#71717a; margin-bottom:10px;">
                Для проверки подписки войдите через Telegram (1 клик):
              </div>
              <div class="channel-gate-widget-box" style="display:flex; justify-content:center;"></div>
            </div>

            <div style="font-family:var(--mono); font-size:0.72rem; color:#71717a; text-align:center; margin-top:14px;">
              После подтверждения подписки материал разблокируется мгновенно.
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', channelModalHtml);
    }

    // Inject Tochka Checkout Modal if not present
    if (!document.getElementById('asage-tochka-modal')) {
      const tochkaModalHtml = `
        <div id="asage-tochka-modal" class="auth-modal-overlay" onclick="if(event.target === this) Auth.closeTochkaCheckoutModal()">
          <div class="auth-modal-dialog" style="border-radius:0 !important; max-width:500px;">
            <button class="auth-modal-close" onclick="Auth.closeTochkaCheckoutModal()" aria-label="Закрыть" style="border-radius:0 !important;">✕</button>
            
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:6px;">
              <span style="display:inline-block; padding:3px 8px; background:#09090b; color:#ffffff; font-family:var(--mono); font-size:0.7rem; font-weight:700;">
                ТОЧКА БАНК // ЭКВАЙРИНГ
              </span>
              <span style="font-family:var(--mono); font-size:0.72rem; color:#71717a;">
                БЕЗОПАСНАЯ ОПЛАТА
              </span>
            </div>

            <h2 id="tochka-modal-title" style="font-size:1.35rem; font-weight:800; margin:0 0 8px 0; color:#09090b; letter-spacing:-0.02em;">
              Покупка цифрового материала
            </h2>

            <div id="tochka-modal-item-name" style="font-size:0.95rem; color:#27272a; margin-bottom:16px; font-weight:600;">
              Название материала
            </div>

            <div style="background:#fafafa; border:1px solid #e4e4e7; border-left:4px solid #09090b; padding:16px; margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-family:var(--mono); font-size:0.82rem; color:#71717a;">ИТОГО К ОПЛАТЕ:</span>
                <span id="tochka-modal-price" style="font-family:var(--mono); font-size:1.4rem; font-weight:800; color:#09090b;">349 ₽</span>
              </div>
              <div style="font-family:var(--mono); font-size:0.72rem; color:#71717a; margin-top:6px;">
                Без НДС (УСН) · Моментальный доступ в Личном кабинете
              </div>
            </div>

            <div style="font-size:0.82rem; color:#52525b; line-height:1.55; margin-bottom:20px;">
              💳 Оплата картами РФ (МИР, Visa, MasterCard), СБП и Mir Pay через интернет-эквайринг <strong>АО «Точка»</strong> (Лицензия Банка России № 3545, протокол 3D-Secure, стандарт PCI DSS).
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
              <a id="tochka-modal-pay-btn" href="#" target="_blank" class="btn-primary" style="background:#09090b; color:#ffffff; padding:14px; font-size:0.9rem; font-weight:700; font-family:var(--mono); text-align:center; justify-content:center; text-decoration:none; display:flex; align-items:center; gap:8px;">
                <span>Оплатить в Банке Точка</span> ↗
              </a>
              
              <button id="tochka-modal-test-btn" onclick="Auth.handleTestPaymentClick()" class="btn-secondary" style="padding:9px; font-size:0.78rem; font-family:var(--mono); text-align:center; justify-content:center; cursor:pointer; background:#f4f4f5; color:#52525b; border:1px solid #e4e4e7;">
                ⚡ Подтвердить тестовую оплату (Режим проверки)
              </button>
            </div>

            <div style="font-size:0.72rem; color:#71717a; line-height:1.4; text-align:center;">
              Совершая оплату, вы безоговорочно принимаете условия <a href="/offer-materials" target="_blank" style="color:#09090b; text-decoration:underline;">Публичной оферты купли-продажи цифрового контента</a>. Цифровой товар надлежащего качества после открытия доступа возврату не подлежит.
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', tochkaModalHtml);
    }
  },

  // Channel Gate Modal Actions
  openChannelGateModal({ title = 'Материал платформы', onVerified = null, preventClose = false, returnUrl = '/cabinet/' }) {
    this._channelVerifyCallback = onVerified;
    this.injectModal();
    const modal = document.getElementById('asage-channel-gate-modal');
    if (!modal) return;

    const titleElem = modal.querySelector('#channel-gate-title');
    const descElem = modal.querySelector('#channel-gate-desc');
    const statusElem = modal.querySelector('#channel-gate-status');
    const loginPrompt = modal.querySelector('#channel-gate-login-prompt');
    const closeBtn = modal.querySelector('.auth-modal-close');

    if (titleElem) titleElem.innerText = `Доступ: ${title}`;
    if (descElem) descElem.innerHTML = `Материал «<strong>${title}</strong>» доступен бесплатно для подписчиков официального Telegram-канала Михаила Пузырёва (<strong>@uncrn_sage</strong>).`;
    if (statusElem) statusElem.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'none';

    if (preventClose) {
      modal.setAttribute('data-prevent-close', 'true');
      if (closeBtn) {
        closeBtn.innerHTML = '← В кабинет';
        closeBtn.style.fontSize = '0.75rem';
        closeBtn.style.width = 'auto';
        closeBtn.style.padding = '4px 10px';
        closeBtn.onclick = () => { window.location.href = returnUrl; };
      }
    } else {
      modal.removeAttribute('data-prevent-close');
      if (closeBtn) {
        closeBtn.innerHTML = '✕';
        closeBtn.style.fontSize = '';
        closeBtn.style.width = '';
        closeBtn.style.padding = '';
        closeBtn.onclick = () => { Auth.closeChannelGateModal(); };
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeChannelGateModal() {
    const modal = document.getElementById('asage-channel-gate-modal');
    if (modal) {
      if (modal.getAttribute('data-prevent-close') === 'true') {
        return;
      }
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  async handleChannelVerifyModalClick() {
    const user = this.getUser();
    const modal = document.getElementById('asage-channel-gate-modal');
    if (!modal) return;
    const btn = modal.querySelector('#btn-verify-channel');
    const statusElem = modal.querySelector('#channel-gate-status');
    const loginPrompt = modal.querySelector('#channel-gate-login-prompt');
    const widgetBox = modal.querySelector('.channel-gate-widget-box');

    if (!user || !user.telegram_id) {
      if (loginPrompt) {
        loginPrompt.style.display = 'block';
        if (widgetBox && !widgetBox.querySelector('script') && !widgetBox.querySelector('iframe')) {
          const script = document.createElement('script');
          script.src = 'https://telegram.org/js/telegram-widget.js?22';
          script.setAttribute('data-telegram-login', 'Michaelsage_bot');
          script.setAttribute('data-size', 'medium');
          script.setAttribute('data-radius', '0');
          script.setAttribute('data-onauth', 'onTelegramAuth(user)');
          script.setAttribute('data-request-access', 'write');
          script.async = true;
          widgetBox.appendChild(script);
        }
      }
      if (statusElem) {
        statusElem.style.display = 'block';
        statusElem.style.background = '#fef2f2';
        statusElem.style.color = '#dc2626';
        statusElem.style.border = '1px solid #fecaca';
        statusElem.innerHTML = '⚠️ Пожалуйста, авторизуйтесь через Telegram ниже для проверки подписки.';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerText = '⏳ Проверяем подписку через Bot API...';
    }

    const res = await this.checkTelegramSubscriptions(false);

    if (res && res.is_channel_subscriber) {
      if (statusElem) {
        statusElem.style.display = 'block';
        statusElem.style.background = '#dcfce7';
        statusElem.style.color = '#15803d';
        statusElem.style.border = '1px solid #86efac';
        statusElem.innerHTML = '✓ Подписка на @uncrn_sage подтверждена! Открываем доступ...';
      }
      setTimeout(() => {
        document.body.classList.remove('asage-page-gated');
        modal.removeAttribute('data-prevent-close');
        this.closeChannelGateModal();
        if (typeof this._channelVerifyCallback === 'function') {
          this._channelVerifyCallback();
          this._channelVerifyCallback = null;
        } else {
          window.location.reload();
        }
      }, 900);
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '⚡ 2. Проверить подписку';
      }
      if (statusElem) {
        statusElem.style.display = 'block';
        statusElem.style.background = '#fef2f2';
        statusElem.style.color = '#dc2626';
        statusElem.style.border = '1px solid #fecaca';
        statusElem.innerHTML = '✕ Подписка не обнаружена. Перейдите по кнопке №1 в канал @uncrn_sage, подпишитесь и нажмите проверить еще раз.';
      }
    }
  },

  // Tochka Bank Checkout Modal Actions
  openTochkaCheckoutModal({ itemId, itemType, amount, title, purchaseId, paymentUrl }) {
    this._currentPendingPurchase = { itemId, itemType, amount, title, purchaseId };
    this.injectModal();
    const modal = document.getElementById('asage-tochka-modal');
    if (!modal) return;

    const titleElem = modal.querySelector('#tochka-modal-item-name');
    const priceElem = modal.querySelector('#tochka-modal-price');
    const payBtn = modal.querySelector('#tochka-modal-pay-btn');

    if (titleElem) titleElem.innerText = title;
    if (priceElem) priceElem.innerText = `${amount} ₽`;
    if (payBtn) {
      payBtn.href = paymentUrl || '#';
      payBtn.onclick = (e) => {
        if (!paymentUrl || paymentUrl.startsWith('#') || paymentUrl.includes('pay_item=')) {
          e.preventDefault();
          this.handleTestPaymentClick();
        }
      };
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeTochkaCheckoutModal() {
    const modal = document.getElementById('asage-tochka-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  async handleTestPaymentClick() {
    const user = this.getUser();
    if (!user || !user.telegram_id || !this._currentPendingPurchase) return;
    const { itemId, itemType, amount } = this._currentPendingPurchase;

    this.showToast('Подтверждение оплаты в Точка Банке...', 'info');

    try {
      const res = await fetch('/api/payment/test-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: user.telegram_id,
          item_id: itemId,
          item_type: itemType,
          amount: amount,
          secret: 'sage_secure_platform_2026'
        })
      });

      if (res.ok) {
        await this.fetchPurchasedItems();
        this.closeTochkaCheckoutModal();
        this.showToast('Оплата успешно подтверждена! Материал разблокирован.', 'success');
        window.location.reload();
      } else {
        this.showToast('Ошибка подтверждения тестового платежа', 'error');
      }
    } catch (e) {
      this.showToast('Сетевая ошибка', 'error');
    }
  },

  // Protect standalone page for channel subscribers only
  protectChannelPage(pageTitle = 'Материал') {
    const check = () => {
      const isSubscribed = this.isChannelSubscriber();
      const lockwall = document.getElementById('page-gate-lockwall');
      const protectedContent = document.getElementById('page-protected-content');

      if (!isSubscribed) {
        if (protectedContent) protectedContent.style.filter = 'blur(6px)';
        if (lockwall) lockwall.style.display = 'flex';
      } else {
        if (protectedContent) protectedContent.style.filter = 'none';
        if (lockwall) lockwall.style.display = 'none';
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }

    window.addEventListener('asage_auth_changed', check);
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
          ? `<img src="${user.photo_url}" alt="${displayName}" class="nav-user-avatar-mini" style="width:26px; height:26px; border-radius:50%; object-fit:cover; border:1px solid rgba(0,0,0,0.15);">`
          : `<span class="nav-user-avatar-placeholder-mini" style="width:26px; height:26px; border-radius:50%; background:#18181b; color:#fff; font-size:11px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;">${displayName.charAt(0).toUpperCase()}</span>`;

        dropdownWrap.innerHTML = `
          <button class="nav-auth-btn logged-in" id="nav-user-profile-trigger" aria-haspopup="true" aria-expanded="false" onclick="Auth.toggleUserDropdown(event, this)" title="${displayName} (${usernameDisplay})">
            ${avatarHtml}
            <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#22c55e;" title="Онлайн"></span>
            <svg class="nav-dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition:transform 0.2s ease;"><path d="M6 9l6 6 6-6"></path></svg>
          </button>
          <div class="nav-user-dropdown-menu" id="nav-user-dropdown-menu">
            <div class="nav-user-dropdown-header">
              <div class="nav-user-dropdown-name">${displayName}</div>
              <div class="nav-user-dropdown-sub">${usernameDisplay}</div>
            </div>
            <a href="/cabinet?tab=knowledge" class="nav-user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Личный Кабинет</span>
            </a>
            <a href="/profile" class="nav-user-dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Настройки Профиля</span>
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

  // If user is logged in, sync purchases & memberships in background
  if (Auth.isLoggedIn()) {
    Auth.fetchPurchasedItems();
    // Non-blocking subscription check if not checked recently
    const lastCheck = localStorage.getItem('asage_last_sub_check');
    const now = Date.now();
    if (!lastCheck || now - Number(lastCheck) > 1000 * 60 * 60 * 4) {
      Auth.checkTelegramSubscriptions(false);
      localStorage.setItem('asage_last_sub_check', String(now));
    }
  }

  // Handle URL Payment Return Parameters
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      Auth.showToast('✓ Оплата в Банке Точка успешно подтверждена! Доступ открыт.', 'success');
      Auth.fetchPurchasedItems();
      // Clean up URL
      params.delete('payment');
      params.delete('pid');
      const newQuery = params.toString() ? '?' + params.toString() : '';
      window.history.replaceState({}, '', window.location.pathname + newQuery + window.location.hash);
    } else if (params.get('pay_item')) {
      const itemId = params.get('pay_item');
      const itemType = params.get('type') || 'material';
      const amount = Number(params.get('amount') || 349);
      const title = decodeURIComponent(params.get('title') || 'Цифровой материал');
      const pid = params.get('pid') || '';
      Auth.openTochkaCheckoutModal({
        itemId,
        itemType,
        amount,
        title,
        purchaseId: pid,
        paymentUrl: '#'
      });
    }
  } catch (e) {}
});

window.addEventListener('asage_auth_changed', () => {
  Auth.updateHeaderUI();
  if (Auth.isLoggedIn()) {
    Auth.fetchPurchasedItems();
  }
});
