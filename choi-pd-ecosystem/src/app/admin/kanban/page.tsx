'use client';

import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function AdminKanbanPage() {
  return <KanbanBoard projectId="1" title="칸반 보드" showApiKeySettings />;
}
