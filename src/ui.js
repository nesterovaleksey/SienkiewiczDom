import { fetchSlots, bookSlot } from './api.js';

export function setupUI(twa, userId) {
  const app = document.querySelector('#app');
  renderServiceSelection(app, twa, userId);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} ч.`;
  }
  return `${hours} ч. ${remainingMinutes} мин.`;
}

// ----------------------------------------------------
// ЭКРАН 1: ВЫБОР УСЛУГИ
// ----------------------------------------------------
function renderServiceSelection(app, twa, userId) {
  if (twa.BackButton) twa.BackButton.hide();
  if (twa.MainButton) twa.MainButton.hide();

  app.innerHTML = `
    <div class="welcome-container" style="padding-top: 100px;">
      <div class="welcome-icon logo-fixed">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
      </div>

      <div class="header welcome-header animate-in">
        <h1>Бесплатная консультация</h1>
        <p class="subtitle">Что вы хотите запланировать?</p>
      </div>
      
      <div class="services-list animate-in delay-1" style="width: 100%; max-width: 400px;">
        <div class="card" id="btn-call">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; color: var(--button-color);">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-title">Звонок</div>
            <div class="card-subtitle">Покупка недвижимости за счет собственных средств</div>
          </div>
          <div class="card-action" style="font-weight: 500; color: var(--button-color); font-size: 15px;">Выбрать</div>
        </div>
        
        <div class="card" id="btn-meeting">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; color: var(--button-color);">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="card-content">
            <div class="card-title">Встреча</div>
            <div class="card-subtitle">Ипотека, покупка за счет кредитных средств</div>
          </div>
          <div class="card-action" style="font-weight: 500; color: var(--button-color); font-size: 15px;">Выбрать</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-call').addEventListener('click', () => {
    // Текущий месяц в виде объекта Date (первое число)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    loadCalendar(app, twa, userId, 'call', 60, currentMonth);
  });

  document.getElementById('btn-meeting').addEventListener('click', () => {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    loadCalendar(app, twa, userId, 'meeting', 120, currentMonth);
  });
}

// ----------------------------------------------------
// ЭКРАН 2: КАЛЕНДАРЬ
// ----------------------------------------------------
async function loadCalendar(app, twa, userId, type, durationMinutes, monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;

  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(monthDate);
  const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const serviceDesc = type === 'call'
    ? 'Покупка недвижимости за счет собственных средств'
    : 'Ипотека, покупка за счет кредитных средств';

  app.innerHTML = `
    <div class="welcome-container" style="justify-content: flex-start; padding-top: 100px;">
      <div class="welcome-icon logo-fixed">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
      </div>
      
      <div class="header animate-in" style="margin-bottom: 24px; width: 100%;">
        <div class="header-row">
          ${Object.keys(twa.initDataUnsafe || {}).length === 0 ? '<button class="back-btn" id="fallback-back">❮</button>' : ''}
          <div>
            <h1 style="margin: 0; padding: 0;">Свободные дни</h1>
            <p class="subtitle" style="margin-top: 4px;">${serviceDesc}</p>
          </div>
        </div>
      </div>
      
      <div class="calendar-container animate-in delay-1" style="width: 100%; max-width: 400px;">
        <div class="calendar-nav">
          <button class="nav-btn" id="prev-month">❮</button>
          <div class="calendar-title">${capitalizedMonthName}</div>
          <button class="nav-btn" id="next-month">❯</button>
        </div>
        
        <div class="calendar-weekdays">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        
        <div id="calendar-grid" class="calendar-grid">
           <div class="loader-container"><div class="loader"></div></div>
        </div>
      </div>
    </div>
  `;

  if (twa.BackButton) {
    twa.BackButton.show();
    twa.BackButton.onClick(() => {
      renderServiceSelection(app, twa, userId);
    });
  }

  const fallbackBackBtn = document.getElementById('fallback-back');
  if (fallbackBackBtn) {
    fallbackBackBtn.addEventListener('click', () => {
      renderServiceSelection(app, twa, userId);
    });
  }

  document.getElementById('prev-month').addEventListener('click', () => {
    const prev = new Date(monthDate);
    prev.setMonth(prev.getMonth() - 1);
    loadCalendar(app, twa, userId, type, durationMinutes, prev);
  });

  document.getElementById('next-month').addEventListener('click', () => {
    const next = new Date(monthDate);
    next.setMonth(next.getMonth() + 1);
    loadCalendar(app, twa, userId, type, durationMinutes, next);
  });

  try {
    const response = await fetchSlots(userId, twa.initData, type, monthStr);
    const slots = response.slots || []; // массив ISO строк

    // Получаем длительность от бэкенда. Если нет, ставим fallback значения.
    let currentDurationMinutes = response.duration;
    if (!currentDurationMinutes) {
      currentDurationMinutes = type === 'call' ? 60 : 120;
    }

    renderCalendarGrid(app, twa, userId, type, currentDurationMinutes, monthDate, slots);
  } catch (err) {
    document.getElementById('calendar-grid').innerHTML = `
      <div class="error-view" style="grid-column: 1 / -1;">
        <p style="color: #ff3b30; margin-bottom: 16px;">Ошибка загрузки.</p>
        <button class="btn btn-secondary" id="btn-retry">Повторить</button>
      </div>
    `;
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      loadCalendar(app, twa, userId, type, durationMinutes, monthDate);
    });
  }
}

function renderCalendarGrid(app, twa, userId, type, durationMinutes, monthDate, isoSlots) {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  // Группируем слоты по датам (YYYY-MM-DD -> массив дат в виде ISO)
  const slotsByDate = {};
  isoSlots.forEach(isoStr => {
    const d = new Date(isoStr);
    // Берем дату локально так как календарь локальный
    const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
    slotsByDate[dateKey].push(isoStr);
  });

  // Логика отрисовки сетки месяца
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Определяем день недели 1-го числа (0 = Вс, 1 = Пн ... 6 = Сб). Приводим к формату (1 = Пн, 7 = Вс)
  let firstDayDayOfWeek = firstDayOfMonth.getDay();
  if (firstDayDayOfWeek === 0) firstDayDayOfWeek = 7;

  // Пустые ячейки в начале
  for (let i = 1; i < firstDayDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  // Дни месяца
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDay = new Date(year, month, d);
    const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const daySlots = slotsByDate[dateKey] || [];

    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.innerText = d;

    if (currentDay < today) {
      dayEl.classList.add('disabled');
    } else if (daySlots.length > 0) {
      dayEl.classList.add('has-slots');
      dayEl.addEventListener('click', () => {
        // Подсвечиваем активный день
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        dayEl.classList.add('selected');
        // Открываем экран со слотами дня
        renderDaySlots(app, twa, userId, type, durationMinutes, currentDay, daySlots);
      });
    } else {
      dayEl.classList.add('disabled');
    }

    if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
      dayEl.classList.add('today');
    }

    grid.appendChild(dayEl);
  }
}

// ----------------------------------------------------
// ЭКРАН 3: СПИСОК СЛОТОВ НА ВЫБРАННЫЙ ДЕНЬ
// ----------------------------------------------------
function renderDaySlots(app, twa, userId, type, durationMinutes, dayDate, daySlots) {
  // Сортируем слоты по времени
  daySlots.sort((a, b) => new Date(a) - new Date(b));

  const formatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const dayName = formatter.format(dayDate);

  app.innerHTML = `
    <div class="welcome-container" style="justify-content: flex-start; padding-top: 100px;">
      <div class="welcome-icon logo-fixed">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
      </div>

      <div class="header animate-in" style="width: 100%;">
        <div class="header-row">
          ${Object.keys(twa.initDataUnsafe || {}).length === 0 ? '<button class="back-btn" id="fallback-back">❮</button>' : ''}
          <div>
             <h1 style="margin: 0; padding: 0;">Выберите время</h1>
             <p class="subtitle" style="margin-top: 4px;">${dayName.charAt(0).toUpperCase() + dayName.slice(1)}</p>
          </div>
        </div>
      </div>
      
      <div id="slots-container" class="slots-list animate-in delay-1" style="width: 100%; max-width: 400px;">
        <!-- Слоты рендерятся тут -->
      </div>
    </div>
  `;

  if (twa.BackButton) {
    twa.BackButton.show();
    twa.BackButton.onClick(() => {
      // Возвращаем в календарь этого же месяца
      const monthStart = new Date(dayDate);
      monthStart.setDate(1);
      loadCalendar(app, twa, userId, type, durationMinutes, monthStart);
    });
  }

  const fallbackBackBtn = document.getElementById('fallback-back');
  if (fallbackBackBtn) {
    fallbackBackBtn.addEventListener('click', () => {
      const monthStart = new Date(dayDate);
      monthStart.setDate(1);
      loadCalendar(app, twa, userId, type, durationMinutes, monthStart);
    });
  }

  const container = document.getElementById('slots-container');

  container.innerHTML = daySlots.map((isoString, index) => {
    const d = new Date(isoString);
    const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const delayClass = `delay-${Math.min(index + 1, 4)}`;
    return `
      <div class="card slot-card animate-in ${delayClass}" data-iso="${isoString}">
        <div class="card-content">
          <div class="card-title">${timeStr}</div>
        </div>
        <div class="radio-circle"></div>
      </div>
    `;
  }).join('');

  const slotCards = container.querySelectorAll('.slot-card');

  slotCards.forEach(card => {
    card.addEventListener('click', () => {
      const selectedIso = card.dataset.iso;
      // Переходим к вводу контакта
      renderContactForm(app, twa, userId, type, durationMinutes, dayDate, selectedIso);
    });
  });
}

// ----------------------------------------------------
// ЭКРАН 4: ФОРМА ДАННЫХ КЛИЕНТА
// ----------------------------------------------------
function renderContactForm(app, twa, userId, type, durationMinutes, dayDate, selectedIso) {
  const d = new Date(selectedIso);
  const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dayStr = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(d);

  app.innerHTML = `
    <div class="welcome-icon logo-fixed animate-in">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
    </div>

    <div class="header animate-in" style="padding-top: 70px;">
      <div class="header-row">
        ${Object.keys(twa.initDataUnsafe || {}).length === 0 ? '<button class="back-btn" id="fallback-back">❮</button>' : ''}
        <div>
          <h1 style="margin: 0; padding: 0;">Ваши данные</h1>
          <p class="subtitle" style="margin-top: 4px;">Запись на ${dayStr} в ${timeStr}</p>
        </div>
      </div>
    </div>
    
    <div class="form-container animate-in delay-1">
      <div class="input-group">
        <label for="client-name">Имя</label>
        <input type="text" id="client-name" class="input-field" placeholder="Иван" autocomplete="name">
      </div>
      
      <div class="input-group">
        <label for="client-phone">Контактный телефон</label>
        <div class="phone-input-wrapper">
          <span class="phone-prefix">+48</span>
          <input type="tel" id="client-phone" class="input-field phone-field" placeholder="123456789" autocomplete="tel" maxlength="9">
        </div>
      </div>
      
      <!-- Fallback кнопка для обычного браузера -->
      <button id="fallback-continue" class="btn" style="margin-top: 24px; display: none;">ПРОДОЛЖИТЬ →</button>
    </div>
  `;

  if (twa.BackButton) {
    twa.BackButton.show();
    twa.BackButton.onClick(() => {
      const monthStart = new Date(dayDate);
      monthStart.setDate(1);
      loadCalendar(app, twa, userId, type, durationMinutes, monthStart);
    });
  }

  const fallbackBackBtn = document.getElementById('fallback-back');
  if (fallbackBackBtn) {
    fallbackBackBtn.addEventListener('click', () => {
      const monthStart = new Date(dayDate);
      monthStart.setDate(1);
      loadCalendar(app, twa, userId, type, durationMinutes, monthStart);
    });
  }

  const nameInput = document.getElementById('client-name');
  const phoneInput = document.getElementById('client-phone');
  const fallbackContinueBtn = document.getElementById('fallback-continue');

  const validateForm = () => {
    const name = nameInput.value.trim();
    let phoneDigits = phoneInput.value.replace(/\D/g, '').substring(0, 9);

    if (phoneInput.value !== phoneDigits) {
      phoneInput.value = phoneDigits;
    }

    const isValid = name.length >= 2 && phoneDigits.length === 9;

    if (isValid) {
      if (twa.MainButton && typeof twa.MainButton.show === 'function' && Object.keys(twa.initDataUnsafe || {}).length > 0) {
        if (!twa.MainButton.isVisible) {
          twa.MainButton.text = 'ПРОДОЛЖИТЬ →';
          twa.MainButton.color = '#0F766E';
          twa.MainButton.textColor = '#ffffff';
          twa.MainButton.show();
        }
        twa.MainButton.enable();
      } else {
        fallbackContinueBtn.style.display = 'block';
      }
    } else {
      if (twa.MainButton && typeof twa.MainButton.hide === 'function') {
        twa.MainButton.hide();
      }
      fallbackContinueBtn.style.display = 'none';
    }
  };

  nameInput.addEventListener('input', validateForm);
  phoneInput.addEventListener('input', validateForm);

  const onContinueClick = () => {
    const name = nameInput.value.trim();
    const phoneDigits = phoneInput.value.replace(/\D/g, '').substring(0, 9);
    if (name.length < 2 || phoneDigits.length !== 9) return;

    if (twa.MainButton && typeof twa.MainButton.offClick === 'function') {
      twa.MainButton.offClick(onContinueClick);
      twa.MainButton.hide();
    }

    renderRodoConsent(app, twa, userId, type, durationMinutes, dayDate, selectedIso, name, phoneDigits, dayStr, timeStr);
  };

  if (twa.MainButton && typeof twa.MainButton.offClick === 'function') {
    twa.MainButton.offClick(onContinueClick);
    twa.MainButton.onClick(onContinueClick);
  }

  fallbackContinueBtn.addEventListener('click', onContinueClick);
}

// ----------------------------------------------------
// ЭКРАН 4b: СОГЛАСИЕ RODO
// ----------------------------------------------------
function renderRodoConsent(app, twa, userId, type, durationMinutes, dayDate, selectedIso, clientName, clientPhone, dayStr, timeStr) {
  app.innerHTML = `
    <div class="welcome-icon logo-fixed animate-in">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
    </div>

    <div class="header animate-in" style="padding-top: 70px;">
      <div class="header-row">
        ${Object.keys(twa.initDataUnsafe || {}).length === 0 ? '<button class="back-btn" id="fallback-back">❮</button>' : ''}
        <div>
          <h1 style="margin: 0; padding: 0;">Согласие</h1>
          <p class="subtitle" style="margin-top: 4px;">Запись на ${dayStr} в ${timeStr}</p>
        </div>
      </div>
    </div>

    <div class="form-container animate-in delay-1">
      <label class="rodo-label" id="rodo-checkbox-label">
        <div class="rodo-checkbox-wrap">
          <input type="checkbox" id="rodo-checkbox" class="rodo-checkbox-input">
          <span class="rodo-custom-checkbox"></span>
        </div>
        <div class="rodo-text">
          Я даю согласие на обработку моих персональных данных компанией
          <strong>IRYNA VALOKHINA SIENKIEWICZ DOM</strong> (Wrocław), NIP: 8943208149,
          для связи со мной, записи встреч и оказания услуг в сфере недвижимости
          (купля, продажа, аренда).<br><br>
          Я подтверждаю, что ознакомлен(а) с Политикой конфиденциальности.<br><br>
          <span class="rodo-admin">Администратор данных:<br>
          IRYNA VALOKHINA SIENKIEWICZ DOM,<br>
          UL. PASŁĘCKA 6/2, 54-116 WROCŁAW.</span>
        </div>
      </label>

      <a href="#" id="btn-download-pdf" class="rodo-pdf-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        Скачать полный текст политики RODO (PDF)
      </a>

      <!-- Fallback кнопка для обычного браузера -->
      <button id="fallback-submit" class="btn" style="margin-top: 8px; display: none;" disabled>ПОДТВЕРДИТЬ ЗАПИСЬ</button>
    </div>
  `;

  if (twa.BackButton) {
    twa.BackButton.show();
    twa.BackButton.onClick(() => {
      if (twa.MainButton && typeof twa.MainButton.hide === 'function') twa.MainButton.hide();
      renderContactForm(app, twa, userId, type, durationMinutes, dayDate, selectedIso);
    });
  }

  const fallbackBackBtn = document.getElementById('fallback-back');
  if (fallbackBackBtn) {
    fallbackBackBtn.addEventListener('click', () => {
      renderContactForm(app, twa, userId, type, durationMinutes, dayDate, selectedIso);
    });
  }

  const checkbox = document.getElementById('rodo-checkbox');
  const fallbackBtn = document.getElementById('fallback-submit');
  const isTelegram = twa.MainButton && typeof twa.MainButton.show === 'function' && Object.keys(twa.initDataUnsafe || {}).length > 0;

  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Получаем полный URL до PDF файла
      const pdfUrl = new URL('/rodo.pdf', window.location.href).href;

      // В Telegram Web App обычные ссылки на скачивание (download) блокируются
      // Специальный метод openLink открывает ссылку во внешнем браузере, где всё сработает
      if (isTelegram && typeof twa.openLink === 'function') {
        twa.openLink(pdfUrl);
      } else {
        // Fallback для обычного браузера
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        a.download = 'rodo.pdf';
        a.click();
      }
    });
  }

  // Инициализируем MainButton как неактивную (серым цветом)
  if (isTelegram) {
    twa.MainButton.text = 'ПОДТВЕРДИТЬ ЗАПИСЬ';
    twa.MainButton.color = '#9ca3af'; // Серый цвет
    twa.MainButton.textColor = '#ffffff';
    twa.MainButton.show();
    twa.MainButton.disable();
  } else {
    fallbackBtn.style.display = 'block';
    fallbackBtn.disabled = true;
  }

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      if (isTelegram) {
        twa.MainButton.color = '#0F766E'; // Зеленый цвет
        twa.MainButton.enable();
      } else {
        fallbackBtn.disabled = false;
        fallbackBtn.classList.add('btn-active');
      }
    } else {
      if (isTelegram) {
        twa.MainButton.color = '#9ca3af'; // Серый цвет
        twa.MainButton.disable();
      } else {
        fallbackBtn.disabled = true;
        fallbackBtn.classList.remove('btn-active');
      }
    }
  });

  async function onConfirmClick() {
    if (!checkbox.checked) return;

    if (isTelegram) {
      twa.MainButton.showProgress();
      twa.MainButton.disable();
    } else {
      fallbackBtn.disabled = true;
      fallbackBtn.innerText = 'Секунду...';
    }

    try {
      const response = await bookSlot(userId, type, selectedIso, durationMinutes, { name: clientName, phone: clientPhone });

      if (isTelegram) {
        twa.MainButton.hideProgress();
        twa.MainButton.hide();
        if (twa.BackButton) twa.BackButton.hide();
        twa.MainButton.offClick(onConfirmClick);
      }
      fallbackBtn.style.display = 'none';

      let isSuccess = true;
      try {
        const respStr = typeof response === 'string' ? response : JSON.stringify(response);
        const cleanResp = respStr.replace(/\s+/g, '').replace(/"/g, "'").toLowerCase();
        if (cleanResp.includes("'success':false") || cleanResp.includes("'success':'false'")) {
          isSuccess = false;
        }
      } catch (err) {
        console.warn("Ошибка парсинга ответа n8n", err);
      }

      if (!isSuccess) {
        showErrorSlotOccupied(app, twa, userId);
      } else {
        showSuccess(app, twa, type, dayStr, timeStr);
      }
    } catch (e) {
      if (isTelegram) {
        twa.MainButton.hideProgress();
        twa.MainButton.enable();
      } else {
        fallbackBtn.disabled = false;
        fallbackBtn.innerText = 'ПОДТВЕРДИТЬ ЗАПИСЬ';
      }

      if (typeof twa.showAlert === 'function') {
        twa.showAlert("Произошла ошибка при бронировании.");
      } else {
        alert("Произошла ошибка при бронировании. Пожалуйста, попробуйте снова.");
      }
    }
  }

  if (isTelegram) {
    twa.MainButton.offClick(onConfirmClick);
    twa.MainButton.onClick(onConfirmClick);
  }
  fallbackBtn.addEventListener('click', onConfirmClick);
}

function showSuccess(app, twa, type, dayStr, timeStr) {
  const eventName = type === 'call' ? 'звонке' : 'встрече';

  app.innerHTML = `
    <div class="success-view" style="padding-top: 100px;">
      <div class="welcome-icon logo-fixed">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
      </div>
      
      <div class="success-icon" style="margin-bottom: 16px;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 64px; height: 64px;">
          <circle cx="12" cy="12" r="12" fill="var(--button-color)" fill-opacity="0.2"/>
          <path d="M16.5 8L10.5 14L7.5 11" stroke="var(--button-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 style="text-align: center;">Запись подтверждена!</h1>
      <p class="subtitle" style="margin-bottom: 32px;">Ждем вас ${dayStr} в ${timeStr}. Вы получите уведомление в боте с напоминанием о ${eventName}.</p>
      
      <button id="btn-close-app" class="btn">ВЫЙТИ</button>
    </div>
  `;

  document.getElementById('btn-close-app').addEventListener('click', () => {
    if (typeof twa.close === 'function') {
      twa.close();
    } else {
      try { window.close(); } catch (e) { }
    }
  });
}

function showErrorSlotOccupied(app, twa, userId) {
  app.innerHTML = `
    <div class="success-view" style="padding-top: 100px;">
      <div class="welcome-icon logo-fixed">
        <img src="/logo.svg" alt="Sienkiewicz Dom" style="width: 100%; height: auto; display: block;" onerror="this.style.display='none'">
      </div>
      
      <div class="success-icon" style="margin-bottom: 16px;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 64px; height: 64px;">
          <circle cx="12" cy="12" r="12" fill="#ff3b30" fill-opacity="0.2"/>
          <path d="M12 8V12M12 16H12.01" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 style="text-align: center;">Время уже занято</h1>
      <p class="subtitle" style="margin-bottom: 32px;">Извините, время уже занято. Выберите, пожалуйста, новое.</p>
      
      <button id="btn-return" class="btn">ВЕРНУТЬСЯ</button>
    </div>
  `;

  document.getElementById('btn-return').addEventListener('click', () => {
    // Возвращаем на первый экран (выбор услуги)
    renderServiceSelection(app, twa, userId);
  });
}
