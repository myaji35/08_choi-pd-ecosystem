import { ExternalLink } from 'lucide-react';

interface HubProject {
  id: string;
  name: string;
  base_url: string;
  profile_url: string;
  role?: string | null;
  stats?: Record<string, unknown> | null;
  last_synced_at?: string | null;
}

interface OtherProjectsSectionProps {
  slug: string;
  currentProjectId?: string;
  primaryColor?: string;
}

const HUB_URL = process.env.NEXT_PUBLIC_IDENTITY_HUB_URL || 'http://localhost:3020';

async function fetchHubProjects(slug: string): Promise<HubProject[]> {
  try {
    // 페이지가 force-dynamic이므로 Hub fetch도 매 요청 재조회 (3600초 캐시는 prod에서 별도 고려).
    const res = await fetch(`${HUB_URL}/p/${slug}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const hub = await res.json();
    return Array.isArray(hub?.projects) ? hub.projects : [];
  } catch {
    return [];
  }
}

export async function OtherProjectsSection({
  slug,
  currentProjectId = 'impd',
  primaryColor = '#00A1E0',
}: OtherProjectsSectionProps) {
  const projects = await fetchHubProjects(slug);
  const others = projects.filter((p) => p.id !== currentProjectId);

  if (others.length === 0) return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-base font-bold text-gray-900 mb-1">다른 프로젝트에서도 활동</h2>
      <p className="text-xs text-gray-500 mb-4">이 사람은 imPD 외에도 아래 프로젝트에서 활동하고 있습니다.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {others.map((p) => (
          <a
            key={p.id}
            href={p.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-3 border border-gray-200 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 truncate">{p.name}</span>
                {p.role && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: primaryColor, color: 'white' }}
                  >
                    {p.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{p.base_url}</p>
            </div>
            <ExternalLink size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </section>
  );
}
