import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { SocialMediaForm } from '@/components/admin/SocialMediaForm';
import { decrypt } from '@/lib/crypto/encryption';

export default async function AdminSocialPage() {
  // 소셜 미디어 설정 가져오기
  const socialSettings = await db.query.settings.findMany({
    where: (settings, { inArray }) =>
      inArray(settings.key, [
        'social_facebook',
        'social_instagram',
        'social_youtube',
        'social_linkedin',
        'social_twitter',
        'social_blog',
        'social_facebook_password',
        'social_instagram_password',
        'social_youtube_password',
        'social_linkedin_password',
        'social_twitter_password',
        'social_blog_password',
      ])
  });

  const socialData = {
    facebook: socialSettings.find(s => s.key === 'social_facebook')?.value || '',
    instagram: socialSettings.find(s => s.key === 'social_instagram')?.value || '',
    youtube: socialSettings.find(s => s.key === 'social_youtube')?.value || '',
    linkedin: socialSettings.find(s => s.key === 'social_linkedin')?.value || '',
    twitter: socialSettings.find(s => s.key === 'social_twitter')?.value || '',
    blog: socialSettings.find(s => s.key === 'social_blog')?.value || '',
    facebook_password: socialSettings.find(s => s.key === 'social_facebook_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_facebook_password')!.value) : '',
    instagram_password: socialSettings.find(s => s.key === 'social_instagram_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_instagram_password')!.value) : '',
    youtube_password: socialSettings.find(s => s.key === 'social_youtube_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_youtube_password')!.value) : '',
    linkedin_password: socialSettings.find(s => s.key === 'social_linkedin_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_linkedin_password')!.value) : '',
    twitter_password: socialSettings.find(s => s.key === 'social_twitter_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_twitter_password')!.value) : '',
    blog_password: socialSettings.find(s => s.key === 'social_blog_password')?.value
      ? decrypt(socialSettings.find(s => s.key === 'social_blog_password')!.value) : '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">소셜 미디어 관리</h1>
        <p className="text-muted-foreground">
          소셜 미디어 계정 링크를 등록하고 관리합니다
        </p>
      </div>

      <SocialMediaForm initialData={socialData} />
    </div>
  );
}
