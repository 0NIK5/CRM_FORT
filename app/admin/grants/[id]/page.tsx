import { mock } from '@/lib/mock';
import { GrantDetail } from './detail';

export function generateStaticParams() {
  return mock.grants.map((g) => ({ id: String(g.id) }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <GrantDetail id={Number(params.id)} />;
}
