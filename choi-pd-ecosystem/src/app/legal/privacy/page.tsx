import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'imPD 개인정보처리방침. 사용자의 개인정보를 안전하게 보호합니다.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#16325C' }}>개인정보처리방침</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p className="text-sm text-gray-400">최종 수정일: 2026년 3월 30일</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>1. 수집하는 개인정보</h2>
          <p>imPD(&quot;서비스&quot;)는 다음과 같은 개인정보를 수집합니다:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>이메일 주소, 이름 (회원가입 시)</li>
            <li>브랜드 정보, 직업군 (온보딩 시)</li>
            <li>SNS 계정 연동 정보 (선택)</li>
            <li>서비스 이용 기록, 접속 로그</li>
          </ul>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>2. 개인정보 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스 제공 및 회원 관리</li>
            <li>AI 콘텐츠 생성 및 개인화</li>
            <li>고객 지원 및 서비스 개선</li>
          </ul>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>3. 보안 조치</h2>
          <p>모든 데이터는 AES-256 암호화로 보호되며, 한국 소재 서버에 안전하게 보관됩니다. SSL/TLS 인증서를 통해 통신 구간을 암호화합니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>4. 개인정보 보유 및 파기</h2>
          <p>회원 탈퇴 시 개인정보는 즉시 파기합니다. 관련 법령에 따라 일정 기간 보관이 필요한 정보는 해당 기간 경과 후 파기합니다.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>5. 문의</h2>
          <p>개인정보 관련 문의: <a href="mailto:privacy@impd.com" style={{ color: '#00A1E0' }}>privacy@impd.com</a></p>
        </div>
      </div>
    </div>
  );
}
