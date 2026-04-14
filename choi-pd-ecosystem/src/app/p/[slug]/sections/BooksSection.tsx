export function BooksSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">저서 &amp; 작품</h2>
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <p className="text-sm text-gray-400">곧 공개 예정입니다</p>
        <p className="text-xs text-gray-300 mt-1">저서 및 작품 목록이 이곳에 표시됩니다</p>
      </div>
    </section>
  );
}
