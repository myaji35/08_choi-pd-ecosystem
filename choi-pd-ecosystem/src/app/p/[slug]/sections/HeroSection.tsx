interface ProfessionInfo {
  label: string;
  color: string;
}

interface HeroSectionProps {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  professionInfo: ProfessionInfo;
  bio: string;
}

export function HeroSection({
  name,
  logoUrl,
  primaryColor,
  secondaryColor,
  professionInfo,
  bio,
}: HeroSectionProps) {
  return (
    <header
      className="relative w-full"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          {/* 로고 또는 이니셜 */}
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${name} 로고`}
              className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">
                {name.charAt(0)}
              </span>
            </div>
          )}

          {/* 테넌트 이름 */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {name}
          </h1>

          {/* 직업군 배지 */}
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-4"
            style={{ background: professionInfo.color }}
          >
            {professionInfo.label}
          </span>

          {/* 소개 텍스트 */}
          {bio && (
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-lg">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* 하단 곡선 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C360 0 720 0 1080 30L1440 60H0Z" fill="#F3F2F2" />
        </svg>
      </div>
    </header>
  );
}
