import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'imPD 서비스 이용약관.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#16325C' }}>이용약관</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p className="text-sm text-gray-400">최종 수정일: 2026년 3월 30일</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>1. 서비스 개요</h2>
          <p>imPD는 1인 사업자 및 프리랜서를 위한 AI 브랜드 매니저 SaaS 서비스입니다. 사용자는 AI 콘텐츠 생성, SNS 통합 관리, 브랜드 페이지 빌더 기능을 이용할 수 있습니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>2. 계정 및 이용</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>만 14세 이상 이용 가능</li>
            <li>정확한 정보로 가입해야 합니다</li>
            <li>계정 공유 및 양도는 금지됩니다</li>
          </ul>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>3. 요금 및 결제</h2>
          <p>Free 플랜은 무료이며, Pro/Biz 플랜은 월 단위 구독입니다. 요금은 사전 고지 후 변경될 수 있습니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>4. 서비스 해지</h2>
          <p>언제든 해지할 수 있으며, 결제 기간 종료 시까지 서비스를 이용할 수 있습니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>5. 면책 조항</h2>
          <p>AI 생성 콘텐츠의 정확성을 보장하지 않으며, 사용자가 발행 전 내용을 확인할 책임이 있습니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>6. 문의</h2>
          <p>이용약관 관련 문의: <a href="mailto:legal@impd.com" style={{ color: '#00A1E0' }}>legal@impd.com</a></p>
        </div>
      </div>
    </div>
  );
}
