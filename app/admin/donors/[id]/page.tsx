import { mock } from '@/lib/mock';
import { DonorDetail } from './detail';

export function generateStaticParams() {
  return mock.donors.map((d) => ({ id: String(d.id) }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <DonorDetail id={Number(params.id)} />;
}
