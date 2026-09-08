# 📐 DESIGN SYSTEM: Swiss Stark AI (Vibes UI Engine 3.0)
**Официальная дизайн-система платформы Михаила Пузырёва (`a-sage.ru` / `michaelpuzyrev.ru`)**

---

## 1. 🏛 Философия и&nbsp;ДНК Бренда
- **Стиль:** **Swiss Stark Brutalism / Инженерный Минимализм**.
- **Ключевые принципы:**
  - **Высокий контраст и&nbsp;монохромность:** Чистый белый холст (`#ffffff`), глубокий угольно-черный (`#09090b`), прецизионная сетка серых оттенков.
  - **Инженерная эстетика:** Моноширинные технические бейджи (`JetBrains Mono`), четкие линейные разделители (`1px solid`), отсутствие декоративного визуального шума.
  - **Анти-шаблоны (СТРОГО ЗАПРЕЩЕНО):**
    - ❌ **НИКАКИХ скруглений углов (ZERO BORDER-RADIUS):** Запрещены любые скругления (`border-radius: 0px !important;` везде без&nbsp;исключений: кнопки, карточки, инпуты, аватары, чипы, плашки, бейджи, всплывающие окна, модалки, чекбоксы).
    - ❌ **НИКАКИХ фиолетовых, сиреневых или&nbsp;пастельно-пурпурных фонов** (`#faf5ff`, `#7e22ce`, `#a855f7`, `#d8b4fe`, `#c084fc`).
    - ❌ **Никаких радужных градиентов** и&nbsp;размытых «неоновых» свечений.
    - ❌ **Никаких узких центрированных колонок** (сетка 1440–1600px).
    - ❌ **Никаких дублирующихся аккаунтов** или&nbsp;декоративных точек-буллетов в&nbsp;текстовых строках.

---

## 2. 🎨 Цветовая Палитра (Design Tokens)

### 2.1. Базовая монохромная матрица (Основа сайта)
| Токен CSS | Hex / Значение | Назначение |
| :--- | :--- | :--- |
| `--bg` | `#ffffff` | Основной фон страниц и&nbsp;светлых карточек |
| `--bg-gray` | `#f8fafc` | Второстепенный фон блоков, подложка таблиц |
| `--bg-card` | `#f4f4f5` | Подложка чипов, превью-блоков, полей ввода |
| `--bg-dark` | `#09090b` | Глубокий черный фон темных секций и&nbsp;акцентных карточек |
| `--bg-dark-card` | `#18181b` | Карточки внутри темных секций, премиум-плашки |
| `--black` | `#09090b` | Основной цвет заголовков, текста, главных кнопок |
| `--gray` | `#52525b` | Основной цвет описаний, параграфов и&nbsp;пояснений |
| `--gray-light` | `#71717a` / `#a1a1aa` | Мета-информация, неактивные подписи, лейблы |
| `--border` | `#e2e8f0` / `#e4e4e7` | Стандартные границы карточек, таблиц и&nbsp;разделителей |
| `--border-dark` | `#27272a` / `#3f3f46` | Границы внутри темных блоков |

### 2.2. Функциональные семантические акценты (Только по&nbsp;назначению)
> Акцентные цвета используются исключительно для&nbsp;функционального статуса (успех, ошибка, ссылка, статус синхронизации). Запрещено заливать ими целые карточки или&nbsp;секции!

| Назначение | Фоновый токен | Текстовый токен | Граница | Применение |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Online** | `#ecfdf5` | `#059669` / `#10b981` | `#a7f3d0` | Статус «● Онлайн», метки «ОТКРЫТЫЙ КУРС», ссылки на&nbsp;сайт |
| **Info / Telegram** | `#f0f9ff` | `#0284c7` | `#bae6fd` | Чипы Telegram-каналов (`📢 @uncrn_sage`), инфо-подсказки |
| **Destructive / Error** | `#fef2f2` | `#ef4444` | `#fecaca` | Ошибки валидации, кнопки удаления, отмена |
| **PRO / Black Card** | `#09090b` / `#18181b` | `#ffffff` | `#27272a` | Бейджи «PRO», статус «💎 Резидент Клуба», карточка Клуба |

---

## 3. 🔤 Типографика

### 3.1. Шрифтовые гарнитуры
1. **Основной шрифт (Headers &&nbsp;UI):** `'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
   - Начертания: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold).
   - Letter-spacing для&nbsp;заголовков H1-H3: `-0.02em` ... `-0.04em`.
2. **Технический шрифт (Code, Meta, Numbers, Badges):** `'JetBrains Mono', monospace`
   - Начертания: `400` (Regular), `500` (Medium), `700` (Bold).
   - Text-transform для&nbsp;меток: `uppercase`, letter-spacing: `0.04em` ... `0.08em`.

### 3.2. Иерархия масштабирования
- **Hero H1:** `clamp(2.2rem, 4vw, 3.6rem)`, font-weight: `800`, line-height: `1.15`.
- **Section H2:** `clamp(1.6rem, 2.5vw, 2.4rem)`, font-weight: `800`, line-height: `1.2`.
- **Card H3:** `1.25rem` – `1.5rem`, font-weight: `700` – `800`, line-height: `1.3`.
- **Body Text:** `0.95rem` – `1.05rem`, line-height: `1.6`, color: `var(--gray)`.
- **Meta / Subtitle:** `0.75rem` – `0.85rem`, `font-family: var(--mono)`.

---

## 4. 🧩 Спецификация UI-Компонентов

### 4.1. Кнопки (Buttons)
```css
/* 1. Primary Button (Solid Black) */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #09090b;
  color: #ffffff;
  border: 1px solid #09090b;
  padding: 12px 24px;
  font-family: var(--mono);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 0;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.btn-primary:hover {
  background: #18181b;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

/* 2. Secondary Button (Outlined White) */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  color: #09090b;
  border: 1px solid #09090b;
  padding: 12px 24px;
  font-family: var(--mono);
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 0;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary:hover {
  background: #f4f4f5;
  transform: translateY(-1px);
}

/* 3. Dark-Context CTA Button (Inverted White on Black) */
.btn-dark-cta {
  background: #ffffff;
  color: #09090b;
  border: 1px solid #ffffff;
  padding: 14px 28px;
  font-family: var(--mono);
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 0;
  transition: all 0.2s ease;
}
.btn-dark-cta:hover {
  background: #f4f4f5;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
}
```

### 4.2. Бейджи и&nbsp;Метки (Badges &&nbsp;Chips)
```css
/* Базовый системный бейдж */
.badge-role {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
  border-radius: 0;
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #09090b;
}

/* Премиум / PRO / Клубный бейдж */
.badge-role.club, .badge-pro {
  background: #18181b;
  border-color: #18181b;
  color: #ffffff;
  border-radius: 0;
}

/* Открытый / Успешный статус */
.badge-role.success {
  background: #ecfdf5;
  border-color: #a7f3d0;
  color: #047857;
  border-radius: 0;
}
```

### 4.3. Карточки и&nbsp;Плашки (Cards &&nbsp;Option Blocks)

> ⚠️ **КРИТИЧЕСКИЙ СТАНДАРТ:** Запрещены любые «недорисованные» или&nbsp;«висящие в&nbsp;воздухе» плашки без&nbsp;границ (`border: none` СТРОГО ЗАПРЕЩЁН). Все карточки, колонки и&nbsp;блоки сравнения обязаны иметь явную физическую рамку `border: 1px solid var(--border)` (`#e4e4e7` / `#e2e8f0`) либо контрастную статусную окантовку.

1. **Стандартная карточка (Light Feature Card):**
   - Фон: `#ffffff`
   - Граница: `1px solid var(--border)` (`#e4e4e7`)
   - Скругление: `0px` (`border-radius: 0 !important;`)
   - Паддинг: `clamp(24px, 3vw, 36px)`
   - Hover: `border-color: #a1a1aa; transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.04);`

2. **Сравнительные карточки форматов (Comparison / Option Cards):**
   - **Негативный/Устаревший вариант (Курсы в&nbsp;записи / ❌):**
     - Фон: `#ffffff`, Граница: `1px solid var(--border)`, верхняя планка: `border-top: 3px solid #ef4444`
     - Бейдж: `<span style="color:#ef4444; background:#fef2f2; border:1px solid #fecaca;">КУРСЫ В&nbsp;ЗАПИСИ ❌</span>`
   - **Нейтральный вариант (Обычный трекер / ❌):**
     - Фон: `#ffffff`, Граница: `1px solid var(--border)`, верхняя планка: `border-top: 3px solid #f59e0b`
     - Бейдж: `<span style="color:#b45309; background:#fffbeb; border:1px solid #fde68a;">ОБЫЧНЫЙ ТРЕКЕР ❌</span>`
   - **Рекомендуемый флагманский вариант (Личное сопровождение / ✅):**
     - Фон: `#f0fdf4`, Граница: `2px solid #10b981`, Текст заголовка: `#064e3b`
     - Бейджи: `<span style="color:#047857; background:#dcfce7; border:1px solid #86efac;">ЛИЧНОЕ СОПРОВОЖДЕНИЕ ✅</span>` + `<span style="color:#fff; background:#10b981;">РЕКОМЕНДУЕМ</span>`
     - Тень: `box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08);`

3. **Премиум / Dark Focus карточка (Club / PRO / VIP):**
   - Фон: `#09090b`
   - Текст: Заголовки `#ffffff`, параграфы `#a1a1aa`, списки `#d4d4d8`
   - Граница: `1px solid #27272a`
   - Кнопка внутри: Инвертированная белая (`background: #ffffff; color: #09090b;`)

### 4.4. Навигационные Табы (Tab Navigation Bar)
- Высота: `54px` – `60px`
- Фон бара: `#fafafa` с&nbsp;нижней границей `1px solid var(--border)`
- Активная кнопка таба: Нижняя полоса `border-bottom: 2px solid #09090b`, цвет текста `#09090b`, фон `#ffffff`
- Неактивная кнопка: `color: var(--gray)`, фон прозрачный

### 4.5. Компонент FAQ (Аккордеон Частых Вопросов)
> 📐 **СТАНДАРТ ЧИСТЫХ ГОРИЗОНТАЛЬНЫХ РАЗДЕЛИТЕЛЕЙ (Zero Box / Flat Line Accordion):**
> Раздел FAQ на&nbsp;всех страницах платформы оформляется в&nbsp;минималистичном реестровом стиле без&nbsp;внешней замкнутой рамки и&nbsp;без боковых рамок вокруг вопросов. Эталоны: `/mentoring` и&nbsp;`/corporate`.

1. **Архитектура, Изоляция и&nbsp;Геометрия (Строгий Закон Верстки):**
   - Секция FAQ обязана быть **непосредственным прямым потомком `<main>`**:
     ```html
     <section id="faq" class="section section-border section-pad" data-nav-title="Вопросы">
       <div class="section-tag">ЧАСТЫЕ ВОПРОСЫ</div>
       <h2 class="section-title">...</h2>
       <div class="faq-list">
         <div class="faq-item">
           <button class="faq-q" type="button">
             <span>1. Текст вопроса?</span>
             <span class="faq-icon">+</span>
           </button>
           <div class="faq-a">
             <div class="faq-a-inner">
               Ответ с&nbsp;выделением ключевых акцентов и&nbsp;неразрывными предлогами.
             </div>
           </div>
         </div>
       </div>
     </section>
     ```
   - ❌ **КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО** вкладывать секцию FAQ внутрь предшествующих секций (тарифов `#pricing`, кейсов `#cases`, аудита `#audit` и&nbsp;т.д.):
     - При&nbsp;вложении возникает двойной горизонтальный паддинг (`64px` внутри `64px`), из-за чего ширина реестра вопросов сжимается с&nbsp;эталонных **1310px** до&nbsp;**1180px**.
     - Верхний разделитель `section-border` оказывается зажатым внутри родительской секции.
     - При&nbsp;скролле к&nbsp;«Вопросам» или&nbsp;переходе по&nbsp;якорю карточки предыдущего блока нависают сверху над&nbsp;заголовком FAQ, а&nbsp;боковой трекер (Scroll Spy) ошибочно удерживает активным предыдущий пункт меню (например, «Тарифы»).
   - **Все предшествующие секции обязаны быть закрыты тегом `</section>` до&nbsp;объявления `<section id="faq">`.**

2. **Стилистика и&nbsp;разделители:**
   - ❌ **СТРОГО ЗАПРЕЩЕНА** внешняя замкнутая рамка у&nbsp;`.faq-list` (`border-left`, `border-right`, `border-bottom`).
   - ❌ **СТРОГО ЗАПРЕЩЕНЫ** 4-сторонние рамки-плашки у&nbsp;каждого элемента `.faq-item`.
   - **Только сквозные горизонтальные линии:**
     - `.faq-list`: `border-top: 1px solid var(--border); border-left: none; border-right: none; border-bottom: none;`
     - `.faq-item`: `border-bottom: 1px solid var(--border); border-left: none; border-right: none; background: transparent;`
     - `.faq-item:last-child`: гарантированный `border-bottom: 1px solid var(--border);` (линия внизу никогда не&nbsp;прерывается и&nbsp;не стирается).
   - **Выравнивание и&nbsp;отступы:**
     - `.faq-q`: `padding: 24px 0;` (вопрос выравнивается строго по&nbsp;левому краю заголовка секции).
     - `.faq-a-inner`: `padding: 0 0 24px 0;`.
   - **Иконка-переключатель:**
     - Размер `26px × 26px`, `border: 1px solid var(--border)`, `border-radius: 0`, `font-family: var(--mono)`.
     - При&nbsp;раскрытии (`.open`): `transform: rotate(45deg); background: var(--black); color: #ffffff; border-color: var(--black);`.
   - **Анимация:** плавное раскрытие через CSS Grid (`grid-template-rows: 0fr` → `1fr`).

3. **Опциональный завершающий баннер прямого контакта (FAQ Closure Banner):**
   - На&nbsp;продуктовых страницах (как&nbsp;на `/corporate`) внизу реестра вопросов допускается размещение аккуратной плашки для&nbsp;прямой связи:
     ```html
     <div style="max-width:1440px; margin:36px auto 0; padding:28px 32px; background:#ffffff; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
       <div>
         <div class="meta-label" style="color:var(--emerald); margin-bottom:4px;">// ОСТАЛИСЬ ВОПРОСЫ ПО&nbsp;ПРОГРАММЕ?</div>
         <div style="font-size:1.05rem; font-weight:700; color:var(--black);">Задайте вопрос напрямую Михаилу Пузырёву в&nbsp;Telegram</div>
         <div style="font-size:0.88rem; color:var(--gray); margin-top:2px;">Отвечу на&nbsp;технические нюансы и&nbsp;помогу подобрать формат.</div>
       </div>
       <a href="https://t.me/mikhail_sage" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:12px 24px; text-decoration:none; font-weight:700; font-size:0.9rem; white-space:nowrap;">
         Написать в&nbsp;Telegram →
       </a>
     </div>
     ```

---

## 5. 📏 Сетка и&nbsp;Адаптивность (Layout &&nbsp;Breakpoints)
- **Контейнер страницы:** `max-width: 1440px` (до&nbsp;`1600px` в&nbsp;навигации), центрирован с&nbsp;боковыми границами `border-left / border-right: 1px solid var(--border)`.
- **Брейкпоинты:**
  - `> 1200px`: Полноразмерный десктоп (2-3 колонки)
  - `769px – 1199px`: Планшет (2 колонки)
  - `≤ 768px`: Мобильные устройства (1 колонка, горизонтальный скролл табов, бургер-меню)

---

## 6. 🛡 Правила строгого соответствия
При&nbsp;любом создании или&nbsp;редактировании страниц платформы (`a-sage.ru` / `michaelpuzyrev.ru`):
1. **Сверять стили** с&nbsp;данным файлом `DESIGN_SYSTEM.md`.
2. **Категорически не&nbsp;использовать** посторонние цвета (пурпурный, оранжевый, розовый) вне утвержденных функциональных токенов.
3. **Сохранять бруталистскую строгость**, типографику Space Grotesk + JetBrains Mono и&nbsp;высокий монохромный контраст.
