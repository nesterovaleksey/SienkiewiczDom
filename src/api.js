// URL вебхуков n8n. Пустые строки = режим моков (для разработки интерфейса).
// Когда будут готовы реальные URL, просто вставим их сюда.
const N8N_WEBHOOK_URL_SLOTS = 'https://primary-production-e36b.up.railway.app/webhook/get-slots';
const N8N_WEBHOOK_URL_BOOK = 'https://primary-production-e36b.up.railway.app/webhook/save-booking';

export async function fetchSlots(telegramId, initData, type, monthStr) {
    // Для тестирования UI, если нет URL или если он локальный - будем мокировать
    // В данном случае URL у нас тестовый, он работает. Но так как он "test webhook" в n8n работает только 1 раз при нажатии, 
    // лучше для активной разработки использовать мок, либо попытаться сделать запрос реально.
    // Так как мы убедились, что формат верный, я сделаю попытку вызова реального API.
    // Если ошибка - откатываемся на мок (чтобы не блокировать UI)

    if (!N8N_WEBHOOK_URL_SLOTS) {
        return mockFetchSlots(monthStr);
    }

    try {
        const res = await fetch(N8N_WEBHOOK_URL_SLOTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegramId, type, month: monthStr })
        });

        if (!res.ok) {
            const errorText = await res.text();
            alert(`Ошибка от сервера (status ${res.status}): ${errorText}`);
            throw new Error(`Network error: ${res.status}`);
        }

        const data = await res.json();
        return data; // Возвращаем то что пришло (например { "slots": [...] })
    } catch (err) {
        alert("Детальная ошибка: " + err.message);
        console.warn("Ошибка вызова n8n, используем мок данные для интерфейса", err);
        return mockFetchSlots(monthStr);
    }
}

export async function bookSlot(telegramId, type, slotIso, duration, clientInfo) {
    // Для тестирования UI, пока нет бекенда брони
    if (!N8N_WEBHOOK_URL_BOOK) {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    const res = await fetch(N8N_WEBHOOK_URL_BOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            telegram_id: telegramId,
            type,
            slot: slotIso,
            duration,
            client: clientInfo
        })
    });

    if (!res.ok) throw new Error('Network error');
    return res.json();
}

// ==========================================
// MOCK DATA GENERATOR
// Генерирует массив ISO дат для заданного месяца (например "2026-02")
// ==========================================
function mockFetchSlots(monthStr) {
    return new Promise(resolve => {
        setTimeout(() => {
            const [year, month] = monthStr.split('-').map(Number);
            const slots = [];

            // Генерируем тестовые слоты, выбираем случайные дни в месяце
            for (let day = 1; day <= 28; day++) {
                // Пропускаем выходные условно
                const d = new Date(year, month - 1, day);
                if (d.getDay() === 0 || d.getDay() === 6) continue;

                // В понедельник и среду например нет слотов
                if (day % 3 === 0) continue;

                // Слоты с 10:00 до 16:00
                for (let hour = 10; hour <= 16; hour += 1) {
                    const slotDate = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
                    slots.push(slotDate.toISOString());
                }
            }

            resolve({ slots });
        }, 1000); // Имитация задержки сети 1 сек
    });
}
