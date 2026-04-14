import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '환불정책',
  description: 'imPD 환불정책. 7일 이내 전액 환불을 보장합니다.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#16325C' }}>환불정책</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p className="text-sm text-gray-400">최종 수정일: 2026년 3월 30일</p>

          <div className="bg-blue-50 border-2 rounded-xl p-6 mb-8" style={{ borderColor: '#00A1E0' }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#16325C' }}>7일 환불 보장</h2>
            <p className="text-sm" style={{ color: '#16325C' }}>
              Pro 또는 Biz 플랜 결제 후 7일 이내에 환불을 요청하시면 전액 환불해드립니다. 이유를 묻지 않습니다.
            </p>
          </div>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>환불 절차</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>환불 요청</strong>: refund@impd.com 으로 이메일 발송 (계정 이메일, 결제일 포함)</li>
            <li><strong>확인</strong>: 영업일 1일 이내 확인 메일 발송</li>
            <li><strong>환불 처리</strong>: 영업일 3-5일 이내 원 결제 수단으로 환불</li>
          </ol>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>환불 조건</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>결제일로부터 7일 이내: 전액 환불</li>
            <li>7일 이후: 잔여 기간에 대한 일할 환불 (Pro-rata)</li>
            <li>해지 후에도 현재 결제 기간이 끝날 때까지 Pro/Biz 기능을 계속 사용할 수 있습니다</li>
            <li>Free 플랜은 환불 대상이 아닙니다</li>
          </ul>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>데이터 보존</h2>
          <p>해지 또는 환불 후에도 사용자 데이터는 삭제되지 않으며, Free 플랜으로 자동 전환됩니다. 데이터 삭제를 원하시면 별도 요청해주세요.</p>

          <h2 className="text-lg font-semibold" style={{ color: '#16325C' }}>문의</h2>
          <p>환불 관련 문의: <a href="mailto:refund@impd.com" style={{ color: '#00A1E0' }}>refund@impd.com</a></p>
        </div>
      </div>
    </div>
  );
}
