const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'kram_ua_bot';
const SITE_URL = process.env.SITE_URL || process.env.BASE_URL || 'https://kram.ua';

async function callTelegram(method, body) {
    if (!TELEGRAM_TOKEN) return { ok: false, error: 'no_token' };
    try {
        const resp = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        if (!data.ok) console.error('[telegram]', method, '→', data.error_code, data.description);
        return data;
    } catch (err) {
        console.error('[telegram]', method, 'fetch failed:', err.message);
        return { ok: false };
    }
}

async function sendTelegramMessage(chatId, text, options = {}) {
    return callTelegram('sendMessage', {
        chat_id: chatId || TELEGRAM_CHAT_ID,
        text,
        parse_mode: options.parse_mode || 'HTML',
        disable_web_page_preview: options.disable_preview || false,
        reply_markup: options.reply_markup,
        ...options
    });
}

function buildLotUrl(lotId) {
    return `${SITE_URL}/lot.html?id=${lotId}`;
}

function buildDeepLink(lotId) {
    const payload = `lot_${lotId}`.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
    return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${payload}`;
}

function buildInlineShareUrl(lot) {
    const url = buildLotUrl(lot.id);
    const title = (lot.title || '').slice(0, 150);
    const text = encodeURIComponent(`🔥 ${title}\n💰 ${Number(lot.current_price || lot.start_price).toLocaleString('uk-UA')} грн.\n👉 `);
    return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`;
}

function buildWebShareUrl(lot) {
    return `https://t.me/share/url?url=${encodeURIComponent(buildLotUrl(lot.id))}&text=${encodeURIComponent('🔥 ' + (lot.title || '').slice(0, 100) + '\n💰 ' + Number(lot.current_price || lot.start_price).toLocaleString('uk-UA') + ' грн.\n👉 ')}`;
}

function formatLotCard(lot) {
    const price = Number(lot.current_price || lot.start_price).toLocaleString('uk-UA');
    const end = lot.end_time ? new Date(lot.end_time) : null;
    const timeLeft = end ? Math.max(0, Math.ceil((end - new Date()) / 3600000)) : null;
    const badge = lot.sale_type === 'buy-now' ? '🛒 Купити зараз' : '🔨 Аукціон';
    const city = lot.seller_city || '';
    return [
        `<b>🔥 ${escapeHtml(lot.title || '')}</b>`,
        '',
        `${badge}  •  💰 <b>${price} грн.</b>`,
        lot.bids_count ? `📊 Ставок: <b>${lot.bids_count}</b>` : '📊 Ставок: 0',
        lot.category_name ? `📁 ${escapeHtml(lot.category_name)}` : '',
        city ? `📍 ${escapeHtml(city)}` : '',
        timeLeft !== null ? `⏱ <b>${timeLeft > 0 ? timeLeft + ' год.' : 'Завершено'}</b>` : '',
        '',
        `<a href="${buildLotUrl(lot.id)}">👉 Відкрити на KRAM.UA</a>`,
        '',
        `<i>#KRAMUA #${(lot.category_slug || 'lots').slice(0, 20)}</i>`
    ].filter(Boolean).join('\n');
}

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendLotCard(chatId, lot) {
    const keyboard = {
        inline_keyboard: [
            [{ text: '👉 Відкрити лот', url: buildLotUrl(lot.id) }],
            [
                { text: '🔄 Оновити', callback_data: `refresh_lot_${lot.id}` },
                { text: '📤 Поділитися', switch_inline_query: String(lot.id) }
            ]
        ]
    };
    const text = formatLotCard(lot);

    if (lot.main_image || (lot.images && lot.images[0])) {
        const photo = lot.main_image
            ? `${SITE_URL}/uploads/${lot.main_image}`
            : `${SITE_URL}/uploads/${lot.images[0].filename}`;
        return callTelegram('sendPhoto', {
            chat_id: chatId,
            photo,
            caption: text,
            parse_mode: 'HTML',
            reply_markup: keyboard
        }).catch(() => sendTelegramMessage(chatId, text, { reply_markup: keyboard }));
    }
    return sendTelegramMessage(chatId, text, { reply_markup: keyboard });
}

async function answerCallback(queryId, text, showAlert = false) {
    return callTelegram('answerCallbackQuery', {
        callback_query_id: queryId,
        text: text || '',
        show_alert: showAlert
    });
}

async function answerInlineQuery(queryId, results) {
    return callTelegram('answerInlineQuery', {
        inline_query_id: queryId,
        results: JSON.stringify(results),
        cache_time: 60,
        is_personal: false
    });
}

function lotToInlineResult(lot) {
    const price = Number(lot.current_price || lot.start_price).toLocaleString('uk-UA');
    const image = lot.main_image ? `${SITE_URL}/uploads/${lot.main_image}` : 'https://kram.ua/icons/og-image.svg';
    return {
        type: 'article',
        id: String(lot.id),
        title: lot.title || 'Без назви',
        description: `💰 ${price} грн. • 📊 ${lot.bids_count || 0} ставок • ${lot.category_name || ''}`,
        thumbnail_url: image,
        thumb_width: 100,
        thumb_height: 75,
        url: buildLotUrl(lot.id),
        hide_url: false,
        input_message_content: {
            message_text: formatLotCard(lot),
            parse_mode: 'HTML',
            disable_web_page_preview: false
        },
        reply_markup: {
            inline_keyboard: [
                [{ text: '👉 На KRAM.UA', url: buildLotUrl(lot.id) }]
            ]
        }
    };
}

async function setWebhook(domain) {
    const url = `${domain || SITE_URL}/api/webhook/telegram`;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const result = await callTelegram('setWebhook', {
        url,
        secret_token: secret,
        allowed_updates: ['message', 'inline_query', 'callback_query'],
        drop_pending_updates: false
    });
    console.log('[telegram] setWebhook →', `${url}`, result);
    return result;
}

async function deleteWebhook() {
    return callTelegram('deleteWebhook', { drop_pending_updates: false });
}

async function getWebhookInfo() {
    const r = await callTelegram('getWebhookInfo', {});
    return r.result;
}

async function setupCommands() {
    const commands = [
        { command: 'start', description: '🚀 Почати — KRAM.UA аукціон' },
        { command: 'help',  description: '❓ Допомога та команди' },
        { command: 'lot',   description: '🔍 Показати лот: /lot 123' },
        { command: 'search', description: '🔎 Шукати лоти: /search ноутбук' },
        { command: 'mybids', description: '📊 Мої ставки' },
        { command: 'mylots', description: '📦 Мої лоти' }
    ];
    return callTelegram('setMyCommands', { commands, language_code: 'uk' });
}

async function handleDeepLink(userId, param) {
    if (!param) return sendStart(userId);
    if (param.startsWith('lot_')) {
        const lotId = param.replace(/^lot_/, '');
        return sendLotCommand(userId, lotId);
    }
    if (param.startsWith('user_')) {
        return sendTelegramMessage(userId, `👤 Профіль продавця: ${SITE_URL}/seller.html?username=${param.replace(/^user_/, '')}`);
    }
    return sendStart(userId);
}

async function sendStart(userId) {
    const text = [
        `<b>👋 Вітаю на KRAM.UA!</b>`,
        '',
        'Я — бот першого українського аукціону.',
        'Тут ти можеш:',
        '',
        '• 🔍 Шукай лоти через <b>@' + TELEGRAM_BOT_USERNAME + ' запит</b> в будь-якому чаті',
        '• 📋 /lot &lt;id&gt; — відкрити конкретний лот',
        '• 🔎 /search &lt;слово&gt; — пошук',
        '• 📊 /mybids — мої ставки',
        '• 📦 /mylots — мої лоти',
        '',
        `<a href="${SITE_URL}">👉 Відкрити сайт</a>`
    ].join('\n');
    const keyboard = {
        inline_keyboard: [
            [
                { text: '🔥 Топ-лоти', callback_data: 'top_lots' },
                { text: '🆕 Нові', callback_data: 'new_lots' }
            ],
            [{ text: '🌐 Відкрити сайт', url: SITE_URL }]
        ]
    };
    return sendTelegramMessage(userId, text, { reply_markup: keyboard });
}

async function sendLotCommand(userId, lotId, db) {
    try {
        const lot = await db.prepare('SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name, c.slug as category_slug FROM lots l LEFT JOIN users u ON l.seller_id = u.id LEFT JOIN categories c ON l.category_id = c.id WHERE l.id = ?').get(lotId);
        if (!lot) return sendTelegramMessage(userId, '❌ Лот не знайдено');
        return sendLotCard(userId, lot);
    } catch (e) {
        return sendTelegramMessage(userId, '❌ Помилка завантаження лота');
    }
}

async function handleCallback(query, db) {
    const data = query.data || '';
    const userId = query.from.id;
    const messageId = query.message?.message_id;
    const chatId = query.message?.chat.id;

    if (data === 'top_lots' || data === 'new_lots') {
        const sort = data === 'top_lots' ? 'popular' : 'newest';
        try {
            const rows = await db.prepare('SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name FROM lots l LEFT JOIN users u ON l.seller_id = u.id LEFT JOIN categories c ON l.category_id = c.id WHERE l.status = ? ORDER BY ' + (sort === 'newest' ? 'l.created_at DESC' : 'l.bids_count DESC') + ' LIMIT 5').all('active');
            if (!rows.length) return answerCallback(query.id, 'Немає активних лотів', true);
            const lines = rows.map((l, i) => `${i + 1}. <a href="${buildLotUrl(l.id)}">${escapeHtml((l.title || '').slice(0, 50))}</a> — ${Number(l.current_price || l.start_price).toLocaleString('uk-UA')} грн.`);
            const text = `<b>${data === 'top_lots' ? '🔥 Топ-5 лотів' : '🆕 Нові 5 лотів'}</b>\n\n` + lines.join('\n');
            await callTelegram('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' });
            return answerCallback(query.id);
        } catch (e) {
            return answerCallback(query.id, 'Помилка', true);
        }
    }

    if (data.startsWith('refresh_lot_')) {
        const lotId = data.replace(/^refresh_lot_/, '');
        await sendLotCommand(userId, lotId, db);
        return answerCallback(query.id, '🔄 Оновлено');
    }

    return answerCallback(query.id, 'Невідома дія');
}

async function handleInlineQuery(query, db) {
    const q = (query.query || '').trim();
    if (!q) return answerInlineQuery(query.id, []);

    const like = `%${q}%`;
    try {
        const rows = await db.prepare(`
            SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name, c.slug as category_slug
            FROM lots l
            LEFT JOIN users u ON l.seller_id = u.id
            LEFT JOIN categories c ON l.category_id = c.id
            WHERE l.status = 'active' AND (l.title LIKE ? OR l.description LIKE ? OR c.name LIKE ?)
            ORDER BY l.bids_count DESC
            LIMIT 20
        `).all(like, like, like);
        const results = rows.map(lotToInlineResult);
        return answerInlineQuery(query.id, results);
    } catch (e) {
        return answerInlineQuery(query.id, []);
    }
}

async function handleUpdate(update, db) {
    if (!update) return;

    if (update.inline_query) {
        return handleInlineQuery(update.inline_query, db);
    }

    if (update.callback_query) {
        return handleCallback(update.callback_query, db);
    }

    const msg = update.message;
    if (!msg || !msg.text) return;

    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (text === '/start' || text === '/start@' + TELEGRAM_BOT_USERNAME) {
        return sendStart(chatId);
    }
    if (text.startsWith('/start ')) {
        const param = text.replace(/^\/start(\@\w+)?\s+/, '');
        return handleDeepLink(chatId, param);
    }
    if (text === '/help' || text === '/help@' + TELEGRAM_BOT_USERNAME) {
        return sendStart(chatId);
    }
    if (text.startsWith('/lot ') || text.startsWith('/lot@')) {
        const id = text.replace(/^\/lot(\@\w+)?\s+/, '').trim();
        if (!id || !/^\d+$/.test(id)) return sendTelegramMessage(chatId, '❓ Формат: /lot 123');
        return sendLotCommand(chatId, id, db);
    }
    if (text.startsWith('/search ') || text.startsWith('/search@')) {
        const q = text.replace(/^\/search(\@\w+)?\s+/, '').trim();
        if (!q) return sendTelegramMessage(chatId, '❓ Формат: /search ноутбук');
        try {
            const rows = await db.prepare(`
                SELECT l.*, u.username as seller_name, u.city as seller_city, c.name as category_name
                FROM lots l
                LEFT JOIN users u ON l.seller_id = u.id
                LEFT JOIN categories c ON l.category_id = c.id
                WHERE l.status = 'active' AND (l.title LIKE ? OR l.description LIKE ?)
                ORDER BY l.bids_count DESC
                LIMIT 10
            `).all(`%${q}%`, `%${q}%`);
            if (!rows.length) return sendTelegramMessage(chatId, `📭 За запитом «${escapeHtml(q)}» нічого не знайдено`);
            const lines = rows.map((l, i) => `${i + 1}. <b>${escapeHtml((l.title || '').slice(0, 60))}</b>\n   💰 ${Number(l.current_price || l.start_price).toLocaleString('uk-UA')} грн — <a href="${buildLotUrl(l.id)}">Відкрити</a>`);
            return sendTelegramMessage(chatId, `<b>🔎 Результати (${rows.length}):</b>\n\n` + lines.join('\n\n'), { disable_preview: true });
        } catch (e) {
            return sendTelegramMessage(chatId, '❌ Помилка пошуку');
        }
    }
    if (text === '/mybids' || text === '/mybids@' + TELEGRAM_BOT_USERNAME) {
        return sendTelegramMessage(chatId, `📊 Ваші ставки: <a href="${SITE_URL}/cabinet.html#bids">Переглянути</a>`);
    }
    if (text === '/mylots' || text === '/mylots@' + TELEGRAM_BOT_USERNAME) {
        return sendTelegramMessage(chatId, `📦 Ваші лоти: <a href="${SITE_URL}/cabinet.html#sales">Переглянути</a>`);
    }

    if (msg.chat.type === 'private') {
        return sendTelegramMessage(chatId, `Не зрозумів команду.\nСпробуй /help для списку.`);
    }
}

async function getBotUsernameAndAvatar() {
    const r = await callTelegram('getMe', {});
    return r.ok ? r.result : null;
}

module.exports = {
    callTelegram,
    sendTelegramMessage,
    sendLotCard,
    formatLotCard,
    buildLotUrl,
    buildDeepLink,
    buildInlineShareUrl,
    buildWebShareUrl,
    answerCallback,
    answerInlineQuery,
    setWebhook,
    deleteWebhook,
    getWebhookInfo,
    setupCommands,
    handleUpdate,
    handleDeepLink,
    getBotUsernameAndAvatar,
    SITE_URL,
    TELEGRAM_BOT_USERNAME
};
