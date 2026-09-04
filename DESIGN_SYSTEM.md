# 📐 DESIGN SYSTEM: Swiss Stark AI (Vibes UI Engine 3.0)
**Официальная дизайн-система платформы Михаила Пузырёва (`a-sage.ru` / `michaelpuzyrev.ru`)**

---

## 1. 🏛 Философия и ДНК Бренда
- **Стиль:** **Swiss Stark Brutalism / Инженерный Минимализм**.
- **Ключевые принципы:**
  - **Высокий контраст и монохромность:** Чистый белый холст (`#ffffff`), глубокий угольно-черный (`#09090b`), прецизионная сетка серых оттенков.
  - **Инженерная эстетика:** Моноширинные технические бейджи (`JetBrains Mono`), четкие линейные разделители (`1px solid`), отсутствие декоративного визуального шума.
  - **Анти-шаблоны (СТРОГО ЗАПРЕЩЕНО):**
    - ❌ **НИКАКИХ скруглений углов (ZERO BORDER-RADIUS):** Запрещены любые скругления (`border-radius: 0px !important;` везде без исключений: кнопки, карточки, инпуты, аватары, чипы, плашки, бейджи, всплывающие окна, модалки, чекбоксы).
    - ❌ **НИКАКИХ фиолетовых, сиреневых или пастельно-пурпурных фонов** (`#faf5ff`, `#7e22ce`, `#a855f7`, `#d8b4fe`, `#c084fc`).
    - ❌ **Никаких радужных градиентов** и размытых «неоновых» свечений.
    - ❌ **Никаких узких центрированных колонок** (сетка 1440–1600px).
    - ❌ **Никаких дублирующихся аккаунтов** или декоративных точек-буллетов в текстовых строках.

---

## 2. 🎨 Цветовая Палитра (Design Tokens)

### 2.1. Базовая монохромная матрица (Основа сайта)
| Токен CSS | Hex / Значение | Назначение |
| :--- | :--- | :--- |
| `--bg` | `#ffffff` | Основной фон страниц и светлых карточек |
| `--bg-gray` | `#f8fafc` | Второстепенный фон блоков, подложка таблиц |
| `--bg-card` | `#f4f4f5` | Подложка чипов, превью-блоков, полей ввода |
| `--bg-dark` | `#09090b` | Глубокий черный фон темных секций и акцентных карточек |
| `--bg-dark-card` | `#18181b` | Карточки внутри темных секций, премиум-плашки |
| `--black` | `#09090b` | Основной цвет заголовков, текста, главных кнопок |
| `--gray` | `#52525b` | Основной цвет описаний, параграфов и пояснений |
| `--gray-light` | `#71717a` / `#a1a1aa` | Мета-информация, неактивные подписи, лейблы |
| `--border` | `#e2e8f0` / `#e4e4e7` | Стандартные границы карточек, таблиц и разделителей |
| `--border-dark` | `#27272a` / `#3f3f46` | Границы внутри темных блоков |

### 2.2. Функциональные семантические акценты (Только по назначению)
> Акцентные цвета используются исключительно для функционального статуса (успех, ошибка, ссылка, статус синхронизации). Запрещено заливать ими целые карточки или секции!

| Назначение | Фоновый токен | Текстовый токен | Граница | Применение |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Online** | `#ecfdf5` | `#059669` / `#10b981` | `#a7f3d0` | Статус «● Онлайн», метки «ОТКРЫТЫЙ КУРС», ссылки на сайт |
| **Info / Telegram** | `#f0f9ff` | `#0284c7` | `#bae6fd` | Чипы Telegram-каналов (`📢 @uncrn_sage`), инфо-подсказки |
| **Destructive / Error** | `#fef2f2` | `#ef4444` | `#fecaca` | Ошибки валидации, кнопки удаления, отмена |
| **PRO / Black Card** | `#09090b` / `#18181b` | `#ffffff` | `#27272a` | Бейджи «PRO», статус «💎 Резидент Клуба», карточка Клуба |

---

## 3. 🔤 Типографика

### 3.1. Шрифтовые гарнитуры
1. **Основной шрифт (Headers & UI):** `'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
   - Начертания: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold).
   - Letter-spacing для заголовков H1-H3: `-0.02em` ... `-0.04em`.
2. **Технический шрифт (Code, Meta, Numbers, Badges):** `'JetBrains Mono', monospace`
   - Начертания: `400` (Regular), `500` (Medium), `700` (Bold).
   - Text-transform для меток: `uppercase`, letter-spacing: `0.04em` ... `0.08em`.

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

### 4.2. Бейджи и Метки (Badges & Chips)
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

### 4.3. Карточки (Cards)
- **Стандартная карточка (Light):**
  - Фон: `#ffffff`
  - Граница: `1px solid var(--border)` (`#e2e8f0`)
  - Паддинг: `28px` – `32px`
  - Hover: `transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.04);`
- **Премиум / Dark Focus карточка (Club / PRO):**
  - Фон: `#09090b`
  - Текст: Заголовки `#ffffff`, параграфы `#a1a1aa`, списки `#d4d4d8`
  - Граница: `1px solid #27272a`
  - Кнопка внутри: Инвертированная белая (`background: #ffffff; color: #09090b;`)

### 4.4. Навигационные Табы (Tab Navigation Bar)
- Высота: `54px` – `60px`
- Фон бара: `#fafafa` с нижней границей `1px solid var(--border)`
- Активная кнопка таба: Нижняя полоса `border-bottom: 2px solid #09090b`, цвет текста `#09090b`, фон `#ffffff`
- Неактивная кнопка: `color: var(--gray)`, фон прозрачный

---

## 5. 📏 Сетка и Адаптивность (Layout & Breakpoints)
- **Контейнер страницы:** `max-width: 1440px` (до `1600px` в навигации), центрирован с боковыми границами `border-left / border-right: 1px solid var(--border)`.
- **Брейкпоинты:**
  - `> 1200px`: Полноразмерный десктоп (2-3 колонки)
  - `769px – 1199px`: Планшет (2 колонки)
  - `≤ 768px`: Мобильные устройства (1 колонка, горизонтальный скролл табов, бургер-меню)

---

## 6. 🛡 Правила строгого соответствия
При любом создании или редактировании страниц платформы (`a-sage.ru` / `michaelpuzyrev.ru`):
1. **Сверять стили** с данным файлом `DESIGN_SYSTEM.md`.
2. **Категорически не использовать** посторонние цвета (пурпурный, оранжевый, розовый) вне утвержденных функциональных токенов.
3. **Сохранять бруталистскую строгость**, типографику Space Grotesk + JetBrains Mono и высокий монохромный контраст.
