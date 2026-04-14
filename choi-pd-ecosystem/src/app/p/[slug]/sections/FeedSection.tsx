export function FeedSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">최근 피드</h2>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {/* 아이콘 */}
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
        <p className="text-sm text-gray-400">곧 공개 예정입니다</p>
        <p className="text-xs text-gray-300 mt-1">최신 게시물이 이곳에 표시됩니다</p>
      </div>
    </section>
  );
}
