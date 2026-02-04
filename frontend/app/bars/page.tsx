import { getBars } from '@/lib/api';
import BarList from './components/BarList';

export default async function BarsPage() {
  const initialData = await getBars({
    limit: 20,
    offset: 0,
  });

  return (
    <main className="min-h-screen">
      <BarList initialData={initialData} />
    </main>
  );
}
