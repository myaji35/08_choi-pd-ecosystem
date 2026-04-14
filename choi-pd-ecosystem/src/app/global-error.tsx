'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#16325C', marginBottom: '1rem' }}>오류가 발생했습니다</h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.5rem 1.5rem', background: '#00A1E0', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
