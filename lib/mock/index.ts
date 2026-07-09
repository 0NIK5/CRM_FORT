import { makeRng } from '../prng';
import { makeDonors } from './donors';
import { makeGrants } from './grants';
import { makePayments } from './payments';
import { makeBudget } from './budget';
import { makeReports } from './reports';
import { makeProgram } from './program';
import { makeCompliance } from './compliance';
import { makeTasks } from './tasks';
import { makeStateReports } from './state-reporting';

// экспорт типов
export type {
  Donor,
  Grant,
  Payment,
  BudgetLine,
  Report,
  ProgramRecord,
  Compliance,
  Task,
  StateReport,
} from './types';

const rng = makeRng(20260709);
const donors = makeDonors(rng);
const grants = makeGrants(rng, donors.length);
const payments = makePayments(rng, grants);
const budget = makeBudget(rng, grants);
const reports = makeReports(rng, grants);
const program = makeProgram(rng, grants);
const compliance = makeCompliance(rng, donors);
const tasks = makeTasks(rng);
const stateReports = makeStateReports(rng);

export const mock = { donors, grants, payments, budget, reports, program, compliance, tasks, stateReports };
export const donorName = (id: number) => donors.find((d) => d.id === id)?.legalName ?? '—';
export const grantName = (id: number) => grants.find((g) => g.id === id)?.projectName ?? '—';
