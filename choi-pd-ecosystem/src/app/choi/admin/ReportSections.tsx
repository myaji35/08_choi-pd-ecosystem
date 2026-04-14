// /choi/admin 리포트 섹션 — Townin Personal DNA Report 원본 9섹션 전문
// 이전 /choi/campaigns, /channels, /roadmap, /press 를 탭으로 통합한 내부용 뷰
import { CHOIPD_DNA } from '@/lib/data/choipd-townin';

const d = CHOIPD_DNA;

export function DnaSection() {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1rem' }}>
        1. Personal DNA 분석
      </h2>
      <p style={{ fontSize: 13, color: 'var(--choi-ink-muted)', marginBottom: '1.25rem' }}>
        Townin이 추출한 색상·스타일·톤앤매너·핵심 가치 4개 축.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        <DnaCard label="브랜드 색상" color={d.colors.primary} items={['Primary: #E53935 레드', 'Navy: #1A237E', 'Teal: #00897B', 'Orange: #FF6F00', 'White: #FFFFFF']} />
        <DnaCard label="콘텐츠 스타일" color={d.colors.secondary} items={[...d.contentStyle]} />
        <DnaCard label="톤앤매너" color={d.colors.trust} items={[...d.toneKeywords]} />
        <DnaCard label="핵심 가치" color={d.colors.accent} items={[...d.coreValues]} />
      </div>
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[d.colors.primary, d.colors.primaryDark, d.colors.accent, d.colors.accentSoft, d.colors.secondary, d.colors.secondarySoft, d.colors.trust, d.colors.trustSoft].map((c) => (
          <div key={c} style={{ textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, background: c, borderRadius: 6, border: '1px solid var(--choi-border)' }} />
            <div style={{ fontSize: 9, marginTop: 2, color: 'var(--choi-ink-muted)' }}>{c}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileSection() {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1rem' }}>
        2. 인물 프로필
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 2rem', fontSize: 13 }}>
        <Row k="성명" v={d.profile.name} />
        <Row k="직업" v={d.profile.job} />
        <Row k="출생" v={d.profile.birth} />
        <Row k="신체" v={d.profile.body} />
        <Row k="소속" v={d.profile.affiliation} />
        <Row k="경력" v={d.profile.career} />
        <Row k="SNS" v={d.profile.sns} />
        <Row k="관심 분야" v={d.profile.interests} />
        <Row k="특기" v={d.profile.specialty} />
        <Row k="거주" v={d.profile.region} />
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: '1.25rem', marginBottom: 8, color: 'var(--choi-primary)' }}>수상 이력</h3>
      <Table
        head={['연도', '수상명', '수여 기관']}
        rows={d.awards.map((a) => [String(a.year), a.name, a.org])}
        headBg="var(--choi-primary)"
      />

      <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: '1.25rem', marginBottom: 8 }}>주요 활동 분야</h3>
      <Table
        head={['분야', '세부 내용', '대상', '플랫폼']}
        rows={d.activityAreas.map((a) => [a.area, a.detail, a.target, a.platform])}
        headBg="var(--choi-trust)"
      />
    </section>
  );
}

export function CampaignsSection() {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1rem' }}>
        3. 추천 콘텐츠 캠페인 (6종)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {d.campaigns.map((c, i) => {
          const colors = ['var(--choi-primary)', 'var(--choi-secondary)', 'var(--choi-accent)', 'var(--choi-accent)', 'var(--choi-primary)', 'var(--choi-trust)'];
          return (
            <article key={c.title} style={{ border: '1px solid var(--choi-border)', borderRadius: 6, padding: '0.9rem 1rem', background: 'white' }}>
              <span style={{ display: 'inline-block', background: colors[i], color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{c.category}</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: '6px 0', color: 'var(--choi-ink)' }}>{c.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--choi-ink-muted)', lineHeight: 1.5 }}>{c.body}</p>
              <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {c.channels.map((ch) => (<span key={ch} style={{ background: '#F3F2F2', color: 'var(--choi-ink-muted)', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>{ch}</span>))}
              </div>
            </article>
          );
        })}
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: '1.5rem', marginBottom: 8, color: 'var(--choi-trust)' }}>4. AI 생성 소재 미리보기</h3>
      <Table
        head={['소재 형식', '헤드라인', '바디 카피', 'CTA', 'Animate']}
        rows={d.aiCreatives.map((a) => [a.format, a.headline, a.body, a.cta, a.animate])}
        headBg="var(--choi-trust)"
      />
    </section>
  );
}

export function ChannelsSection() {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1rem' }}>
        5. 채널별 마케팅 전략
      </h2>
      <Table
        head={['채널', '현황', '권장 콘텐츠', '주기', '핵심 KPI']}
        rows={d.channels.map((c) => [c.name, c.status, c.recommended, c.frequency, c.kpi])}
        headBg="var(--choi-trust)"
      />

      <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: '1.5rem', marginBottom: 8, color: 'var(--choi-trust)' }}>6. 월간 콘텐츠 캘린더 (5월 샘플)</h3>
      <Table
        head={['주차', '채널', '유형', '주제', 'Animate']}
        rows={d.contentCalendar.map((c) => [`${c.week}주차`, c.channel, c.type, c.topic, c.animate])}
        headBg="var(--choi-trust)"
      />

      <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: '1.5rem', marginBottom: 8, color: 'var(--choi-trust)' }}>7. 해시태그 / 키워드 전략</h3>
      <Table
        head={['카테고리', '해시태그·키워드', '검색량', '경쟁도']}
        rows={d.hashtags.map((h) => [h.category, h.tags.join(' · '), h.volume, h.competition])}
        headBg="var(--choi-primary)"
      />
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--choi-trust)', borderBottom: '3px solid var(--choi-primary)', display: 'inline-block', paddingBottom: 4, marginBottom: '1rem' }}>
        8. 유사 크리에이터 포지셔닝
      </h2>
      <Table
        head={['크리에이터', '특화', '타겟', '강점', '차별점']}
        rows={d.positioning.map((p) => [p.name, p.focus, p.target, p.strength, p.differentiation])}
        headBg="var(--choi-primary)"
      />

      <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--choi-trust)' }}>9. 8주 성장 로드맵</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {d.roadmap.map((r) => {
          const phaseColors = ['var(--choi-primary)', 'var(--choi-accent)', 'var(--choi-secondary)', 'var(--choi-trust)'];
          const c = phaseColors[r.phase - 1];
          return (
            <article key={r.phase} style={{ border: '1px solid var(--choi-border)', borderTop: `3px solid ${c}`, borderRadius: 6, padding: '0.9rem 1rem', background: 'white' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c, letterSpacing: '0.05em' }}>PHASE {r.phase} · {r.weeks}</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: '4px 0 6px', color: 'var(--choi-ink)' }}>{r.name}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12, lineHeight: 1.5 }}>
                {r.items.map((it) => <li key={it} style={{ paddingLeft: 10, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: c }}>•</span>{it}</li>)}
              </ul>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--choi-trust)' }}><strong>담당:</strong> {r.function}</div>
              <div style={{ fontSize: 11, color: 'var(--choi-ink-muted)' }}><strong>효과:</strong> {r.effect}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--choi-border)', padding: '7px 0' }}>
      <div style={{ width: 90, color: 'var(--choi-ink-muted)', fontWeight: 600 }}>{k}</div>
      <div style={{ flex: 1 }}>{v}</div>
    </div>
  );
}

function Table({ head, rows, headBg }: { head: string[]; rows: string[][]; headBg: string }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--choi-border)', fontSize: 12 }}>
      <thead>
        <tr style={{ background: headBg, color: 'white' }}>
          {head.map((h) => (<th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700 }}>{h}</th>))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--choi-border)' }}>
            {r.map((c, j) => (<td key={j} style={{ padding: '8px 10px' }}>{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DnaCard({ label, color, items }: { label: string; color: string; items: string[] }) {
  return (
    <div style={{ border: '1px solid var(--choi-border)', borderTop: `3px solid ${color}`, borderRadius: 6, padding: '0.75rem 1rem', background: 'white' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--choi-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 12, lineHeight: 1.6 }}>
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}
