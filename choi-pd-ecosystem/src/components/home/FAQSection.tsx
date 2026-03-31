'use client';

import { useState } from 'react';

const FAQS = [
  {
    question: '무료 플랜으로 충분히 사용할 수 있나요?',
    answer:
      '네, 무료 플랜만으로도 기본 브랜드 페이지 1개, 월 5회 AI 콘텐츠 생성, SNS 채널 1개 연동이 가능합니다. 사업 규모가 커지면 언제든 Pro로 업그레이드할 수 있으며, 14일 무료 체험도 제공합니다.',
  },
  {
    question: 'AI가 생성한 콘텐츠의 품질은 어떤가요?',
    answer:
      'imPD는 GPT-4o 기반의 AI를 사용하며, 한국어에 특화된 채널별 프롬프트를 적용합니다. 인스타그램, 네이버 블로그, 브런치 등 각 플랫폼의 최적 포맷에 맞춰 자동 생성되므로 바로 발행할 수 있는 수준의 결과물을 제공합니다. 물론 발행 전 직접 수정도 가능합니다.',
  },
  {
    question: '기존에 사용하던 SNS 계정을 연동할 수 있나요?',
    answer:
      '인스타그램, X(트위터), 네이버 블로그, 워드프레스, 티스토리, 브런치, 카카오 채널 등 11개 채널을 지원합니다. API를 통한 자동 발행이 가능한 채널은 예약 발행까지 지원하며, API가 없는 채널은 복사-붙여넣기로 간편하게 사용할 수 있습니다.',
  },
  {
    question: '언제든 해지할 수 있나요? 환불 정책은?',
    answer:
      'Pro/Biz 플랜은 월 단위 구독이며, 언제든 해지할 수 있습니다. 결제 후 7일 이내 요청 시 전액 환불해드립니다. 해지 후에도 현재 결제 기간이 끝날 때까지 Pro 기능을 계속 사용할 수 있으며, 이후 자동으로 Free 플랜으로 전환됩니다. 데이터는 삭제되지 않습니다.',
  },
  {
    question: '데이터 보안은 안전한가요?',
    answer:
      'imPD는 AES-256 암호화를 적용하며, 모든 데이터는 한국 서버에 보관됩니다. SSL/TLS 인증서로 통신 구간을 암호화하고, 개인정보처리방침에 따라 데이터를 안전하게 관리합니다. GDPR 및 한국 개인정보보호법 기준을 준수합니다.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#00A1E0' }}>
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#16325C' }}>
              자주 묻는 질문
            </h2>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border-2 bg-white transition-all duration-200 ${
                    isOpen ? 'shadow-sm' : ''
                  }`}
                  style={{ borderColor: isOpen ? '#00A1E0' : '#e5e7eb' }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex items-center justify-between w-full text-left px-6 py-5"
                  >
                    <span className="text-sm font-semibold pr-4" style={{ color: '#16325C' }}>
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: '#00A1E0' }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              더 궁금한 점이 있으신가요?{' '}
              <a href="mailto:contact@impd.com" className="font-semibold underline underline-offset-2" style={{ color: '#00A1E0' }}>
                문의하기
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
