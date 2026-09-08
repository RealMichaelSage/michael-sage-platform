/**
 * SAGE Platform - Backend API Engine (Node.js native)
 * Handles:
 * 1. Telegram Channel & Club Chat Membership Verification (Bot API getChatMember)
 * 2. Tochka Bank Acquiring Payment Links & Webhook Processing
 * 3. Supabase User Purchases & Access Entitlements
 */

import http from 'node:http';
import https from 'node:https';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// ── 1. CONFIGURATION & ENV LOADER ────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const config = {
    PORT: process.env.PORT || 8088,
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://wbmzcytpzqvjezhkilaa.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibXpjeXRwenF2amV6aGtpbGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODM0NjEsImV4cCI6MjA5Mzc1OTQ2MX0.a2grUbSZudE5oklTjZidebDQxGNNy9Cit0CWwBSRJfA',
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '8842421397:AAHDmucImLu8nKDg2OlDRKghoqaf5bUHRa0',
    TELEGRAM_CHANNEL_USERNAME: process.env.TELEGRAM_CHANNEL_USERNAME || '@uncrn_sage',
    TELEGRAM_CLUB_CHAT_ID: process.env.TELEGRAM_CLUB_CHAT_ID || '', // Numeric ID (e.g. -100...)
    TOCHKA_API_TOKEN: process.env.TOCHKA_API_TOKEN || '',
    TOCHKA_ACCOUNT_ID: process.env.TOCHKA_ACCOUNT_ID || '',
    TOCHKA_WEBHOOK_SECRET: process.env.TOCHKA_WEBHOOK_SECRET || '',
    ADMIN_SECRET: process.env.ADMIN_SECRET || 'sage_secure_platform_2026'
  };

  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        config[match[1]] = val;
      }
    });
  }
  return config;
}

const CONFIG = loadEnv();

// ── 2. HELPER UTILITIES ───────────────────────────────────────────────────────
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
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

// Supabase REST client
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

// ── 3. TELEGRAM BOT API VERIFICATION ─────────────────────────────────────────
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

// ── 4. SERVER & ROUTING ───────────────────────────────────────────────────────
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
      return sendJson(res, 200, {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        has_bot_token: !!CONFIG.TELEGRAM_BOT_TOKEN,
        channel: CONFIG.TELEGRAM_CHANNEL_USERNAME
      });
    }

    // ── 1. CHECK TELEGRAM SUBSCRIPTION (POST /api/check-telegram) ──
    if (pathname === '/api/check-telegram' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);

      if (!tgId) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id is required' });
      }

      // Founder bypass
      const isFounder = (tgId === 439634804 || tgId === 88472911);
      let isChannelSubscriber = isFounder;
      let isClubResident = isFounder;
      let statusChannel = isFounder ? 'creator' : 'unknown';
      let statusClub = isFounder ? 'creator' : 'unknown';

      if (!isFounder && CONFIG.TELEGRAM_BOT_TOKEN) {
        // Check Channel
        if (CONFIG.TELEGRAM_CHANNEL_USERNAME) {
          const chRes = await checkTelegramChatMember(CONFIG.TELEGRAM_CHANNEL_USERNAME, tgId);
          if (chRes.ok) {
            isChannelSubscriber = chRes.isMember;
            statusChannel = chRes.status;
          }
        }

        // Check Club Chat
        if (CONFIG.TELEGRAM_CLUB_CHAT_ID) {
          const clubRes = await checkTelegramChatMember(CONFIG.TELEGRAM_CLUB_CHAT_ID, tgId);
          if (clubRes.ok) {
            isClubResident = clubRes.isMember;
            statusClub = clubRes.status;
          }
        }
      }

      // Update in Supabase platform_users
      try {
        await supabaseQuery(
          `platform_users?telegram_id=eq.${tgId}`,
          'PATCH',
          {
            is_channel_subscriber: isChannelSubscriber,
            is_club_resident: isClubResident,
            telegram_checked_at: new Date().toISOString()
          }
        );
      } catch (err) {
        console.warn('Could not update platform_users in Supabase:', err.message);
      }

      return sendJson(res, 200, {
        ok: true,
        telegram_id: tgId,
        is_channel_subscriber: isChannelSubscriber,
        is_club_resident: isClubResident,
        status_channel: statusChannel,
        status_club: statusClub,
        checked_at: new Date().toISOString()
      });
    }

    // ── 2. GET USER PURCHASES (GET /api/user/purchases) ──
    if (pathname === '/api/user/purchases' && req.method === 'GET') {
      const tgId = Number(reqUrl.searchParams.get('telegram_id') || 0);
      if (!tgId) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id is required' });
      }

      try {
        const rows = await supabaseQuery(
          `user_purchases?telegram_id=eq.${tgId}&status=eq.paid&select=item_id,item_type,amount,paid_at`
        );
        const purchasedItems = (rows || []).map(r => r.item_id);

        return sendJson(res, 200, {
          ok: true,
          telegram_id: tgId,
          purchased_items: purchasedItems,
          purchases: rows || []
        });
      } catch (e) {
        return sendJson(res, 500, { ok: false, error: e.message });
      }
    }

    // ── 3. CREATE PAYMENT REQUEST (POST /api/payment/create) ──
    if (pathname === '/api/payment/create' && req.method === 'POST') {
      const body = await parseBody(req);
      const tgId = Number(body.telegram_id || 0);
      const itemId = String(body.item_id || '').trim();
      const itemType = String(body.item_type || 'material').trim();
      const amount = Number(body.amount || 0);
      const title = String(body.title || 'Цифровой материал a-sage.ru').trim();

      if (!tgId || !itemId || amount <= 0) {
        return sendJson(res, 400, { ok: false, error: 'telegram_id, item_id and valid amount are required' });
      }

      // Check if already purchased
      try {
        const existing = await supabaseQuery(
          `user_purchases?telegram_id=eq.${tgId}&item_id=eq.${encodeURIComponent(itemId)}&status=eq.paid&select=id`
        );
        if (existing && existing.length > 0) {
          return sendJson(res, 200, {
            ok: true,
            already_purchased: true,
            message: 'Материал уже оплачен'
          });
        }
      } catch (e) {
        // ignore and continue
      }

      const purchaseId = 'pur_' + crypto.randomBytes(8).toString('hex');
      let paymentUrl = '';

      // If Tochka Bank API token is configured, request payment session
      if (CONFIG.TOCHKA_API_TOKEN && CONFIG.TOCHKA_ACCOUNT_ID) {
        try {
          const tochkaRes = await fetch('https://enter.tochka.com/api/v1/payment_requests', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CONFIG.TOCHKA_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Data: {
                account: CONFIG.TOCHKA_ACCOUNT_ID,
                amount: amount.toFixed(2),
                currency: 'RUB',
                purpose: `Оплата доступа: ${title.slice(0, 100)} (a-sage.ru)`,
                paymentMode: ['sbp', 'card'],
                redirectUrl: `https://a-sage.ru/cabinet/?payment=success&item_id=${encodeURIComponent(itemId)}&pid=${purchaseId}`,
                failRedirectUrl: `https://a-sage.ru/cabinet/?payment=failed&item_id=${encodeURIComponent(itemId)}`,
                metadata: {
                  purchase_id: purchaseId,
                  telegram_id: String(tgId),
                  item_id: itemId,
                  item_type: itemType
                }
              }
            })
          });

          const tochkaData = await tochkaRes.json();
          if (tochkaData && tochkaData.Data && tochkaData.Data.paymentLink) {
            paymentUrl = tochkaData.Data.paymentLink;
          }
        } catch (tochkaErr) {
          console.warn('Tochka API call error:', tochkaErr.message);
        }
      }

      // Fallback checkout / mock payment URL if API keys not set or for instant testing
      if (!paymentUrl) {
        paymentUrl = `https://a-sage.ru/cabinet/?pay_item=${encodeURIComponent(itemId)}&type=${encodeURIComponent(itemType)}&amount=${amount}&pid=${purchaseId}&title=${encodeURIComponent(title)}`;
      }

      // Insert pending purchase in Supabase
      try {
        await supabaseQuery('user_purchases', 'POST', {
          id: crypto.randomUUID(),
          telegram_id: tgId,
          item_type: itemType,
          item_id: itemId,
          amount: amount,
          currency: 'RUB',
          payment_id: purchaseId,
          status: 'pending',
          payment_url: paymentUrl
        });
      } catch (insertErr) {
        console.error('Error inserting pending purchase:', insertErr.message);
      }

      return sendJson(res, 200, {
        ok: true,
        purchase_id: purchaseId,
        payment_url: paymentUrl,
        amount: amount,
        item_id: itemId,
        title: title
      });
    }

    // ── 4. TOCHKA BANK WEBHOOK (POST /api/payment/webhook) ──
    if (pathname === '/api/payment/webhook' && req.method === 'POST') {
      const body = await parseBody(req);
      console.log('Incoming payment webhook:', JSON.stringify(body));

      // Extract purchase identifier & status from Tochka webhook payload
      const operation = body.Data || body;
      const status = (operation.status || operation.paymentStatus || '').toUpperCase();
      const metadata = operation.metadata || {};
      const purchaseId = metadata.purchase_id || operation.operationId || operation.payment_id;
      const tgId = Number(metadata.telegram_id || 0);
      const itemId = metadata.item_id;

      const isSuccess = ['PAID', 'SUCCESS', 'COMPLETED', 'CONFIRMED'].includes(status);

      if (isSuccess && (purchaseId || (tgId && itemId))) {
        try {
          if (purchaseId) {
            await supabaseQuery(
              `user_purchases?payment_id=eq.${encodeURIComponent(purchaseId)}`,
              'PATCH',
              {
                status: 'paid',
                paid_at: new Date().toISOString()
              }
            );
          } else if (tgId && itemId) {
            await supabaseQuery(
              `user_purchases?telegram_id=eq.${tgId}&item_id=eq.${encodeURIComponent(itemId)}`,
              'PATCH',
              {
                status: 'paid',
                paid_at: new Date().toISOString()
              }
            );
          }
        } catch (e) {
          console.error('Failed to update purchase on webhook:', e.message);
        }
      }

      return sendJson(res, 200, { result: 'OK' });
    }

    // ── 5. INSTANT UNLOCK / TEST HELPER (POST /api/payment/test-complete) ──
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

      try {
        await supabaseQuery('user_purchases', 'POST', {
          id: crypto.randomUUID(),
          telegram_id: tgId,
          item_type: itemType,
          item_id: itemId,
          amount: amount,
          currency: 'RUB',
          payment_id: 'test_' + Date.now(),
          status: 'paid',
          paid_at: new Date().toISOString()
        });

        return sendJson(res, 200, {
          ok: true,
          message: `Материал ${itemId} успешно открыт для пользователя ${tgId}`
        });
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
