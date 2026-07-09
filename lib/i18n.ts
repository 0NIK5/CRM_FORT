export type Lang = 'ua' | 'en';

export const dict: Record<Lang, Record<string, string>> = {
  ua: {
    'app.title': 'Fortitude CRM',
    'landing.subtitle': 'Платформа управління грантами та кабінет донора',
    'landing.team': 'Команда фонду',
    'landing.teamDesc': 'Внутрішній CRM: донори, гранти, бюджети, звітність',
    'landing.donor': 'Кабінет донора',
    'landing.donorDesc': 'Стан ваших грантів, освоєння бюджету, метрики впливу',
    'nav.dashboard': 'Дашборд', 'nav.donors': 'Донори', 'nav.grants': 'Гранти',
    'nav.payments': 'Платежі', 'nav.budget': 'Бюджети', 'nav.reports': 'Звіти',
    'nav.compliance': 'Комплаєнс', 'nav.tasks': 'Завдання',
    'nav.impact': 'Метрики впливу', 'nav.updates': 'Апдейти з поля',
    'portal.allocated': 'Виділено', 'portal.spent': 'Освоєно', 'portal.balance': 'Залишок',
    'common.download': 'Завантажити', 'common.status': 'Статус', 'common.deadline': 'Дедлайн',
    'common.amount': 'Сума', 'common.date': 'Дата', 'common.viewAll': 'Дивитись усі',
    'dash.pipeline': 'Воронка грантів', 'dash.cashflow': 'Прогноз надходжень',
    'dash.utilization': 'Освоєння бюджету', 'dash.concentration': 'Концентрація донорів',
    'dash.calendar': 'Календар звітності', 'dash.alerts': 'Комплаєнс-алерти',
    'dash.portfolio': 'Портфель', 'dash.active': 'активних'
  },
  en: {
    'app.title': 'Fortitude CRM',
    'landing.subtitle': 'Grant management platform & donor portal',
    'landing.team': 'Foundation team',
    'landing.teamDesc': 'Internal CRM: donors, grants, budgets, reporting',
    'landing.donor': 'Donor portal',
    'landing.donorDesc': 'Your grants status, budget utilization, impact metrics',
    'nav.dashboard': 'Dashboard', 'nav.donors': 'Donors', 'nav.grants': 'Grants',
    'nav.payments': 'Payments', 'nav.budget': 'Budgets', 'nav.reports': 'Reports',
    'nav.compliance': 'Compliance', 'nav.tasks': 'Tasks',
    'nav.impact': 'Impact metrics', 'nav.updates': 'Field updates',
    'portal.allocated': 'Allocated', 'portal.spent': 'Spent', 'portal.balance': 'Balance',
    'common.download': 'Download', 'common.status': 'Status', 'common.deadline': 'Deadline',
    'common.amount': 'Amount', 'common.date': 'Date', 'common.viewAll': 'View all',
    'dash.pipeline': 'Grant pipeline', 'dash.cashflow': 'Cash flow forecast',
    'dash.utilization': 'Budget utilization', 'dash.concentration': 'Donor concentration',
    'dash.calendar': 'Reporting calendar', 'dash.alerts': 'Compliance alerts',
    'dash.portfolio': 'Portfolio', 'dash.active': 'active'
  },
};
