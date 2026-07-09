import { mock, donorName, grantName } from './mock';

export function pipelineByStage() {
  const stages = ['lead','proposal','negotiation','signed','active','closed','renewed'];
  return stages.map((stage) => {
    const g = mock.grants.filter((x) => x.stage === stage);
    return { stage, count: g.length, amount: g.reduce((s, x) => s + x.amount, 0) };
  });
}
export function cashflowByQuarter() {
  const q: Record<string, number> = {};
  mock.payments.filter((p) => p.status === 'planned').forEach((p) => {
    const m = new Date(p.date).getMonth(); const quarter = `Q${Math.floor(m / 3) + 1}`;
    q[quarter] = (q[quarter] ?? 0) + p.amount;
  });
  return ['Q1','Q2','Q3','Q4'].map((quarter) => ({ quarter, planned: q[quarter] ?? 0 }));
}
export function utilization() {
  return mock.grants.filter((g) => g.stage === 'active').slice(0, 6).map((g) => {
    const lines = mock.budget.filter((b) => b.grantId === g.id);
    return { grant: g.projectName, planned: lines.reduce((s, l) => s + l.planned, 0),
      actual: lines.reduce((s, l) => s + l.actual, 0) };
  });
}
export function donorConcentration() {
  const total = mock.grants.reduce((s, g) => s + g.amount, 0);
  const byDonor: Record<number, number> = {};
  mock.grants.forEach((g) => { byDonor[g.donorId] = (byDonor[g.donorId] ?? 0) + g.amount; });
  return Object.entries(byDonor).map(([id, amount]) => ({
    donor: donorName(Number(id)), amount, pct: Math.round((amount / total) * 100),
  })).sort((a, b) => b.amount - a.amount);
}
export function upcomingReports() {
  const donor = mock.reports.filter((r) => !r.submitted).map((r) => ({
    label: grantName(r.grantId) + ' — ' + r.type, deadline: r.deadline, kind: 'donor' as const }));
  const state = mock.stateReports.filter((s) => !s.submitted).map((s) => ({
    label: s.formType, deadline: s.deadline, kind: 'state' as const }));
  return [...donor, ...state].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 8);
}
export function complianceAlerts() {
  const now = new Date('2026-07-09');
  return mock.compliance.map((c) => {
    const daysLeft = Math.round((new Date(c.docsExpiry).getTime() - now.getTime()) / 86400000);
    return { donor: donorName(c.donorId), docsExpiry: c.docsExpiry, daysLeft };
  }).filter((c) => c.daysLeft < 90).sort((a, b) => a.daysLeft - b.daysLeft);
}
