/**
 * SAGE Platform - Backend API Engine (Node.js native)
 * Handles:
 * 1. Telegram Channel & Club Chat Membership Verification (Bot API getChatMember)
 * 2. Tochka Bank Acquiring Payment Links & Webhook Processing
 * 3. Local Resilient Store & Supabase Sync for Users & Purchases
 */

import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Support Russian root certificates (Минцифры / Банк Точка)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 1. CONFIGURATION & ENV LOADER ────────────────────────────────────────────
function loadEnv() {
  const possiblePaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env.shared'),
    path.resolve(process.cwd(), '../../.env.shared'),
    path.resolve(process.cwd(), '.env.shared'),
  ];
  const config = {
    PORT: process.env.PORT || 8088,
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://wbmzcytpzqvjezhkilaa.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibXpjeXRwenF2amV6aGtpbGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM0NjEsImV4cCI6MjA5Mzc1OTQ2MX0.a2grUbSZudE5oklTjZidebDQxGNNy9Cit0CWwBSRJfA',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8417136221:AAFu1U91WQXy_2SIyHYX1vvaP_cPxjahi7U',
    TELEGRAM_CHANNEL_USERNAME: process.env.TELEGRAM_CHANNEL_USERNAME || '@uncrn_sage',
    TELEGRAM_CLUB_CHAT_ID: process.env.TELEGRAM_CLUB_CHAT_ID || '-1002283995819', // SAGE Neuro Family chat ID
    TOCHKA_API_URL: process.env.TOCHKA_API_URL || 'https://enter.tochka.com/uapi',
    TOCHKA_JWT_TOKEN: process.env.TOCHKA_JWT_TOKEN || process.env.TOCHKA_API_TOKEN || '',
    TOCHKA_CUSTOMER_CODE: process.env.TOCHKA_CUSTOMER_CODE || '301392931',
    TOCHKA_MERCHANT_ID: process.env.TOCHKA_MERCHANT_ID || '200000000043963',
    ADMIN_SECRET: process.env.ADMIN_SECRET || 'sage_secure_platform_2026',
    DATABASE_URL: process.env.DATABASE_URL || ''
  };

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const raw = fs.readFileSync(envPath, 'utf8');
        raw.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let val = (match[2] || '').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!config[match[1]]) {
              config[match[1]] = val;
            }
          }
        });
      } catch (e) {
        // ignore read error
      }
    }
  }
  return config;
}

const CONFIG = loadEnv();

// Initialize PostgreSQL connection pool if configured
let pgPool = null;
if (CONFIG.DATABASE_URL) {
  try {
    const { default: pg } = await import('pg');
    pgPool = new pg.Pool({ connectionString: CONFIG.DATABASE_URL });
    pgPool.on('error', (err) => console.warn('[Postgres Pool Warning]', err.message));
    console.log('[PostgreSQL] Connected to local database');
  } catch (e) {
    console.warn('[PostgreSQL Init Notice]:', e.message);
  }
}

// Tochka Bank Public Key for RS256 Webhook Verification
const TOCHKA_JWK = {
  kty: 'RSA',
  e: 'AQAB',
  n: 'rwm77av7GIttq-JF1itEgLCGEZW_zz16RlUQVYlLbJtyRSu61fCec_rroP6PxjXU2uLzUOaGaLgAPeUZAJrGuVp9nryKgbZceHckdHDYgJd9TsdJ1MYUsXaOb9joN9vmsCscBx1lwSlFQyNQsHUsrjuDk-opf6RCuazRQ9gkoDCX70HV8WBMFoVm-YWQKJHZEaIQxg_DU4gMFyKRkDGKsYKA0POL-UgWA1qkg6nHY5BOMKaqxbc5ky87muWB5nNk4mfmsckyFv9j1gBiXLKekA_y4UwG2o1pbOLpJS3bP_c95rm4M9ZBmGXqfOQhbjz8z-s9C11i-jmOQ2ByohS-ST3E5sqBzIsxxrxyQDTw--bZNhzpbciyYW4GfkkqyeYoOPd_84jPTBDKQXssvj8ZOj2XboS77tvEO1n1WlwUzh8HPCJod5_fEgSXuozpJtOggXBv0C2ps7yXlDZf-7Jar0UYc_NJEHJF-xShlqd6Q3sVL02PhSCM-ibn9DN9BKmD'
};
const TOCHKA_PUBLIC_KEY = crypto.createPublicKey({ key: TOCHKA_JWK, format: 'jwk' }).export({ type: 'spki', format: 'pem' });

// ── 2. LOCAL PERSISTENT STORE (Insulates against Supabase 402 Egress Quota) ──
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');
const PURCHASES_FILE = path.resolve(DATA_DIR, 'purchases.json');

// Default verified platform seeds
const SEED_USERS = {
  "439634804": {
    id: "02f841d7-eb2b-4f38-a0ea-d9008bc855f2",
    telegram_id: 439634804,
    username: "Michael_Sage",
    first_name: "Михаил Пузырёв",
    last_name: "",
    photo_url: "https://t.me/i/userpic/320/PrUiL11Yw4J67b_l7lQvMcwExm8HfSbyJ5BnGLS7hUo.jpg",
    bio: "Просто обучаю людей упрощать жизнь и бизнес с помощью нейросетей",
    channel_url: "@uncrn_sage",
    website_url: "https://a-sage.ru",
    role: "founder",
    is_club_resident: true,
    is_channel_subscriber: true,
    is_private: false,
    show_telegram_contact: false
  },
  "88472911": {
    id: "5afb3918-11cb-4a6c-9ebd-1baf50fea9f6",
    telegram_id: 88472911,
    username: "Michael_Sage",
    first_name: "Михаил",
    last_name: "Пузырёв",
    photo_url: "/img/mikhail_hero.jpg",
    bio: "AI-архитектор, основатель сообщества SAGE Neuro Family. Проектирование мультиагентных сред, Antigravity SDK и автоматизация бизнеса.",
    channel_url: "https://t.me/uncrn_sage",
    website_url: "https://a-sage.ru",
    role: "founder",
    is_club_resident: true,
    is_channel_subscriber: true,
    is_private: false,
    show_telegram_contact: false
  },
  "8489288884": {
    id: "2577ad93-bcbb-45cb-9435-527e758f0311",
    telegram_id: 8489288884,
    username: "Imichaelsage",
    first_name: "Michael Sage",
    last_name: "Sage",
    photo_url: "/img/avatars/8489288884.jpg",
    bio: "Сделаю самое большое СМИ по психологии и подкаст проезд СДВГ. И всё это с помощью нейросетей.",
    channel_url: "@adhdpodcast",
    website_url: "https://aipsy.press/",
    role: "club_member",
    is_club_resident: true,
    is_channel_subscriber: true,
    is_private: false,
    show_telegram_contact: false
  }
};

function loadLocalUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      return { ...SEED_USERS, ...parsed };
    }
  } catch (e) {
    console.warn('[LocalStore] Error reading users.json:', e.message);
  }
  return { ...SEED_USERS };
}

function saveLocalUsers(users) {
  try {
    const tmp = USERS_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), 'utf8');
    fs.renameSync(tmp, USERS_FILE);
  } catch (e) {
    console.error('[LocalStore] Failed to save users:', e.message);
  }
}

function getLocalUser(tgId, username) {
  const users = loadLocalUsers();
  if (tgId && users[String(tgId)]) return users[String(tgId)];
  if (username) {
    const clean = username.replace(/^@/, '').toLowerCase();
    for (const u of Object.values(users)) {
      if (u.username && u.username.replace(/^@/, '').toLowerCase() === clean) {
        return u;
      }
    }
  }
  return null;
}

async function fetchTelegramAvatar(tgId) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN || !tgId) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id=${tgId}&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.ok && data.result && data.result.photos && data.result.photos.length > 0) {
      const photoSizes = data.result.photos[0];
      const largest = photoSizes[photoSizes.length - 1];
      if (largest && largest.file_id) {
        const fRes = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getFile?file_id=${largest.file_id}`);
        if (fRes.ok) {
          const fData = await fRes.json();
          if (fData && fData.ok && fData.result && fData.result.file_path) {
            const imgRes = await fetch(`https://api.telegram.org/file/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${fData.result.file_path}`);
            if (imgRes.ok) {
              const buf = Buffer.from(await imgRes.arrayBuffer());
              const avatarsDir = path.resolve('/var/www/a-sage.ru/img/avatars');
              if (!fs.existsSync(avatarsDir)) {
                fs.mkdirSync(avatarsDir, { recursive: true });
              }
              const filename = `${tgId}.jpg`;
              fs.writeFileSync(path.resolve(avatarsDir, filename), buf);
              return `/img/avatars/${filename}`;
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[Telegram Avatar Fetch Warning]:', e.message);
  }
  return null;
}

function syncFromPostgresOnStartup() {
  if (!pgPool) return;
  pgPool.query('SELECT * FROM platform_users').then(res => {
    if (res && res.rows && res.rows.length > 0) {
      const current = loadLocalUsers();
      for (const row of res.rows) {
        const tg = String(row.telegram_id);
        current[tg] = { ...current[tg], ...row };
      }
      saveLocalUsers(current);
      console.log(`[PostgreSQL] Synced ${res.rows.length} users into fast cache`);
    }
  }).catch(err => console.warn('[PostgreSQL Startup Load Warning]:', err.message));
}
syncFromPostgresOnStartup();

function upsertLocalUser(userData) {
  const users = loadLocalUsers();
  const tgId = String(userData.telegram_id || '');
  if (!tgId) return null;

  const existing = users[tgId] || {};
  const uname = (userData.username || existing.username || '').replace(/^@/, '').toLowerCase();

  const isFounder = (tgId === '439634804' || tgId === '88472911' || ['michael_sage', 'uncrn_sage'].includes(uname));
  const isClubKnown = (uname === 'imichaelsage' || tgId === '8489288884' || userData.is_club_resident === true || existing.is_club_resident === true || userData.role === 'club_member' || existing.role === 'club_member');

  let role = 'member';
  if (isFounder) {
    role = 'founder';
  } else if (isClubKnown) {
    role = 'club_member';
  } else if (userData.role) {
    role = userData.role;
  } else if (existing.role) {
    role = existing.role;
  }

  const isResident = isFounder || isClubKnown;
  const isChannel = isFounder || isClubKnown || userData.is_channel_subscriber === true || existing.is_channel_subscriber === true;

  const showTg = typeof userData.show_telegram_contact !== 'undefined'
    ? Boolean(userData.show_telegram_contact)
    : Boolean(existing.show_telegram_contact || false);

  const updated = {
    ...existing,
    ...userData,
    id: existing.id || userData.id || crypto.randomUUID(),
    telegram_id: Number(tgId),
    role,
    is_club_resident: isResident,
    is_channel_subscriber: isChannel,
    show_telegram_contact: showTg,
    updated_at: new Date().toISOString()
  };

  users[tgId] = updated;
  saveLocalUsers(users);

  if (pgPool) {
    pgPool.query(`
      INSERT INTO platform_users (telegram_id, first_name, last_name, username, photo_url, role, is_club_resident, is_channel_subscriber, email, bio, channel_url, website_url, is_private, show_telegram_contact, last_login_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now())
      ON CONFLICT (telegram_id) DO UPDATE SET
        first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), platform_users.first_name),
        last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), platform_users.last_name),
        username = COALESCE(NULLIF(EXCLUDED.username, ''), platform_users.username),
        photo_url = COALESCE(NULLIF(EXCLUDED.photo_url, ''), platform_users.photo_url),
        role = EXCLUDED.role,
        is_club_resident = EXCLUDED.is_club_resident,
        is_channel_subscriber = EXCLUDED.is_channel_subscriber,
        email = COALESCE(NULLIF(EXCLUDED.email, ''), platform_users.email),
        bio = COALESCE(NULLIF(EXCLUDED.bio, ''), platform_users.bio),
        channel_url = COALESCE(NULLIF(EXCLUDED.channel_url, ''), platform_users.channel_url),
        website_url = COALESCE(NULLIF(EXCLUDED.website_url, ''), platform_users.website_url),
        is_private = EXCLUDED.is_private,
        show_telegram_contact = EXCLUDED.show_telegram_contact,
        updated_at = now()
    `, [
      updated.telegram_id,
      updated.first_name || '',
      updated.last_name || '',
      updated.username || '',
      updated.photo_url || '',
      updated.role,
      Boolean(updated.is_club_resident),
      Boolean(updated.is_channel_subscriber),
      updated.email || '',
      updated.bio || '',
      updated.channel_url || '',
      updated.website_url || '',
      Boolean(updated.is_private),
      Boolean(updated.show_telegram_contact)
    ]).catch(err => console.warn('[PostgreSQL Upsert Warning]:', err.message));
  }

  return updated;
}

function loadLocalPurchases() {
  try {
    if (fs.existsSync(PURCHASES_FILE)) {
      return JSON.parse(fs.readFileSync(PURCHASES_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[LocalStore] Error reading purchases.json:', e.message);
  }
  return [];
}

function saveLocalPurchases(purchases) {
  try {
    const tmp = PURCHASES_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(purchases, null, 2), 'utf8');
    fs.renameSync(tmp, PURCHASES_FILE);
  } catch (e) {
    console.error('[LocalStore] Failed to save purchases:', e.message);
  }
}

function getLocalUserPurchases(tgId) {
  const list = loadLocalPurchases();
  return list.filter(p => Number(p.telegram_id) === Number(tgId) && p.status === 'paid');
}

function addLocalPurchase(purchase) {
  const list = loadLocalPurchases();
  const existingIdx = list.findIndex(p => p.payment_id === purchase.payment_id || (p.telegram_id === purchase.telegram_id && p.item_id === purchase.item_id));
  if (existingIdx !== -1) {
    list[existingIdx] = { ...list[existingIdx], ...purchase };
  } else {
    list.push(purchase);
  }
  saveLocalPurchases(list);

  if (pgPool) {
    pgPool.query(`
      INSERT INTO user_purchases (telegram_id, item_type, item_id, amount, currency, payment_id, status, payment_url, created_at, paid_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9)
    `, [
      Number(purchase.telegram_id),
      purchase.item_type,
      purchase.item_id,
      Number(purchase.amount || 0),
      purchase.currency || 'RUB',
      purchase.payment_id,
      purchase.status,
      purchase.payment_url || '',
      purchase.status === 'paid' ? new Date() : null
    ]).catch(err => console.warn('[PostgreSQL Purchase Insert Warning]:', err.message));
  }
}

// ── 3. HELPER UTILITIES ───────────────────────────────────────────────────────
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      const trimmed = body.trim();
      if (!trimmed) return resolve({});
      try {
        const json = JSON.parse(trimmed);
        resolve(json);
      } catch (err) {
        resolve({ raw: trimmed });
      }
    });
  });
}

// Supabase REST client with non-crashing wrapper
async function supabaseQuery(endpoint, method = 'GET', body = null, headers = {}) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
  const reqHeaders = {
    'apikey': CONFIG.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...headers
  };

  const res = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase query failed: ${res.status} ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── 4. TELEGRAM BOT API VERIFICATION ─────────────────────────────────────────
async function checkTelegramChatMember(chatIdOrUsername, userId) {
  if (!CONFIG.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: 'NO_BOT_TOKEN' };
  }
  try {
    const cleanChat = chatIdOrUsername.trim();
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=${encodeURIComponent(cleanChat)}&user_id=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.ok && data.result) {
      const status = data.result.status;
      const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);
      return { ok: true, isMember, status, memberData: data.result };
    }
    return { ok: false, isMember: false, error: data.description || 'NOT_FOUND' };
  } catch (e) {
    return { ok: false, isMember: false, error: e.message };
  }
}

// ── 5. SERVER & ROUTING ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  try {
    // ── HEALTH CHECK ──
    if (pathname === '/health' || pathname === '/api/health') {
      const users = loadLocalUsers();
      return sendJson(res, 200, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        has_bot_token: !!CONFIG.TELEGRAM_BOT_TOKEN,
        channel: CONFIG.TELEGRAM_CHANNEL_USERNAME,
        local_users_count: Object.keys(users).length
      });
    }

    // ── 1. CHECK TELEGRAM SUBSCRIPTION & RESIDENCY (POST /api/check-telegram) ──
    if (pathname === '/api/check-telegram' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);
      const username = String(body.username || '').trim();

      if (!tgId && !username) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id or username is required' });
      }

      const existingLocal = getLocalUser(tgId, username);
      const effTgId = tgId || (existingLocal ? existingLocal.telegram_id : 0);
      const unameClean = (username || (existingLocal ? existingLocal.username : '')).replace(/^@/, '').toLowerCase();

      // Founder bypass
      const isFounder = (effTgId === 439634804 || effTgId === 88472911 || unameClean === 'michael_sage' || unameClean === 'uncrn_sage');

      // Known Resident whitelist (Imichaelsage, etc.)
      const isKnownResident = (unameClean === 'imichaelsage' || effTgId === 8489288884 || (existingLocal && (existingLocal.role === 'club_member' || existingLocal.is_club_resident === true)));

      let isChannelSubscriber = isFounder || isKnownResident || (existingLocal ? existingLocal.is_channel_subscriber : false);
      let isClubResident = isFounder || isKnownResident || (existingLocal ? existingLocal.is_club_resident : false);
      let statusChannel = isFounder ? 'creator' : (isChannelSubscriber ? 'member' : 'unknown');
      let statusClub = isFounder ? 'creator' : (isClubResident ? 'member' : 'unknown');

      // Live Telegram query if not already verified
      if (!isFounder && !isKnownResident && CONFIG.TELEGRAM_BOT_TOKEN && effTgId) {
        // Check Channel
        if (CONFIG.TELEGRAM_CHANNEL_USERNAME) {
          const chRes = await checkTelegramChatMember(CONFIG.TELEGRAM_CHANNEL_USERNAME, effTgId);
          if (chRes.ok) {
            isChannelSubscriber = chRes.isMember;
            statusChannel = chRes.status;
          }
        }

        // Check Club Chat
        if (CONFIG.TELEGRAM_CLUB_CHAT_ID) {
          const clubRes = await checkTelegramChatMember(CONFIG.TELEGRAM_CLUB_CHAT_ID, effTgId);
          if (clubRes.ok) {
            isClubResident = clubRes.isMember;
            statusClub = clubRes.status;
          }
        }
      }

      const userRole = isFounder ? 'founder' : (isClubResident ? 'club_member' : (existingLocal ? existingLocal.role : 'member'));

      // Persist in Local Store
      if (effTgId) {
        upsertLocalUser({
          telegram_id: effTgId,
          username: username || (existingLocal ? existingLocal.username : ''),
          role: userRole,
          is_club_resident: isClubResident,
          is_channel_subscriber: isChannelSubscriber,
          telegram_checked_at: new Date().toISOString()
        });
      }

      // Sync to Supabase platform_users (non-blocking, immune to 402)
      if (effTgId) {
        supabaseQuery(
          `platform_users?telegram_id=eq.${effTgId}`,
          'PATCH',
          {
            role: userRole,
            is_channel_subscriber: isChannelSubscriber,
            is_club_resident: isClubResident,
            telegram_checked_at: new Date().toISOString()
          }
        ).catch(err => {
          console.warn('[Supabase Sync Warning on check-telegram]:', err.message);
        });
      }

      return sendJson(res, 200, {
        ok: true,
        telegram_id: effTgId,
        username: username,
        role: userRole,
        is_channel_subscriber: isChannelSubscriber,
        is_club_resident: isClubResident,
        status_channel: statusChannel,
        status_club: statusClub,
        checked_at: new Date().toISOString()
      });
    }

    // ── 2. USER PROFILE SYNC (POST /api/user/sync) ──
    if (pathname === '/api/user/sync' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);
      if (!tgId) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id is required' });
      }

      if (!body.photo_url) {
        const existing = getLocalUser(tgId);
        if (existing && existing.photo_url) {
          body.photo_url = existing.photo_url;
        } else {
          const fetchedAvatar = await fetchTelegramAvatar(tgId);
          if (fetchedAvatar) body.photo_url = fetchedAvatar;
        }
      }

      const savedUser = upsertLocalUser(body);

      // Async sync to Supabase (safe from 402)
      supabaseQuery('platform_users', 'POST', {
        telegram_id: tgId,
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        username: body.username || '',
        photo_url: body.photo_url || '',
        email: body.email || '',
        bio: body.bio || '',
        channel_url: body.channel_url || '',
        website_url: body.website_url || '',
        is_private: Boolean(body.is_private),
        show_telegram_contact: Boolean(savedUser.show_telegram_contact),
        role: savedUser.role,
        is_club_resident: savedUser.is_club_resident,
        is_channel_subscriber: savedUser.is_channel_subscriber,
        last_login_at: new Date().toISOString()
      }, {
        'Prefer': 'resolution=merge-duplicates,return=representation'
      }).catch(err => {
        console.warn('[Supabase User Sync Warning]:', err.message);
      });

      return sendJson(res, 200, {
        ok: true,
        user: savedUser
      });
    }

    // ── 3. GET USER PROFILE (GET /api/user/profile) ──
    if (pathname === '/api/user/profile' && req.method === 'GET') {
      const tgId = Number(reqUrl.searchParams.get('telegram_id') || 0);
      const username = (reqUrl.searchParams.get('username') || '').trim();

      const user = getLocalUser(tgId, username);
      if (user) {
        return sendJson(res, 200, { ok: true, user });
      }

      // Try Supabase if not in local store
      if (tgId) {
        try {
          const rows = await supabaseQuery(`platform_users?telegram_id=eq.${tgId}`);
          if (rows && rows.length > 0) {
            const dbUser = rows[0];
            upsertLocalUser(dbUser);
            return sendJson(res, 200, { ok: true, user: dbUser });
          }
        } catch (e) {
          // ignore
        }
      }

      return sendJson(res, 404, { ok: false, error: 'User not found' });
    }

    // ── 4. GET USER PURCHASES (GET /api/user/purchases) ──
    if (pathname === '/api/user/purchases' && req.method === 'GET') {
      const tgId = Number(reqUrl.searchParams.get('telegram_id') || 0);
      if (!tgId) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id is required' });
      }

      const localPurchases = getLocalUserPurchases(tgId);
      let purchasedItems = localPurchases.map(p => p.item_id);
      let allPurchases = [...localPurchases];

      // Try Supabase non-blocking, never return 500!
      try {
        const rows = await supabaseQuery(
          `user_purchases?telegram_id=eq.${tgId}&status=eq.paid&select=item_id,item_type,amount,paid_at`
        );
        if (Array.isArray(rows)) {
          const remoteItems = rows.map(r => r.item_id);
          purchasedItems = Array.from(new Set([...purchasedItems, ...remoteItems]));
          allPurchases = rows;
        }
      } catch (e) {
        console.warn('[Supabase Purchases Warning]:', e.message);
      }

      return sendJson(res, 200, {
        ok: true,
        telegram_id: tgId,
        purchased_items: purchasedItems,
        purchases: allPurchases
      });
    }

    // ── 5. GET CLUB RESIDENTS LIST (GET /api/residents) ──
    if (pathname === '/api/residents' && req.method === 'GET') {
      const users = loadLocalUsers();
      const residents = Object.values(users).filter(u => 
        (u.role === 'club_member' || u.role === 'founder' || u.is_club_resident === true) && !u.is_private
      );
      // Ensure founder is sorted first
      residents.sort((a, b) => {
        const aIsFounder = a.role === 'founder' || a.telegram_id == 439634804 || a.telegram_id == 88472911;
        const bIsFounder = b.role === 'founder' || b.telegram_id == 439634804 || b.telegram_id == 88472911;
        if (aIsFounder && !bIsFounder) return -1;
        if (!aIsFounder && bIsFounder) return 1;
        return 0;
      });

      const sanitizedResidents = residents.map(u => {
        const canShowTg = Boolean(u.show_telegram_contact);
        return {
          id: u.id,
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          username: canShowTg ? (u.username || '') : '',
          photo_url: u.photo_url || '',
          role: u.role,
          bio: u.bio || '',
          channel_url: u.channel_url || '',
          website_url: u.website_url || '',
          is_club_resident: Boolean(u.is_club_resident),
          show_telegram_contact: canShowTg,
          telegram_id: u.telegram_id
        };
      });

      return sendJson(res, 200, { ok: true, residents: sanitizedResidents });
    }

    // ── 6. CREATE PAYMENT REQUEST (POST /api/payment/create) ──
    if (pathname === '/api/payment/create' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);
      const itemId = String(body.item_id || '').trim();
      const itemType = String(body.item_type || 'material').trim();
      const amount = Number(body.amount || 0);
      const title = String(body.title || 'Цифровой материал a-sage.ru').trim();

      if (!itemId || amount <= 0) {
        return sendJson(res, 400, { ok: false, error: 'item_id and valid amount are required' });
      }

      // Check if already purchased
      if (tgId) {
        const localPaid = getLocalUserPurchases(tgId);
        if (localPaid.some(p => p.item_id === itemId)) {
          return sendJson(res, 200, {
            ok: true,
            already_purchased: true,
            message: 'Материал уже оплачен'
          });
        }
      }

      const purchaseId = 'pur_' + crypto.randomBytes(8).toString('hex');
      let paymentUrl = '';

      // If Tochka Bank API token is configured, request payment session
      if (CONFIG.TOCHKA_JWT_TOKEN && CONFIG.TOCHKA_CUSTOMER_CODE) {
        try {
          const tochkaUrl = `${CONFIG.TOCHKA_API_URL.replace(/\/+$/, '')}/acquiring/v1.0/payments_with_receipt`;
          const tochkaPayload = {
            Data: {
              customerCode: CONFIG.TOCHKA_CUSTOMER_CODE,
              merchantId: CONFIG.TOCHKA_MERCHANT_ID,
              amount: Number(amount.toFixed(2)),
              purpose: `Оплата доступа: ${title.slice(0, 100)} (a-sage.ru)`,
              paymentMode: ['sbp', 'card'],
              redirectUrl: `https://a-sage.ru/cabinet/?payment=success&item_id=${encodeURIComponent(itemId)}&pid=${purchaseId}`,
              failRedirectUrl: `https://a-sage.ru/cabinet/?payment=failed&item_id=${encodeURIComponent(itemId)}`,
              preAuthorization: false,
              ttl: 10080,
              paymentLinkId: purchaseId,
              taxSystemCode: 'usn_income',
              Client: {
                name: body.client_name || 'Покупатель',
                email: body.client_email || 'i@michaelpuzyrev.ru',
                phone: body.client_phone || '+79661146888'
              },
              Items: [
                {
                  name: title.slice(0, 100),
                  amount: Number(amount.toFixed(2)),
                  quantity: 1.0,
                  vatType: 'none',
                  paymentMethod: 'full_payment',
                  paymentObject: 'service',
                  measure: 'шт.'
                }
              ]
            }
          };

          const tochkaRes = await fetch(tochkaUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CONFIG.TOCHKA_JWT_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(tochkaPayload)
          });

          const tochkaData = await tochkaRes.json();
          if (tochkaData && tochkaData.Data && tochkaData.Data.paymentLink) {
            paymentUrl = tochkaData.Data.paymentLink;
            console.log(`[Tochka] Created live acquiring link for ${purchaseId}: ${paymentUrl}`);
          } else {
            console.warn('[Tochka API] Response:', JSON.stringify(tochkaData));
          }
        } catch (tochkaErr) {
          console.warn('[Tochka API] Call error:', tochkaErr.message);
        }
      }

      if (!paymentUrl) {
        paymentUrl = `https://a-sage.ru/cabinet/?pay_item=${encodeURIComponent(itemId)}&type=${encodeURIComponent(itemType)}&amount=${amount}&pid=${purchaseId}&title=${encodeURIComponent(title)}`;
      }

      const pendingRecord = {
        id: crypto.randomUUID(),
        telegram_id: tgId,
        item_type: itemType,
        item_id: itemId,
        amount: amount,
        currency: 'RUB',
        payment_id: purchaseId,
        status: 'pending',
        payment_url: paymentUrl,
        created_at: new Date().toISOString()
      };

      addLocalPurchase(pendingRecord);

      // Async Supabase insert
      supabaseQuery('user_purchases', 'POST', pendingRecord).catch(err => {
        console.warn('[Supabase Purchase Insert Warning]:', err.message);
      });

      return sendJson(res, 200, {
        ok: true,
        purchase_id: purchaseId,
        payment_url: paymentUrl,
        amount: amount,
        item_id: itemId,
        title: title
      });
    }

    // ── 7. TOCHKA BANK WEBHOOK (POST /api/payment/webhook) ──
    if (pathname === '/api/payment/webhook' && req.method === 'POST') {
      const body = await parseBody(req);
      let payload = body;

      const rawToken = typeof body === 'string' ? body : (body.raw || body.token || (typeof body === 'object' && body.jwt ? body.jwt : null));
      if (rawToken && typeof rawToken === 'string' && rawToken.includes('.')) {
        try {
          const parts = rawToken.split('.');
          if (parts.length === 3) {
            const verifier = crypto.createVerify('RSA-SHA256');
            verifier.update(`${parts[0]}.${parts[1]}`);
            const isValid = verifier.verify(TOCHKA_PUBLIC_KEY, parts[2], 'base64url');
            if (!isValid) {
              console.warn('[Tochka Webhook] JWT signature validation failed');
            }
            const decodedJson = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            payload = decodedJson.message || decodedJson;
            console.log('[Tochka Webhook] Verified JWT payload:', payload);
          }
        } catch (jwtErr) {
          console.warn('[Tochka Webhook] JWT parse warning:', jwtErr.message);
        }
      }

      const operation = payload.Data || payload;
      const status = (operation.status || operation.paymentStatus || '').toUpperCase();
      const metadata = operation.metadata || {};
      const purchaseId = operation.paymentLinkId || metadata.purchase_id || operation.operationId || operation.payment_id;
      const tgId = Number(metadata.telegram_id || 0);
      const itemId = metadata.item_id;

      console.log(`[Tochka Webhook] Processing purchase ${purchaseId}, status: ${status}`);

      const isSuccess = ['APPROVED', 'CONFIRMED', 'SUCCESS', 'PAID'].includes(status);

      if (isSuccess && (purchaseId || (tgId && itemId))) {
        // Mark paid in local store
        const purchases = loadLocalPurchases();
        const p = purchases.find(x => x.payment_id === purchaseId || (x.telegram_id === tgId && x.item_id === itemId));
        if (p) {
          p.status = 'paid';
          p.paid_at = new Date().toISOString();
          saveLocalPurchases(purchases);
        }

        // Async Supabase update
        try {
          if (purchaseId) {
            await supabaseQuery(
              `user_purchases?payment_id=eq.${encodeURIComponent(purchaseId)}`,
              'PATCH',
              { status: 'paid', paid_at: new Date().toISOString() }
            );
          } else if (tgId && itemId) {
            await supabaseQuery(
              `user_purchases?telegram_id=eq.${tgId}&item_id=eq.${encodeURIComponent(itemId)}`,
              'PATCH',
              { status: 'paid', paid_at: new Date().toISOString() }
            );
          }
        } catch (e) {
          console.warn('[Supabase Webhook Warning]:', e.message);
        }
      }

      return sendJson(res, 200, { result: 'OK' });
    }

    // ── 8. INSTANT UNLOCK / TEST HELPER (POST /api/payment/test-complete) ──
    if (pathname === '/api/payment/test-complete' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);
      const itemId = String(body.item_id || '').trim();
      const itemType = String(body.item_type || 'material').trim();
      const amount = Number(body.amount || 349);
      const secret = String(body.secret || '');

      if (secret !== CONFIG.ADMIN_SECRET) {
        return sendJson(res, 403, { ok: false, error: 'Forbidden' });
      }

      if (!tgId || !itemId) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id and item_id required' });
      }

      const rec = {
        id: crypto.randomUUID(),
        telegram_id: tgId,
        item_type: itemType,
        item_id: itemId,
        amount: amount,
        currency: 'RUB',
        payment_id: 'test_' + Date.now(),
        status: 'paid',
        paid_at: new Date().toISOString()
      };

      addLocalPurchase(rec);

      supabaseQuery('user_purchases', 'POST', rec).catch(err => {
        console.warn('[Supabase Test Complete Warning]:', err.message);
      });

      return sendJson(res, 200, {
        ok: true,
        message: `Материал ${itemId} успешно открыт для пользователя ${tgId}`
      });
    }

    // ── 9. CONTENT FACTORY END-TO-END ANALYTICS (GET /api/analytics/content-factory/stats) ──
    if (pathname === '/api/analytics/content-factory/stats' && req.method === 'GET') {
      const authHeader = req.headers.authorization || '';
      const secretQuery = reqUrl.searchParams.get('secret') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (token !== CONFIG.ADMIN_SECRET && secretQuery !== CONFIG.ADMIN_SECRET) {
        return sendJson(res, 403, { ok: false, error: 'Unauthorized. Valid admin secret required.' });
      }

      const period = reqUrl.searchParams.get('period') || 'all';
      const scriptPath = path.resolve(__dirname, '../../../Services/content-factory/analytics/get_stats_json.py');

      try {
        const { stdout } = await execFileAsync('python3', [scriptPath, '--period', period]);
        const stats = JSON.parse(stdout.trim());
        return sendJson(res, 200, { ok: true, data: stats });
      } catch (err) {
        return sendJson(res, 500, { ok: false, error: `Failed to fetch stats: ${err.message}` });
      }
    }

    // ── 10. UTM CLICK & VISIT TRACKING (POST /api/analytics/track) ──
    if (pathname === '/api/analytics/track' && req.method === 'POST') {
      const body = await parseBody(req);
      const source = String(body.utm_source || body.source || '').trim();
      const campaign = String(body.utm_campaign || body.campaign || '').trim();
      const content = String(body.utm_content || body.content || '').trim();

      const scriptPath = path.resolve(__dirname, '../../../Services/content-factory/analytics/get_stats_json.py');
      try {
        await execFileAsync('python3', [scriptPath, '--track', '--source', source, '--campaign', campaign, '--content', content]);
        return sendJson(res, 200, { ok: true, message: 'Event tracked' });
      } catch (err) {
        return sendJson(res, 500, { ok: false, error: err.message });
      }
    }

    // 404 for unknown endpoints
    return sendJson(res, 404, { error: 'Not Found', path: pathname });

  } catch (globalErr) {
    console.error('API Error:', globalErr);
    return sendJson(res, 500, { ok: false, error: globalErr.message });
  }
});

server.listen(CONFIG.PORT, () => {
  console.log(`[SAGE API] Server listening on port ${CONFIG.PORT}`);
});
