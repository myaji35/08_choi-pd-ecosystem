import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NewsletterManager } from '@/components/admin/NewsletterManager';

export default async function AdminNewsletterPage() {
  const subscribers = await db.query.leads.findMany({
    orderBy: [desc(leads.subscribedAt)],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">뉴스레터 구독자 관리</h1>
          <a
            href="/admin/dashboard"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← 대시보드로 돌아가기
          </a>
        </div>
      </header>

      <main className="container py-8">
        <NewsletterManager initialSubscribers={subscribers} />
      </main>
    </div>
  );
}
