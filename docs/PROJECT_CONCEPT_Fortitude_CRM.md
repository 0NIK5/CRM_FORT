# Fortitude CRM + Donor Portal — концепт проєкту

Версія: 1.0
Дата: липень 2026
Призначення документа: технічне завдання для старту розробки. Використовувати як базовий контекст при роботі з Claude Code.

---

## 1. Мета проєкту

Замінити ручне ведення Airtable/Google Sheets власною web-based платформою для благодійного фонду grant-based/institutional профілю (кейс: БФ «Фортітьюд ЮА»).

Два окремі застосунки на спільній базі даних і API:

1. **Admin CRM** — внутрішній інструмент команди фонду (донори, гранти, бюджети, звітність, комплаєнс)
2. **Donor Portal** — публічний read-only кабінет, у якому донор бачить стан своїх грантів, освоєння бюджету, метрики впливу, звіти

---

## 2. Функціональні вимоги (TOR)

### 2.1 Admin CRM

- Ведення картки донора/партнера (реквізити, тип, статус, due diligence)
- Ведення воронки грантів (lead → proposal → negotiation → signed → active → closed → renewed)
- Облік траншів/виплат по грантах
- Бюджетування по статтях, план vs факт, автоматичний прапорець відхилення
- Реєстрація звітів (наративних/фінансових/аудиторських/державних), дедлайни, статуси
- Облік польових метрик (пацієнти, консультації, локації) по проєктах
- Комплаєнс-модуль: санкційні перевірки, due diligence документи, термін дії
- Завдання/дедлайни, прив'язані до донора або гранту
- Окремий трекер державної звітності (ДПС, статистика) — не прив'язаний до конкретного гранту
- Дашборди: grant pipeline, cash flow forecast, budget utilization, donor concentration, reporting calendar, compliance alerts
- Права доступу на рівні ролей (field team / finance / partnerships manager / director)

### 2.2 Donor Portal

- Авторизація донора (окремий логін, не той самий, що у staff)
- Дашборд: виділено / освоєно / залишок по грантах цього донора
- Часова шкала виплат зі статусами
- Розбивка бюджету по статтях (план vs факт), агреговано
- Метрики впливу по проєктах донора (пацієнти, локації, консультації, з датами)
- Бібліотека звітів (PDF) з можливістю завантаження
- Опційно: стрічка апдейтів з поля (фото + короткий текст)
- Row-level security: донор технічно не може отримати доступ до чужих даних навіть через підбір ID в URL/API

### 2.3 Інтеграції

- 1С:Підприємство → синхронізація actual_amount у бюджетні статті
- Kobo/ODK → синхронізація польових метрик
- Email/календар → логування комунікації і задач (опційно, друга черга)

### 2.4 Нефункціональні вимоги

- Шифрування даних у спокої і в дорозі (TLS, encrypted DB volumes)
- Аудит-лог дій користувачів
- Щоденне резервне копіювання БД з перевіркою відновлення
- Signed URLs для файлів звітності (не публічні бакети)
- Відповідність вимогам донорів щодо локації хостингу (якщо застосовно — сервери в ЄС)

---

## 3. Архітектура даних (ER-модель)

Джерело правди для схеми БД — цей DBML-блок. При зміні структури спочатку редагується він, потім генерується міграція.

```dbml
Table donors {
  donor_id        integer   [pk, increment]
  legal_name      varchar   [not null]
  type            varchar   [note: 'institutional / corporate / individual / in-kind']
  country         varchar
  status          varchar   [note: 'prospect / active / dormant / declined / blacklist']
  currency        varchar
  bank_details    text
  source          varchar   [note: 'referral / inbound / call_for_proposals / conference']
  created_at      timestamp [default: `now()`]
  updated_at      timestamp
}

Table contacts {
  contact_id            integer   [pk, increment]
  donor_id              integer   [ref: > donors.donor_id]
  name                  varchar   [not null]
  position              varchar
  role                  varchar   [note: 'decision_maker / program_officer / finance_officer']
  channel               varchar
  language              varchar
  last_interaction_date date
}

Table staff {
  staff_id   integer   [pk, increment]
  name       varchar
  role       varchar   [note: 'field_team / finance / partnerships_manager / director']
  email      varchar
}

Table grants {
  grant_id                   integer   [pk, increment]
  donor_id                   integer   [ref: > donors.donor_id]
  project_name                varchar   [not null]
  stage                      varchar   [note: 'lead / proposal / negotiation / signed / active / closed / renewed']
  amount                     numeric(14,2)
  currency                   varchar
  start_date                 date
  end_date                   date
  kpi_targets                jsonb
  responsible_manager_id      integer   [ref: > staff.staff_id]
  agreement_file_url          text
  reporting_requirements      text
  customs_humanitarian_flag   boolean   [default: false]
}

Table grant_co_funders {
  grant_id   integer [ref: > grants.grant_id]
  donor_id   integer [ref: > donors.donor_id]
  Note: 'many-to-many для співфінансуючих донорів'
}

Table payments {
  payment_id           integer   [pk, increment]
  grant_id             integer   [ref: > grants.grant_id]
  date                 date
  amount               numeric(14,2)
  currency             varchar
  fx_rate              numeric(10,4)
  tranche_number        integer
  status               varchar   [note: 'planned / received / confirmed']
  bank_statement_ref     varchar
}

Table budget_lines {
  line_id          integer   [pk, increment]
  grant_id         integer   [ref: > grants.grant_id]
  category         varchar   [note: 'паливо / зарплата / медикаменти / оренда / логістика / амортизація']
  planned_amount    numeric(14,2)
  actual_amount     numeric(14,2)  [note: 'sync з 1С']
  variance_pct      numeric(6,2)   [note: 'обчислюване поле']
  flag_deviation    boolean        [default: false]
}

Table reports {
  report_id          integer   [pk, increment]
  grant_id           integer   [ref: > grants.grant_id]
  type               varchar   [note: 'narrative / financial / combined / audit / state']
  deadline_planned    date
  date_submitted      date
  status             varchar   [note: 'draft / submitted / approved / rejected / revision']
  file_url            text
  donor_feedback      text
}

Table program_data {
  record_id             integer   [pk, increment]
  grant_id              integer   [ref: > grants.grant_id]
  location              varchar
  date                  date
  patients_count         integer
  consultations_count    integer
  meds_issued           integer
  source                varchar   [note: 'kobo_odk_sync / manual']
}

Table compliance {
  compliance_id         integer   [pk, increment]
  donor_id              integer   [ref: > donors.donor_id]
  sanctions_check_date    date
  sanctions_result       varchar
  pep_check              boolean
  own_docs_url            text      [note: 'статут / витяг ЄДР / довідка неприбутковості']
  docs_expiry_date        date
}

Table tasks {
  task_id       integer   [pk, increment]
  linked_type   varchar   [note: 'donor / grant']
  linked_id     integer
  type          varchar   [note: 'call / meeting / site_visit / report_deadline / renewal']
  assignee_id   integer   [ref: > staff.staff_id]
  deadline      date
  status        varchar
}

Table state_reporting {
  id                integer   [pk, increment]
  period            date
  form_type         varchar   [note: 'ДПС / форма №1-м / №2-м / 4ДФ']
  deadline          date
  date_submitted     date
  status            varchar
}

Table donor_users {
  donor_user_id   integer   [pk, increment]
  donor_id        integer   [ref: > donors.donor_id]
  email           varchar   [not null, unique]
  auth_provider_id varchar
  created_at      timestamp [default: `now()`]
  Note: 'логін для Donor Portal, окремий від staff'
}
```

### 3.1 Права доступу (view-level)

| Роль | DONORS/GRANTS | PAYMENTS/BUDGET | PROGRAM_DATA | REPORTS |
|---|---|---|---|---|
| Field team | read-only | немає | write | немає |
| Finance | read | write | read | write (financial) |
| Partnerships manager | write | read | read | write (narrative) |
| Директор | write | write | read | approve |
| Donor (portal) | read (тільки власні grants) | read (тільки власні, агреговано) | read (тільки власні) | read (тільки власні, тільки схвалені) |

Розділення прав реалізується на рівні API/row-level security в БД, не тільки на фронтенді.

### 3.2 Дашборди (view-и над таблицями)

- **Grant Pipeline** — grants.stage × amount, воронка
- **Cash Flow Forecast** — payments.status=planned, за кварталами
- **Budget Utilization** — budget_lines, план vs факт по активних grants
- **Donor Concentration** — сума grants.amount, згруповано за donors, % від загального
- **Reporting Calendar** — reports.deadline_planned + state_reporting.deadline, найближчі 90 днів
- **Compliance Alerts** — compliance.docs_expiry_date < 60 днів

---

## 4. Технологічний стек

```
Backend:         NestJS (TypeScript) + PostgreSQL + Prisma (ORM)
Frontend admin:  Next.js + Refine + Tailwind CSS
Frontend donor:  Next.js + Tailwind CSS (кастомний UI)
Auth:            Keycloak (self-hosted) або Auth0 — розділені логіни staff/donor
Файлове сховище: Cloudflare R2 (S3-сумісне), signed URLs
Черги:           BullMQ + Redis (синхронізація 1С/Kobo, нагадування дедлайнів)
Хостинг:         Hetzner (ЄС) + Docker Compose
CI/CD:           GitHub Actions
Моніторинг:      Sentry + UptimeRobot
API-документація: OpenAPI/Swagger (автогенерація з NestJS)
```

Причина вибору: єдина мова (TypeScript) на backend і frontend знижує вартість команди; Prisma генерує типи з тієї ж схеми, що описана в DBML вище — одне джерело правди для БД, міграцій і типів.

### 4.1 Інтеграції

| Джерело | Метод |
|---|---|
| 1С:Підприємство | REST/OData через 1С:Веб-сервіси, або проміжний ETL-скрипт з CSV/XML-експортом за розкладом |
| Kobo/ODK | REST API, синхронізація по cron через BullMQ |
| Email/календар | Google Workspace API / Microsoft Graph API (друга черга) |

---

## 5. Структура репозиторію

```
/apps
  /api            ← NestJS backend
  /admin          ← Next.js Admin CRM
  /donor-portal   ← Next.js Donor Portal
/docs
  schema.dbml     ← джерело правди для БД (цей документ, розділ 3)
  schema.sql      ← згенерований снепшот
  adr/            ← Architecture Decision Records
  api/            ← посилання на автогенерований OpenAPI/Swagger
/db
  migrations/     ← історія міграцій (Prisma)
/infra
  docker-compose.yml
  .github/workflows/  ← CI/CD
README.md
CHANGELOG.md
```

Правило: зміна структури БД → спочатку правиться `docs/schema.dbml` → потім генерується Prisma-міграція → pull request містить код + міграцію + оновлений `.dbml` одночасно.

---

## 6. Поетапний план

| Фаза | Зміст | Орієнтовний термін |
|---|---|---|
| 0 | Поточний стан — Airtable/Sheets, ручні звіти донорам | — |
| 1 | Backend + БД + Admin CRM, заміна Airtable | 2-3 міс |
| 2 | Donor Portal, read-only, дані оновлюються вручну адміністратором | 1-2 міс |
| 3 | Інтеграції з 1С та Kobo/ODK, автоматичне оновлення даних | 2-3 міс |
| 4 | Аудит безпеки, навантажувальне тестування, запуск у прод | 3-4 тижні |

Загальний термін MVP з інтеграціями: 6-9 місяців.

---

## 7. Орієнтовний кошторис

| Стаття | Мінімум (грн) | Максимум (грн) |
|---|---|---|
| Команда розробки (backend, frontend, DevOps, QA) | 1 640 000 | 2 460 000 |
| Інфраструктура (перший рік) | 60 000 | 220 000 |
| Інтеграції (1С, Kobo) | 165 000 | 390 000 |
| Безпека/комплаєнс (аудит, юридичний огляд) | 80 000 | 230 000 |
| Buffer (15-20%) | 292 000 | 495 000 |
| **Разом** | **~2 240 000** | **~3 800 000** |

Довідково: ~54 000–93 000 USD за курсом ~41 грн/дол.

---

## 8. Команда

| Роль | Завантаження | Тривалість |
|---|---|---|
| Backend-розробник | 100% | 8 міс |
| Frontend-розробник | 100% | 7 міс |
| DevOps | 25-30% | 8 міс |
| QA | 40-50% | 4 міс (з середини проєкту) |
| Продакт/аналітик з боку фонду | 20-30% | 8 міс |
| UI/UX дизайнер | разово | ~1.5 міс на старті |

---

## 9. Практика документування під час розробки

- Технічна документація (архітектура, API, ADR, схема БД) — у git-репозиторії, `/docs`, Markdown, оновлюється в тому ж PR, що і код
- Продуктова документація (вимоги, приймання, user guide для команди фонду) — окремо, Notion/Confluence
- API-документація — тільки автогенерація (Swagger), не вручну
- ADR — короткий формат на кожне значуще архітектурне рішення: контекст → рішення → альтернативи → наслідки
- Схема БД — `docs/schema.dbml` є єдиним джерелом правди; попередній концептуальний docx-документ («Концепт структури CRM») залишається архівним референсом для нетехнічної частини команди і не редагується паралельно з кодом

---

## 10. Українська специфіка (врахувати в бізнес-логіці)

- Дедлайни державної звітності (ДПС, статистика) відрізняються від донорських — окрема модель `state_reporting`, прострочення тягне виключення з Реєстру неприбуткових установ
- Гуманітарна допомога (медобладнання, ліки) може підпадати під окремий митний/податковий режим — прапорець `customs_humanitarian_flag` у моделі grants
- Валютні надходження з-за кордону — контроль через уповноважений банк, `bank_statement_ref` у моделі payments для документального підтвердження цільового призначення

---

## 11. Критерії готовності MVP

- Admin CRM: всі 12 таблиць з розділу 3 реалізовані, права доступу за ролями працюють
- Donor Portal: донор бачить тільки власні дані (перевірено тестом на спробу доступу до чужого grant_id)
- Хоча б одна інтеграція (Kobo або 1С) працює автоматично, без ручного імпорту
- Аудит-лог фіксує дії користувачів
- Резервне копіювання налаштоване і перевірене відновленням
- Базовий аудит безпеки пройдено
