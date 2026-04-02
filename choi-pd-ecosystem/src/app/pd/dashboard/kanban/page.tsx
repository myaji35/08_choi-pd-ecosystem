'use client';

import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(
  () => import('@/components/kanban/KanbanBoard'),
  { ssr: false }
);

export default function PdKanbanPage() {
  return <KanbanBoard projectId="1" title="칸반 보드" showApiKeySettings />;
}
