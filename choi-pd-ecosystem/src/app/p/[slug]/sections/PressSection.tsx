export function PressSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">언론 보도</h2>
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
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
        <p className="text-sm text-gray-400">곧 공개 예정입니다</p>
        <p className="text-xs text-gray-300 mt-1">언론 보도 자료가 이곳에 표시됩니다</p>
      </div>
    </section>
  );
}
