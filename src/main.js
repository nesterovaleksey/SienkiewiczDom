import './style.css';
import { setupUI } from './ui.js';

// Инициализация Telegram Web App
const twa = window.Telegram?.WebApp;

function init() {
    if (twa) {
        twa.expand(); // Разворачиваем окно на всю высоту экрана
        twa.ready();

        // Функция для попыток получения ID (иногда Telegram запаздывает с передачей данных)
        const checkUserId = (attemptsLeft) => {
            const initDataUnsafe = twa.initDataUnsafe || {};
            const userId = initDataUnsafe.user?.id;

            if (userId) {
                // Данные получены, запускаем реальный UI
                setupUI(twa, userId);
            } else if (attemptsLeft > 0) {
                // Ждем 100мс и пробуем снова
                setTimeout(() => checkUserId(attemptsLeft - 1), 100);
            } else {
                // Если после всех попыток пусто - всё равно запускаем мок
                console.warn("Telegram Web App не передал userId после ожидания. Используем мок для UI");
                setupUI(
                    {
                        initData: twa.initData || "mock_data",
                        initDataUnsafe: initDataUnsafe,
                        MainButton: twa.MainButton || { show: () => { }, hide: () => { }, setText: () => { }, onClick: () => { }, enable: () => { }, showProgress: () => { }, hideProgress: () => { }, disable: () => { }, offClick: () => { } },
                        BackButton: twa.BackButton || { show: () => { }, hide: () => { }, onClick: () => { } },
                        close: () => {
                            if (typeof twa.close === 'function') twa.close();
                            try { window.close() } catch (e) { }
                        }
                    },
                    "mock_user_123"
                );
            }
        };

        // Начинаем проверку (даем Телеграму до 1 секунды, 10 попыток по 100мс)
        checkUserId(10);

    } else {
        // Режим заглушки для запуска вне Telegram (например, в браузере при разработке)
        // В реальном продукте здесь будет "ошибка", но для удобства разработки оставим мок
        console.warn("Telegram Web App не найден, запуск в тестовом режиме");
        setupUI(
            {
                initData: "mock_data",
                MainButton: { show: () => { }, hide: () => { }, setText: () => { }, onClick: () => { }, enable: () => { }, showProgress: () => { }, hideProgress: () => { } },
                BackButton: { show: () => { }, hide: () => { }, onClick: () => { } },
                close: () => {
                    try { window.close() } catch (e) { }
                }
            },
            "mock_user_123"
        );
        // showError("Среда Telegram Web App не найдена.");
    }
}

function showError(message) {
    document.querySelector('#app').innerHTML = `
    <div class="error-view">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
      </svg>
      <p>${message}</p>
    </div>
  `;
}

// Запуск приложения
init();
