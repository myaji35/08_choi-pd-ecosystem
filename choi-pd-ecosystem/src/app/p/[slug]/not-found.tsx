import Link from 'next/link';

export default function BrandPageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F2F2] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white flex items-center justify-center border border-gray-200">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#16325C] mb-2">
          브랜드 페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-500 mb-8">
          요청하신 브랜드 페이지가 존재하지 않거나,
          <br />
          현재 비공개 상태입니다.
        </p>
        <Link
          href="https://impd.townin.net"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#00A1E0] text-white text-sm font-medium rounded-lg hover:bg-[#0090c8] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          imPD 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
