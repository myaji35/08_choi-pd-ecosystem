import { BrandPageContactForm } from '../contact-form';

interface ContactSectionProps {
  tenantId: number;
  primaryColor: string;
}

export function ContactSection({ tenantId, primaryColor }: ContactSectionProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">문의하기</h2>
      <BrandPageContactForm tenantId={tenantId} primaryColor={primaryColor} />
    </section>
  );
}
