interface PostItem {
  id: number;
  title: string;
  content: string;
  category: 'notice' | 'review' | 'media';
  createdAt: Date | null;
}

interface FeedSectionProps {
  posts?: PostItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  notice: '공지',
  review: '후기',
  media: '미디어',
};

function excerpt(content: string, maxLength = 80): string {
  const plain = content.replace(/<[^>]+>/g, '').trim();
  return plain.length > maxLength ? plain.slice(0, maxLength) + '...' : plain;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function FeedSection({ posts = [] }: FeedSectionProps) {
  if (posts.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">최근 피드</h2>
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <p className="text-sm text-gray-400">아직 게시물이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">최신 게시물이 이곳에 표시됩니다</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">최근 피드</h2>
      <ul className="divide-y divide-gray-100">
        {posts.map((post) => (
          <li key={post.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 shrink-0 inline-block px-2 py-0.5 text-xs font-semibold text-white rounded"
                style={{ background: '#00A1E0' }}
              >
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{excerpt(post.content)}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(post.createdAt)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
