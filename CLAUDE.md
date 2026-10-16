# GRG Design System: Storybook

Код-версія дизайн-системи GRG (Golden Ratio Group), яку Lera оновлювала як єдина дизайнерка. Storybook будуємо з нуля разом з Claude; далі він стане частиною кейсу в портфоліо (репозиторій LeraDryha/portfolio).

- Lera — продуктова дизайнерка, код не читає. Claude пише весь код і звітує мовою дизайну. Спілкування українською, мова Storybook — англійська.
- Правила для компонентів і сторіз: [instructions.md](./instructions.md). Їх читаємо перед будь-якою зміною.
- Джерело правди — Figma-файл GRG Design System (`r3E5XdifyoiiNeuj7mOjBk`). Figma MCP підключено до акаунта Lera в Golden Ratio. Сторінки файлу вантажаться ліниво: читаємо через `use_figma` з `await page.loadAsync()`.
- Лише золота (світла) і темна теми. White-label палітри не переносимо. Логотипів GRX Pay / GRX Exchange / Golden Ratio Exchange не показуємо.
- Display-стилі (шрифт Bounded) у Storybook не переносимо. Контраст кольорів лишаємо як у Figma; фокус клавіатури — системним синім (`--focus-ring` у `src/styles/system.css`).
- У Figma-файлі нічого не змінюємо. Карта вузлів Figma: `figma/nodes.md`.
- Репозиторій публічний: LeraDryha/grg-design-system.
- Мета на потім: система, з якою може працювати AI-агент (описи компонентів у Figma, code syntax змінних, звірка Figma ↔ код).
- Комітимо й пушимо лише з дозволу Lera.

Запуск: `npm run storybook` (порт 6006). Збірка: `npm run build-storybook`. Токени: `npm run tokens`.
