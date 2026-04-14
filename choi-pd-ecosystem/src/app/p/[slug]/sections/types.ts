// ISS-047: 공개 프로필 페이지 섹션 공통 타입 정의

export interface CourseItem {
  id: number;
  title: string;
  description: string | null;
  type: string;
  price: number | null;
  thumbnailUrl: string | null;
  externalLink: string | null;
}

export interface SnsAccountItem {
  id: number;
  platform: string;
  accountName: string | null;
  metadata: string | null;
}

export interface AwardItem {
  title: string;
  org?: string;
  year?: number;
}

export interface ExternalLinkItem {
  label: string;
  url: string;
}

export interface AboutSectionProps {
  bio: string;
  coreValues: string[];
  ownerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  serviceDescription?: string;
  primaryColor: string;
  professionLabel: string;
}

export interface ServicesSectionProps {
  courses: CourseItem[];
  serviceDescription?: string;
  externalLinks: ExternalLinkItem[];
  primaryColor: string;
  secondaryColor: string;
}

export interface TrustSectionProps {
  awards: AwardItem[];
  pressMentions: number;
  primaryColor: string;
}

export interface ActivitySectionProps {
  snsAccounts: SnsAccountItem[];
  latestPost?: {
    title: string;
    url?: string;
    date?: string;
  };
}
