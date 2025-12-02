import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from '@/components/admin/ProfileForm';

export default async function AdminProfilePage() {
  // 프로필 설정 가져오기
  const profileSettings = await db.query.settings.findMany({
    where: (settings, { inArray }) =>
      inArray(settings.key, ['profile_name', 'profile_title', 'profile_email', 'profile_phone', 'profile_bio'])
  });

  const profileData = {
    name: profileSettings.find(s => s.key === 'profile_name')?.value || '최범희',
    title: profileSettings.find(s => s.key === 'profile_title')?.value || '스마트폰 창업 전략가',
    email: profileSettings.find(s => s.key === 'profile_email')?.value || 'contact@choipd.com',
    phone: profileSettings.find(s => s.key === 'profile_phone')?.value || '010-XXXX-XXXX',
    bio: profileSettings.find(s => s.key === 'profile_bio')?.value || '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">프로필 설정</h1>
        <p className="text-muted-foreground">
          최범희 대표의 개인 프로필 정보를 수정합니다
        </p>
      </div>

      <ProfileForm initialData={profileData} />
    </div>
  );
}
