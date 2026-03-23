import Link from 'next/link';
import { Mail, Phone, Facebook, Instagram, Youtube, Linkedin, Globe } from 'lucide-react';
import { getSocialLinks } from '@/lib/db/queries/socialLinks';
import type { SocialLinks } from '@/lib/seo';

function buildSocialIcons(links: SocialLinks) {
  const items: { icon: typeof Facebook; href: string; label: string }[] = [];

  if (links.facebook) items.push({ icon: Facebook, href: links.facebook, label: 'Facebook' });
  if (links.instagram) items.push({ icon: Instagram, href: links.instagram, label: 'Instagram' });
  if (links.youtube) items.push({ icon: Youtube, href: links.youtube, label: 'YouTube' });
  if (links.linkedin) items.push({ icon: Linkedin, href: links.linkedin, label: 'LinkedIn' });
  if (links.naverBlog) items.push({ icon: Globe, href: links.naverBlog, label: '네이버 블로그' });
  if (links.blog) items.push({ icon: Globe, href: links.blog, label: '블로그' });

  // 아무것도 등록되지 않은 경우 기본 플레이스홀더
  if (items.length === 0) {
    items.push(
      { icon: Facebook, href: '#', label: 'Facebook' },
      { icon: Instagram, href: '#', label: 'Instagram' },
      { icon: Youtube, href: '#', label: 'YouTube' },
    );
  }

  return items;
}

export async function Footer() {
  const socialLinks = await getSocialLinks();
  const socialIcons = buildSocialIcons(socialLinks);
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { href: '/education', label: '교육 과정' },
      { href: '/media', label: '한국환경저널' },
      { href: '/works', label: '저작 및 활동' },
      { href: '/community', label: '커뮤니티' },
    ],
    about: [
      { href: '/works/book', label: '저서 소개' },
      { href: '/media/greeting', label: '발행인 인사말' },
      { href: '/community', label: '공지사항' },
    ],
  };

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">최범희 대표</h3>
            <p className="text-sm text-muted-foreground">
              5060 베이비부머를 위한
              <br />
              스마트폰 창업 교육
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>contact@choipd.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>010-XXXX-XXXX</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">소개</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media - DB에서 동적 로딩 */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">소셜 미디어</h3>
            <div className="flex flex-wrap gap-4">
              {socialIcons.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} 최범희. All rights reserved.</p>
          <p className="mt-2">
            스마트폰 창업 전략가 · 저자 · 한국환경저널 발행인
          </p>
        </div>
      </div>
    </footer>
  );
}
