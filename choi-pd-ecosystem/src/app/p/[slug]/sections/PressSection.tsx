interface WorkItem {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  category: 'gallery' | 'press';
  createdAt: Date | null;
}

interface PressSectionProps {
  pressItems?: WorkItem[];
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function PressSection({ pressItems = [] }: PressSectionProps) {
  if (pressItems.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">언론 보도</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
          <p className="text-sm text-gray-400">아직 등록된 보도 자료가 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">언론 보도 자료가 이곳에 표시됩니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">언론 보도</h2>
      <ul className="space-y-0">
        {pressItems.map((item, index) => (
          <li key={item.id} className="relative pl-5">
            {/* 타임라인 세로선 */}
            {index < pressItems.length - 1 && (
              <span className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-200" />
            )}
            {/* 타임라인 점 */}
            <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#00A1E0] bg-white" />
            <div className="pb-4">
              <p className="text-xs text-gray-400 mb-0.5">{formatDate(item.createdAt)}</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
