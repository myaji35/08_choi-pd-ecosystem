'use client';

import { useState } from 'react';

export default function InquiryForm({ defaultType = 'b2b' }: { defaultType?: 'b2b' | 'contact' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'b2b' | 'contact'>(defaultType);
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError('개인정보 수집·이용에 동의해야 문의를 접수할 수 있습니다.');
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, type }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? '접수 실패');
      }
      setStatus('ok');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err) {
      setStatus('err');
      setError((err as Error).message);
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">문의가 접수되었습니다</h3>
        <p className="mt-2 text-sm text-green-700">
          확인 이메일이 발송되었습니다. 영업일 기준 1~2일 내 회신드리겠습니다.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 rounded-lg bg-white border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
        >
          추가 문의하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 text-left">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">문의 유형</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'b2b' | 'contact')}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
        >
          <option value="b2b">B2B / 기관 교육</option>
          <option value="contact">일반 문의</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">이름 *</label>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">이메일 *</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
            placeholder="name@company.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">전화번호</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
          placeholder="010-0000-0000"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">문의 내용 * (최소 10자)</label>
        <textarea
          required
          minLength={10}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00A1E0] focus:ring-1 focus:ring-[#00A1E0]"
          placeholder="기관명 · 예상 인원 · 희망 일정 등을 함께 적어주시면 빠른 회신이 가능합니다."
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          개인정보 수집·이용에 동의합니다. 수집 항목: 이름, 이메일, 전화번호 / 이용 목적: 문의 회신 / 보관 기간: 회신 완료 후 3년.
        </span>
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-lg bg-[#00A1E0] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0082B3] disabled:opacity-50"
      >
        {status === 'sending' ? '전송 중...' : '문의 접수하기'}
      </button>
    </form>
  );
}
