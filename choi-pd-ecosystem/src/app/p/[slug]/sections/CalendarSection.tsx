export function CalendarSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">월간 일정</h2>
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm text-gray-400">곧 공개 예정입니다</p>
        <p className="text-xs text-gray-300 mt-1">월간 강의 및 일정이 이곳에 표시됩니다</p>
      </div>
    </section>
  );
}
