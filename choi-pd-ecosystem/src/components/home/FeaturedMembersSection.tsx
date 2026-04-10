'use client';

const FEATURED_MEMBERS = [
  {
    name: '김지우',
    role: 'UX Designer',
    testimonial: '"imPD의 네트워크 덕분에 대기업 프로젝트를 수주하고 브랜드 가치를 2배 높였습니다."',
  },
  {
    name: '박선호',
    role: 'Content Creator',
    testimonial: '"AI 브랜딩 툴로 주 10시간 이상의 작업 시간을 단축했습니다. 정말 놀라운 효율입니다."',
  },
  {
    name: '이서현',
    role: 'Marketing Specialist',
    testimonial: '"강의 수익화 기능을 통해 저만의 노하우를 안정적인 수입원으로 전환할 수 있었습니다."',
  },
  {
    name: '최민준',
    role: 'Brand Strategist',
    testimonial: '"전문가 커뮤니티에서 얻는 인사이트는 제 비즈니스의 방향성을 잡는 데 필수적입니다."',
  },
];

function VerifiedBadge() {
  return (
    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      Verified
    </span>
  );
}

function MemberCard({ member }: { member: typeof FEATURED_MEMBERS[number] }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-[0_20px_40px_rgba(22,50,92,0.06)] relative group hover:shadow-xl transition-shadow">
      <div className="absolute top-6 right-6">
        <VerifiedBadge />
      </div>
      <div className="mb-6 flex items-center justify-center rounded-full w-20 h-20 text-white text-2xl font-bold" style={{ background: '#16325C' }}>
        {member.name.charAt(0)}
      </div>
      <h3 className="font-bold text-xl mb-1 text-[#171c20]">{member.name}</h3>
      <p className="text-[#00658e] font-medium text-sm mb-4">{member.role}</p>
      <p className="text-gray-500 text-sm leading-relaxed italic">{member.testimonial}</p>
    </div>
  );
}

export function FeaturedMembersSection() {
  return (
    <section className="py-24 px-6 md:px-8 bg-[#f6faff] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-bold text-3xl md:text-4xl text-[#171c20] mb-4">
              이달의 우수 멤버
            </h2>
            <p className="text-gray-500 text-lg">
              imPD 플랫폼을 통해 성장하고 있는 최고의 전문가들을 만나보세요.
            </p>
          </div>
          <button className="text-[#00658e] font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
            전체 멤버 보기
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_MEMBERS.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
