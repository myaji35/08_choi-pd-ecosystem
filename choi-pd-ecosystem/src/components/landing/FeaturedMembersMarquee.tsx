'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, CheckCircle2, Play, ArrowRight } from 'lucide-react';

interface FeaturedMember {
  id: number;
  slug: string;
  name: string;
  profession: string | null;
  coverImage?: string | null;
  profileImage?: string | null;
  tagline?: string | null;
  skills?: string[];
  revenue?: string;
  inquiries?: number;
}

/**
 * 우수 회원 썸네일 마퀴 — 무한 가로 스크롤.
 * hover 시 일시정지. 각 카드 클릭 → /member/<slug>.
 */
export function FeaturedMembersMarquee() {
  const [members, setMembers] = useState<FeaturedMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/landing/featured-members', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.members) && data.members.length > 0) {
          setMembers(data.members);
        } else if (!cancelled) {
          // API 미구현/빈 결과 시 샘플 데이터 (랜딩에 placeholder)
          setMembers(SAMPLE_MEMBERS);
        }
      } catch {
        if (!cancelled) setMembers(SAMPLE_MEMBERS);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-48 animate-pulse bg-gray-100 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (members.length === 0) return null;

  // 마퀴 무한 루프를 위해 2배 복제
  const looped = [...members, ...members];

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-[#F7F9FC] to-white overflow-hidden">
      {/* 상단 타이틀 */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-700 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              이달의 주목 회원
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              지금 imPD에서 <span className="text-[#00A1E0]">잘나가는</span> 사람들
            </h2>
            <p className="mt-2 text-gray-500 text-sm md:text-base">
              같은 직종의 1인 사업가들이 실제로 운영 중인 페이지를 둘러보세요.
            </p>
          </div>
          <Link
            href="/members"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-[#00A1E0] hover:text-[#0082B3]"
          >
            전체 보기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 마퀴 */}
      <div
        className="group relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex gap-5 animate-marquee group-hover:[animation-play-state:paused] w-max">
          {looped.map((m, idx) => (
            <MemberCard key={`${m.id}-${idx}`} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MemberCard({ member: m }: { member: FeaturedMember }) {
  return (
    <Link
      href={`/member/${m.slug}`}
      className="group relative block w-[320px] shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-[#00A1E0] hover:shadow-xl transition-all duration-300"
    >
      {/* 상단 커버 이미지(또는 그라디언트) */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#16325C] via-[#1E3A8A] to-[#00A1E0]">
        {m.coverImage ? (
          <Image
            src={m.coverImage}
            alt={m.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="320px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-7 h-7 text-white fill-white" />
            </div>
          </div>
        )}
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-gray-900">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          검증
        </div>
      </div>

      {/* 프로필 + 이름 */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {m.profileImage ? (
            <Image
              src={m.profileImage}
              alt={m.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center ring-2 ring-white shadow">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-gray-900 truncate">{m.name}</div>
            <div className="text-xs text-gray-500 truncate">
              {professionLabel(m.profession)} · impd.me/{m.slug}
            </div>
          </div>
        </div>

        {m.tagline && (
          <p className="text-sm text-gray-700 leading-snug line-clamp-2 mb-3">{m.tagline}</p>
        )}

        {/* KPI 2개 */}
        {(m.revenue || m.inquiries) && (
          <div className="flex items-center gap-4 text-xs">
            {m.revenue && (
              <div>
                <div className="font-black text-gray-900">{m.revenue}</div>
                <div className="text-[10px] text-gray-500">월 매출</div>
              </div>
            )}
            {typeof m.inquiries === 'number' && (
              <div>
                <div className="font-black text-gray-900">{m.inquiries}건</div>
                <div className="text-[10px] text-gray-500">이번주 문의</div>
              </div>
            )}
          </div>
        )}

        {/* 달란트 칩 */}
        {m.skills && m.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
            {m.skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function professionLabel(p: string | null | undefined): string {
  if (!p) return '크리에이터';
  const map: Record<string, string> = {
    creator: 'PD / 크리에이터',
    insurance_agent: '보험 설계사',
    realtor: '부동산 중개사',
    educator: '교육자 / 강사',
    author: '작가',
    shopowner: '쇼핑몰 운영자',
    freelancer: '프리랜서',
  };
  return map[p] || p;
}

// API 미구현 시 폴백 샘플
const SAMPLE_MEMBERS: FeaturedMember[] = [
  {
    id: 1,
    slug: 'choi-pd',
    name: '최범희 PD',
    profession: 'creator',
    tagline: '50대 스마트폰 창업 전문가 · 15년 경력',
    skills: ['영상편집', '콘텐츠 기획', '50대 교육'],
    revenue: '₩6.2M',
    inquiries: 7,
  },
  {
    id: 2,
    slug: 'demo-realtor',
    name: '김민주 중개사',
    profession: 'realtor',
    tagline: '강남·서초 프리미엄 매물 전문',
    skills: ['매물 분석', '상권 리포트', '투자 컨설팅'],
    revenue: '₩4.8M',
    inquiries: 12,
  },
  {
    id: 3,
    slug: 'demo-educator',
    name: '박서영 강사',
    profession: 'educator',
    tagline: 'AI 리터러시 · 기업 임직원 교육',
    skills: ['커리큘럼', '기업 출강', '온라인 강의'],
    revenue: '₩9.1M',
    inquiries: 15,
  },
  {
    id: 4,
    slug: 'demo-insurance',
    name: '이수현 설계사',
    profession: 'insurance_agent',
    tagline: '가족 맞춤 보험 · 10년차 FC',
    skills: ['종합 설계', '재무 진단', '세무'],
    revenue: '₩5.4M',
    inquiries: 9,
  },
  {
    id: 5,
    slug: 'demo-shopowner',
    name: '정다은 운영자',
    profession: 'shopowner',
    tagline: '수제 디저트 브랜드 "단단" 대표',
    skills: ['브랜딩', 'SNS 마케팅', 'CX 운영'],
    revenue: '₩3.7M',
    inquiries: 6,
  },
  {
    id: 6,
    slug: 'demo-freelancer',
    name: '한지호 디자이너',
    profession: 'freelancer',
    tagline: '브랜드 아이덴티티 · UI/UX',
    skills: ['BX 디자인', 'Webflow', 'Figma'],
    revenue: '₩4.2M',
    inquiries: 8,
  },
];
