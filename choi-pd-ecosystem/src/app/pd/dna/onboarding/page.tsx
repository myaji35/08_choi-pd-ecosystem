import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { OnboardingForm } from './OnboardingForm';

export const metadata = { title: 'DNA 온보딩 · imPD' };

export default async function DnaOnboardingPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/pd/dna/onboarding');
  return <OnboardingForm />;
}
