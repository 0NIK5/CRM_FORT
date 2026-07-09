import { pick, range } from '../prng';
import type { Donor } from './types';
const NAMES = ['ЄС Гуманітарний Фонд','Global Health Initiative','Deutsche Welle Stiftung',
  'USAID Ukraine','Nova Charitable Trust','Медичний Альянс','Caritas Europa','Open Society Foundations'];
const COUNTRIES = ['Німеччина','США','Польща','Франція','Швейцарія','Україна'];
const ROLES = ['decision_maker','program_officer','finance_officer'];
export function makeDonors(rng: () => number): Donor[] {
  return NAMES.map((legalName, i) => ({
    id: i + 1, legalName,
    type: pick(rng, ['institutional','corporate','individual','in-kind'] as const),
    country: pick(rng, COUNTRIES),
    status: pick(rng, ['prospect','active','active','dormant','declined'] as const),
    currency: pick(rng, ['UAH','USD'] as const),
    source: pick(rng, ['referral','inbound','call_for_proposals','conference']),
    contacts: Array.from({ length: range(rng, 1, 3) }, () => ({
      name: pick(rng, ['Олена Ковальчук','Andreas Weber','Марія Шевченко','John Smith','Петро Мельник']),
      position: pick(rng, ['CEO','Program Director','Finance Lead','Grant Officer']),
      role: pick(rng, ROLES),
    })),
  }));
}
