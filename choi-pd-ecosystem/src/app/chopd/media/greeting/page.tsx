import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '발행인 인사말',
};

export default function GreetingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-gradient-to-b from-green-50 to-background py-12">
        <div className="container">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/media">
              <ArrowLeft className="mr-2 h-4 w-4" />
              한국환경저널로 돌아가기
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">발행인 인사말</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            한국환경저널 발행인 최범희
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg mx-auto">
              <p className="lead text-xl text-muted-foreground">
                안녕하십니까, 한국환경저널 발행인 최범희입니다.
              </p>

              <div className="mt-8 space-y-6 text-muted-foreground">
                <p>
                  우리는 지금 기후변화, 환경오염, 생태계 파괴 등 전례 없는 환경
                  위기의 시대를 살고 있습니다. 이러한 문제들은 더 이상 먼 미래의
                  이야기가 아닌, 우리가 당장 직면한 현실입니다.
                </p>

                <p>
                  한국환경저널은 이러한 시대적 요구에 부응하여, 환경 문제에 대한
                  정확하고 심층적인 정보를 제공하고, 해결 방안을 모색하는
                  플랫폼으로서 창간되었습니다.
                </p>

                <p>
                  우리는 '대한민국 최고의 환경 파수꾼'이라는 슬로건 아래, 100인의
                  환경 전문가 네트워크와 함께 환경 이슈를 다각도로 분석하고
                  보도합니다. 단순한 뉴스 전달을 넘어, 환경 문제의 본질을 파악하고
                  지속 가능한 해결책을 제시하는 것이 우리의 사명입니다.
                </p>

                <p>
                  환경 문제는 우리 모두의 문제입니다. 정부, 기업, 시민사회가
                  함께 노력해야만 해결할 수 있습니다. 한국환경저널은 이들 간의
                  소통과 협력의 장을 마련하고, 환경 보전을 위한 사회적 공감대를
                  형성하는 데 기여하고자 합니다.
                </p>

                <p>
                  또한 저는 스마트폰 창업 교육자로서 5060 세대와 소상공인들에게
                  디지털 역량을 전수하는 일도 병행하고 있습니다. 이러한 경험을
                  바탕으로, 한국환경저널도 누구나 쉽게 접근하고 이해할 수 있는
                  환경 정보를 제공하기 위해 노력하고 있습니다.
                </p>

                <p>
                  지속 가능한 미래는 우리 모두가 함께 만들어가는 것입니다.
                  한국환경저널이 그 여정에 함께하는 믿음직한 동반자가 되겠습니다.
                </p>

                <p className="mt-8 text-right font-semibold not-italic">
                  한국환경저널 발행인
                  <br />
                  최범희
                </p>
              </div>
            </div>

            <div className="mt-12 border-t pt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild variant="outline">
                  <Link href="/media">한국환경저널 홈으로</Link>
                </Button>
                <Button asChild>
                  <Link href="/education">교육 과정 보기</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
