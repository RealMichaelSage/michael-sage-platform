import os

replacements = {
    "base/research-agentic-processes/index.html": [
        ("<title>Как внедрить ИИ-агентов в бизнес: Пошаговый план, окупаемость (ROI) и безопасность — Руководство 2026 | Михаил Пузырёв</title>", "<title>Внедрение ИИ-агентов в бизнес: План и Окупаемость | Михаил Пузырёв</title>")
    ],
    "base/research-agentic-processes.html": [
        ("<title>Как внедрить ИИ-агентов в бизнес: Пошаговый план, окупаемость (ROI) и безопасность — Руководство 2026 | Михаил Пузырёв</title>", "<title>Внедрение ИИ-агентов в бизнес: План и Окупаемость | Михаил Пузырёв</title>")
    ],
    "google-one-guide.html": [
        ("<title>Как создать, настроить и оплатить Google One (AI Premium) из РФ — Пошаговое руководство 2026 | Михаил Пузырёв</title>", "<title>Оплата и настройка Google One (AI Premium) из РФ 2026 | Михаил Пузырёв</title>")
    ],
    "solutions/lead-scraping-engine/index.html": [
        ("<title>Парсинг целевых ЛПР из открытых источников и AI-скоринг — Инженерный Гайд | Михаил Пузырёв</title>", "<title>Парсинг и AI-скоринг целевых ЛПР из баз данных | Михаил Пузырёв</title>")
    ],
    "solutions/lead-scraping-engine.html": [
        ("<title>Парсинг целевых ЛПР из открытых источников и AI-скоринг — Инженерный Гайд | Михаил Пузырёв</title>", "<title>Парсинг и AI-скоринг целевых ЛПР из баз данных | Михаил Пузырёв</title>")
    ],
    "calculator-tax.html": [
        ("<title>Калькулятор Налогов и Наценки (УСН 6%, 7%, 9%, НДС, Эквайринг) — Михаил Пузырёв</title>", "<title>Калькулятор налогов, НДС и наценки для ИП/ООО | Михаил Пузырёв</title>")
    ],
    "prompts.html": [
        ("<title>Библиотека Системных Промптов (37 Профессиональных Ролей) — Михаил Пузырёв</title>", "<title>Библиотека системных ИИ-промптов (37 ролей) | Михаил Пузырёв</title>")
    ]
}

for file, pairs in replacements.items():
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in pairs:
            content = content.replace(old, new)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
