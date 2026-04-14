import AdminTabs from './AdminTabs';
import { loadChoiBrand } from '@/lib/data/choi-brand-store';

export const metadata = { title: '/choi 관리 · 리포트' };
export const dynamic = 'force-dynamic';

export default async function ChoiAdminPage() {
  const brand = await loadChoiBrand();
  return <AdminTabs initialBrand={brand} />;
}
