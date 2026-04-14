import Link from 'next/link';

interface FooterSectionProps {
  tenantName: string;
  primaryColor?: string;
}

export function FooterSection({ tenantName, primaryColor = '#3b82f6' }: FooterSectionProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center py-8 border-t border-gray-200">
      <p className="text-xs text-gray-500 mb-1">
        &copy; {year} {tenantName}. All rights reserved.
      </p>
      <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
        Powered by
        <Link
          href="https://impd.townin.net"
          className="inline-flex items-center gap-1 font-semibold hover:underline"
          style={{ color: primaryColor }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          imPD
        </Link>
      </p>
    </footer>
  );
}
